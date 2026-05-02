from __future__ import annotations

from fastapi.responses import HTMLResponse
from pipecat.runner.run import app

from src.debug_client import DEBUG_CLIENT_HTML


@app.get("/debug-client", include_in_schema=False)
async def debug_client() -> HTMLResponse:
    return HTMLResponse(DEBUG_CLIENT_HTML)
