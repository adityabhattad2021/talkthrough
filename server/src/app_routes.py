from __future__ import annotations

from pipecat.runner.run import app

from src.app_data import get_home_payload, get_scenario_payload, get_scenarios_payload
from src.scenarios import get_scenario


@app.get("/app/home")
async def app_home(language_id: str | None = None):
    return get_home_payload(language_id=language_id)


@app.get("/app/scenarios")
async def app_scenarios():
    return get_scenarios_payload()


@app.get("/app/scenarios/{scenario_id}")
async def app_scenario_detail(
    scenario_id: str,
    language_id: str | None = None,
    difficulty_id: str | None = None,
):
    return get_scenario_payload(
        get_scenario(scenario_id),
        language_id=language_id,
        difficulty_id=difficulty_id,
    )
