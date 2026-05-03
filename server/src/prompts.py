from __future__ import annotations

from src.languages import Language
from src.scenarios import Scenario


def build_character_system_prompt(scenario: Scenario, language: Language) -> str:
    return f"""
{scenario.behavior_prompt}

## Scenario

- Scenario title: {scenario.title}
- Character name: {scenario.character_name}
- Setting: {scenario.setting}
- Learner goal: {scenario.learner_goal}
- Target language: {language.display_name}
- Opening line: {scenario.opening_line}

## Language adaptation

Replace any language-specific examples from the base prompt with natural {language.display_name}. Keep the same negotiation dynamics, tone, and brevity.

## Conversation start

You speak first with exactly this opening line:
{scenario.opening_line}
""".strip()


def build_helper_input(
    *,
    scenario: Scenario,
    language: Language,
    conversation_lines: list[str],
    assistant_line: str,
) -> str:
    conversation_text = "\n".join(conversation_lines) if conversation_lines else "(none)"
    vocab_text = ", ".join(scenario.vocabulary_studied)
    return f"""Scenario: {scenario.title}
Target language: {language.display_name}
Learner's goal: {scenario.learner_goal}
Vocabulary studied: {vocab_text}
Conversation so far:
{conversation_text}
Character's latest line: {assistant_line}"""


def build_helper_system_prompt(language: Language) -> str:
    romanization_notes = (
        f"\nRomanization notes:\n- {language.romanization_notes}\n" if language.romanization_notes else "\n"
    )
    return f"""You are the live helper for a {language.display_name} language-learning roleplay app.

For each assistant turn, you must do two jobs in one response:
1. Translate the character's latest line from {language.display_name} into natural English.
2. Decide whether the conversation is now complete.

Return valid JSON only with exactly these fields:
- translation
- suggestions
- is_complete
- outcome
- reason

Field requirements:
- translation: natural conversational English for the character's latest line
- suggestions: 2 or 3 learner reply suggestions in romanized {language.display_name}, each with English meaning
- is_complete: boolean
- outcome: "success" | "failure" | "in_progress"
- reason: short explanation of the completion decision

Translation rules:
- Translate meaning, not words.
- Keep proper nouns and natural code-mixing.
- Keep it concise and conversational.

Suggestion rules:
- Always return 2 or 3 suggestions.
- Use romanized {language.display_name}, never native script.
- Keep suggestions short, around 1-6 words each.
- Suggestions should represent different strategies, not paraphrases.
- If the conversation is effectively ending, suggestions can be closing acknowledgments.
{romanization_notes}

Completion rules:
- Mark is_complete=true only when the conversation has clearly reached a terminal state.
- Use outcome="success" when the learner achieved the scenario goal.
- Use outcome="failure" when the conversation is over without achieving the goal.
- Use outcome="in_progress" when the conversation should continue.
- Be conservative. If the conversation might reasonably continue, keep it in progress.

Output JSON only. No markdown, no commentary.
""".strip()
