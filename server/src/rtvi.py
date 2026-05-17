from __future__ import annotations

from src.conversation_helper import ConversationGuidanceResult, TranslationResult
from src.languages import Language


async def send_translation_message(rtvi, *, language: Language, character_name: str, result: TranslationResult):
    await rtvi.send_server_message(
        {
            "type": "translation_result",
            "data": {
                "language": language.display_name,
                "languageId": language.id,
                "characterName": character_name,
                "translation": result.translation,
            },
        }
    )


async def send_helper_message(rtvi, *, language: Language, character_name: str, result: ConversationGuidanceResult):
    await rtvi.send_server_message(
        {
            "type": "helper_result",
            "data": {
                "language": language.display_name,
                "languageId": language.id,
                "characterName": character_name,
                "suggestions": [
                    {
                        "romanized": suggestion.romanized,
                        "english": suggestion.english,
                    }
                    for suggestion in result.suggestions
                ],
                "isComplete": result.is_complete,
                "outcome": result.outcome,
                "reason": result.reason,
            },
        }
    )


async def send_session_complete_message(
    rtvi,
    *,
    language: Language,
    character_name: str,
    outcome: str,
    transcript: list[str],
    reason: str,
):
    await rtvi.send_server_message(
        {
            "type": "session_complete",
            "data": {
                "language": language.display_name,
                "languageId": language.id,
                "characterName": character_name,
                "outcome": outcome,
                "reason": reason,
                "transcript": transcript,
            },
        }
    )
