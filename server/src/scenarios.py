from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from loguru import logger


SCENARIOS_DIR = Path(__file__).resolve().parent.parent / "scenarios"
DEFAULT_SCENARIO_ID = "auto-rickshaw"


@dataclass(frozen=True)
class Scenario:
    id: str
    title: str
    character_name: str
    default_language: str
    setting: str
    learner_goal: str
    vocabulary_studied: list[str]
    opening_line: str
    behavior_prompt: str
    difficulty: str


def _scenario_from_dict(data: dict) -> Scenario:
    return Scenario(
        id=str(data["id"]),
        title=str(data["title"]),
        character_name=str(data["character_name"]),
        default_language=str(data["default_language"]),
        setting=str(data["setting"]),
        learner_goal=str(data["learner_goal"]),
        vocabulary_studied=[str(item) for item in data["vocabulary_studied"]],
        opening_line=str(data["opening_line"]),
        behavior_prompt=str(data["behavior_prompt"]),
        difficulty=str(data.get("difficulty", "unknown")),
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
    
    logger.info("Scenario ID requested:", scenario_id)
    return scenarios.get(scenario_id, scenarios[DEFAULT_SCENARIO_ID])
