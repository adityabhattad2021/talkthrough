from __future__ import annotations

from fastapi.responses import HTMLResponse
from pipecat.runner.run import app

from src.app_data import get_scenario_payload
from src.scenarios import get_scenario
from src.debug_client import DEBUG_CLIENT_HTML


@app.get("/debug-client", include_in_schema=False)
async def debug_client() -> HTMLResponse:
    return HTMLResponse(DEBUG_CLIENT_HTML)


@app.get("/scenario-details")
async def get_scenario_details(
    id: str,
    language_id: str | None = None,
    difficulty_id: str | None = None,
):
    return get_scenario_payload(
        get_scenario(id),
        language_id=language_id,
        difficulty_id=difficulty_id,
    )
