from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any

from loguru import logger
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.frames.frames import LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    AssistantTurnStoppedMessage,
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
    UserTurnStoppedMessage,
)
from pipecat.runner.types import RunnerArguments, SmallWebRTCRunnerArguments
from pipecat.services.google.gemini_live.llm import GeminiLiveLLMService, GeminiModalities
from pipecat.transports.base_transport import BaseTransport, TransportParams
from pipecat.transports.smallwebrtc.connection import SmallWebRTCConnection
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport

from src.config import Settings, load_settings
from src.conversation_helper import ConversationHelper
from src.languages import Language, get_language
from src.prompts import build_character_system_prompt
from src.rtvi import send_helper_message, send_session_complete_message
from src.scenarios import Scenario, get_scenario


@dataclass
class SessionState:
    scenario: Scenario
    language: Language
    conversation_lines: list[str] = field(default_factory=list)
    completed: bool = False


def _extract_request_data(body: Any) -> dict[str, Any]:
    if body is None:
        return {}
    if isinstance(body, dict):
        nested = body.get("request_data") or body.get("requestData")
        if isinstance(nested, dict):
            return nested
        return body

    request_data = getattr(body, "request_data", None)
    if request_data is not None:
        return request_data

    request_data = getattr(body, "requestData", None)
    if request_data is not None:
        return request_data

    return {}


def _create_transport(runner_args: RunnerArguments) -> BaseTransport | None:
    match runner_args:
        case SmallWebRTCRunnerArguments():
            webrtc_connection: SmallWebRTCConnection = runner_args.webrtc_connection
            return SmallWebRTCTransport(
                webrtc_connection=webrtc_connection,
                params=TransportParams(
                    audio_in_enabled=True,
                    audio_out_enabled=True,
                ),
            )
        case _:
            logger.error(f"Unsupported runner arguments type: {type(runner_args)}")
            return None


async def _run_session(
    *,
    transport: BaseTransport,
    settings: Settings,
    scenario: Scenario,
    language: Language,
) -> None:
    logger.info(f"Starting roleplay session for scenario={scenario.id} language={language.id}")

    llm = GeminiLiveLLMService(
        api_key=settings.google_api_key,
        settings=GeminiLiveLLMService.Settings(
            model=settings.live_model,
            voice=settings.live_voice_id,
            modalities=GeminiModalities.AUDIO,
            system_instruction=build_character_system_prompt(scenario, language),
        ),
    )

    context = LLMContext()
    user_aggregator, assistant_aggregator = LLMContextAggregatorPair(
        context,
        user_params=LLMUserAggregatorParams(vad_analyzer=SileroVADAnalyzer()),
    )

    pipeline = Pipeline(
        [
            transport.input(),
            user_aggregator,
            llm,
            transport.output(),
            assistant_aggregator,
        ]
    )

    task = PipelineTask(
        pipeline,
        params=PipelineParams(enable_metrics=True, enable_usage_metrics=True),
    )

    state = SessionState(scenario=scenario, language=language)
    helper = ConversationHelper(settings)

    @task.rtvi.event_handler("on_client_ready")
    async def on_client_ready(rtvi):
        context.add_message(
            {
                "role": "user",
                "content": (
                    "Start the roleplay now. Speak first with your required opening line and stay in character."
                ),
            }
        )
        await task.queue_frames([LLMRunFrame()])

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info("Client connected")

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info("Client disconnected")
        await task.cancel()

    @user_aggregator.event_handler("on_user_turn_stopped")
    async def on_user_turn_stopped(aggregator, strategy, message: UserTurnStoppedMessage):
        if state.completed:
            return

        timestamp = f"[{message.timestamp}] " if message.timestamp else ""
        line = f"{timestamp}user: {message.content}"
        state.conversation_lines.append(f"Learner: {message.content}")
        logger.info(f"Transcript: {line}")

    @assistant_aggregator.event_handler("on_assistant_turn_stopped")
    async def on_assistant_turn_stopped(aggregator, message: AssistantTurnStoppedMessage):
        if state.completed:
            return

        timestamp = f"[{message.timestamp}] " if message.timestamp else ""
        line = f"{timestamp}assistant: {message.content}"
        state.conversation_lines.append(f"{scenario.character_name}: {message.content}")
        logger.info(f"Transcript: {line}")

        try:
            result = await helper.analyze_turn(
                scenario=scenario,
                language=language,
                conversation_lines=state.conversation_lines,
                assistant_line=message.content,
            )
        except Exception:
            logger.exception("Failed to analyze assistant turn")
            return

        try:
            await send_helper_message(
                task.rtvi,
                language=language,
                character_name=scenario.character_name,
                result=result,
            )
        except Exception:
            logger.exception("Failed to send helper payload")

        if not result.is_complete:
            return

        state.completed = True
        logger.info(
            "Conversation completed via judge: outcome={} reason={}",
            result.outcome,
            result.reason,
        )

        try:
            await send_session_complete_message(
                task.rtvi,
                language=language,
                character_name=scenario.character_name,
                outcome=result.outcome,
                transcript=state.conversation_lines.copy(),
                reason=result.reason,
            )
        except Exception:
            logger.exception("Failed to send session completion payload")

        async def stop_session():
            await asyncio.sleep(1.0)
            await task.cancel()

        asyncio.create_task(stop_session())

    runner = PipelineRunner(handle_sigint=False)
    await runner.run(task)


async def bot_main(runner_args: RunnerArguments):
    settings = load_settings()
    transport = _create_transport(runner_args)
    if not transport:
        return

    request_data = _extract_request_data(runner_args.body)
    scenario = get_scenario(request_data.get("scenario_id"))
    language = get_language(request_data.get("language") or scenario.default_language_id)

    await _run_session(
        transport=transport,
        settings=settings,
        scenario=scenario,
        language=language,
    )
