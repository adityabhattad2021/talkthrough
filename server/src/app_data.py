from __future__ import annotations

from src.languages import get_language, list_languages
from src.scenarios import Scenario, list_scenarios


DIFFICULTY_OPTIONS = [
    {
        "id": "easy",
        "label": "Easy",
        "description": "Patient, cooperative, easier to persuade.",
        "tag": "Scaffolded",
    },
    {
        "id": "medium",
        "label": "Medium",
        "description": "Pragmatic, resistant when it makes sense.",
        "tag": "Default",
    },
    {
        "id": "hard",
        "label": "Hard",
        "description": "Sharper agenda, tougher to win over.",
    },
]


def _scenario_summary(scenario: Scenario) -> dict:
    return {
        "id": scenario.id,
        "title": scenario.title,
        "blurb": scenario.blurb,
        "characterName": scenario.character_name,
        "characterRole": scenario.character_role,
        "estimatedMinutes": scenario.estimated_minutes,
        "glyph": scenario.glyph,
    }


def get_home_payload(*, language_id: str | None = None) -> dict:
    language = get_language(language_id)
    scenarios = list_scenarios()

    return {
        "user": {
            "firstName": "Aditya",
        },
        "language": {
            "code": language.id,
            "label": language.display_name,
        },
        "streakCount": 6,
        "recommendedScenarioId": "sabzi-mandi",
        "scenarios": [_scenario_summary(scenario) for scenario in scenarios],
        "difficultyOptions": DIFFICULTY_OPTIONS,
    }


def get_scenarios_payload() -> list[dict]:
    return [_scenario_summary(scenario) for scenario in list_scenarios()]


def get_scenario_payload(
    scenario: Scenario,
    *,
    language_id: str | None = None,
    difficulty_id: str | None = None,
) -> dict:
    language = get_language(language_id or scenario.default_language_id)
    difficulty = scenario.get_difficulty(difficulty_id)

    return {
        **_scenario_summary(scenario),
        "defaultLanguageId": scenario.default_language_id,
        "supportedLanguages": [
            {
                "id": language_item.id,
                "label": language_item.display_name,
            }
            for language_item in list_languages()
            if language_item.id in scenario.supported_language_ids
        ],
        "selectedLanguageId": language.id,
        "selectedDifficultyId": difficulty.id,
        "setting": scenario.setting,
        "pragmaticTip": scenario.pragmatic_tip,
        "learnerGoal": scenario.learner_goal,
        "openingLine": scenario.get_opening_line(language.id),
        "characterAgenda": scenario.character_agenda,
        "characterPersonality": scenario.character_personality,
        "speechStyle": scenario.speech_style,
        "successConditions": scenario.success_conditions,
        "failureConditions": scenario.failure_conditions,
        "vocabulary": [
            {
                "romanized": item.romanized,
                "nativeScript": item.native_script,
                "english": item.english,
                "context": item.context,
            }
            for item in scenario.vocabulary
        ],
        "difficulties": {
            difficulty_item.id: {
                "id": difficulty_item.id,
                "label": difficulty_item.label,
                "description": difficulty_item.description,
                "agentTemperament": difficulty_item.agent_temperament,
                "friction": difficulty_item.friction,
                "decisionRules": difficulty_item.decision_rules,
            }
            for difficulty_item in scenario.difficulties.values()
        },
    }
