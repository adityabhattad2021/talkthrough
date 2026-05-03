from __future__ import annotations

import asyncio
from dataclasses import dataclass

from google import genai
from google.genai import types

from src.config import Settings
from src.languages import Language
from src.prompts import build_helper_input, build_helper_system_prompt
from src.scenarios import Scenario


@dataclass(frozen=True)
class Suggestion:
    romanized: str
    english: str


@dataclass(frozen=True)
class ConversationHelperResult:
    translation: str
    suggestions: list[Suggestion]
    is_complete: bool
    outcome: str
    reason: str


class ConversationHelper:
    def __init__(self, settings: Settings):
        self._settings = settings
        self._client = genai.Client(api_key=settings.google_api_key)

    async def analyze_turn(
        self,
        *,
        scenario: Scenario,
        language: Language,
        conversation_lines: list[str],
        assistant_line: str,
    ) -> ConversationHelperResult:
        return await asyncio.to_thread(
            self._analyze_turn_sync,
            scenario,
            language,
            conversation_lines,
            assistant_line,
        )

    def _analyze_turn_sync(
        self,
        scenario: Scenario,
        language: Language,
        conversation_lines: list[str],
        assistant_line: str,
    ) -> ConversationHelperResult:
        response = self._client.models.generate_content(
            model=self._settings.helper_model,
            contents=build_helper_input(
                scenario=scenario,
                language=language,
                conversation_lines=conversation_lines,
                assistant_line=assistant_line,
            ),
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(
                    thinking_level=self._settings.helper_thinking_level,
                ),
                response_mime_type="application/json",
                response_schema=types.Schema(
                    type=types.Type.OBJECT,
                    required=["translation", "suggestions", "is_complete", "outcome", "reason"],
                    properties={
                        "translation": types.Schema(type=types.Type.STRING),
                        "suggestions": types.Schema(
                            type=types.Type.ARRAY,
                            items=types.Schema(
                                type=types.Type.OBJECT,
                                required=["romanized", "english"],
                                properties={
                                    "romanized": types.Schema(type=types.Type.STRING),
                                    "english": types.Schema(type=types.Type.STRING),
                                },
                            ),
                        ),
                        "is_complete": types.Schema(type=types.Type.BOOLEAN),
                        "outcome": types.Schema(
                            type=types.Type.STRING,
                            enum=["success", "failure", "in_progress"],
                        ),
                        "reason": types.Schema(type=types.Type.STRING),
                    },
                ),
                system_instruction=build_helper_system_prompt(language),
            ),
        )

        parsed = response.parsed
        if not parsed:
            raise ValueError("Conversation helper returned no parsed JSON payload")

        suggestions = [
            Suggestion(
                romanized=item["romanized"].strip(),
                english=item["english"].strip(),
            )
            for item in parsed["suggestions"]
        ]

        return ConversationHelperResult(
            translation=parsed["translation"].strip(),
            suggestions=suggestions,
            is_complete=bool(parsed["is_complete"]),
            outcome=str(parsed["outcome"]).strip(),
            reason=str(parsed["reason"]).strip(),
        )
