from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from loguru import logger


SCENARIOS_DIR = Path(__file__).resolve().parent.parent / "scenarios"
DEFAULT_SCENARIO_ID = "auto-rickshaw"
DIFFICULTY_IDS = ("easy", "medium", "hard")


@dataclass(frozen=True)
class VocabularyItem:
    romanized: str
    native_script: str
    english: str
    context: str


@dataclass(frozen=True)
class DifficultyBehavior:
    id: str
    label: str
    description: str
    agent_temperament: str
    friction: str
    decision_rules: str


@dataclass(frozen=True)
class Scenario:
    id: str
    title: str
    blurb: str
    character_name: str
    character_role: str
    glyph: str
    estimated_minutes: str
    default_language_id: str
    supported_language_ids: list[str]
    setting: str
    pragmatic_tip: str
    learner_goal: str
    vocabulary: list[VocabularyItem]
    opening_lines: dict[str, str]
    character_agenda: str
    character_personality: str
    speech_style: str
    success_conditions: list[str]
    failure_conditions: list[str]
    difficulties: dict[str, DifficultyBehavior]

    def get_opening_line(self, language_id: str) -> str:
        return self.opening_lines.get(language_id) or self.opening_lines.get(self.default_language_id, "")

    def get_difficulty(self, difficulty_id: str | None) -> DifficultyBehavior:
        if not difficulty_id:
            return self.difficulties["medium"]

        normalized = difficulty_id.strip().lower()
        return self.difficulties.get(normalized, self.difficulties["medium"])


def _vocabulary_item_from_dict(data: dict) -> VocabularyItem:
    return VocabularyItem(
        romanized=str(data["romanized"]),
        native_script=str(data["native_script"]),
        english=str(data["english"]),
        context=str(data["context"]),
    )


def _difficulty_from_dict(difficulty_id: str, data: dict) -> DifficultyBehavior:
    return DifficultyBehavior(
        id=difficulty_id,
        label=str(data["label"]),
        description=str(data["description"]),
        agent_temperament=str(data["agent_temperament"]),
        friction=str(data["friction"]),
        decision_rules=str(data["decision_rules"]),
    )


def _scenario_from_dict(data: dict) -> Scenario:
    difficulties = {
        difficulty_id: _difficulty_from_dict(difficulty_id, difficulty_data)
        for difficulty_id, difficulty_data in data["difficulties"].items()
    }

    missing_difficulties = [difficulty_id for difficulty_id in DIFFICULTY_IDS if difficulty_id not in difficulties]
    if missing_difficulties:
        raise ValueError(f"Scenario '{data['id']}' is missing difficulties: {', '.join(missing_difficulties)}")

    return Scenario(
        id=str(data["id"]),
        title=str(data["title"]),
        blurb=str(data["blurb"]),
        character_name=str(data["character_name"]),
        character_role=str(data["character_role"]),
        glyph=str(data["glyph"]),
        estimated_minutes=str(data["estimated_minutes"]),
        default_language_id=str(data["default_language_id"]),
        supported_language_ids=[str(item) for item in data["supported_language_ids"]],
        setting=str(data["setting"]),
        pragmatic_tip=str(data["pragmatic_tip"]),
        learner_goal=str(data["learner_goal"]),
        vocabulary=[_vocabulary_item_from_dict(item) for item in data["vocabulary"]],
        opening_lines={str(key): str(value) for key, value in data["opening_lines"].items()},
        character_agenda=str(data["character_agenda"]),
        character_personality=str(data["character_personality"]),
        speech_style=str(data["speech_style"]),
        success_conditions=[str(item) for item in data["success_conditions"]],
        failure_conditions=[str(item) for item in data["failure_conditions"]],
        difficulties=difficulties,
    )


@lru_cache(maxsize=1)
def load_scenarios() -> dict[str, Scenario]:
    scenarios: dict[str, Scenario] = {}

    for path in sorted(SCENARIOS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        scenario = _scenario_from_dict(data)
        scenarios[scenario.id] = scenario

    if DEFAULT_SCENARIO_ID not in scenarios:
        raise ValueError(f"Default scenario '{DEFAULT_SCENARIO_ID}' was not found in {SCENARIOS_DIR}")

    return scenarios


def list_scenarios() -> list[Scenario]:
    return list(load_scenarios().values())


def get_scenario(scenario_id: str | None) -> Scenario:
    scenarios = load_scenarios()
    logger.info(f"Available scenarios: {list(scenarios.keys())}")
    logger.info(f"Requested scenario ID: {scenario_id}")
    if not scenario_id:
        return scenarios[DEFAULT_SCENARIO_ID]

    return scenarios.get(scenario_id, scenarios[DEFAULT_SCENARIO_ID])
