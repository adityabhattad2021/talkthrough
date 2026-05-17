from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    google_api_key: str
    live_model: str
    helper_model: str
    live_voice_id: str
    helper_thinking_level: str


def _clean_env(name: str, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise ValueError(f"Missing required environment variable: {name}")
    return value.strip().strip("\"'")


def load_settings() -> Settings:
    return Settings(
        google_api_key=_clean_env("GOOGLE_API_KEY"),
        live_model=_clean_env("GOOGLE_MODEL", "models/gemini-3.1-flash-live-preview"),
        helper_model=_clean_env("GOOGLE_HELPER_MODEL", "models/gemini-3.1-flash-lite"),
        live_voice_id=_clean_env("GOOGLE_VOICE_ID", "Charon"),
        helper_thinking_level=_clean_env("GOOGLE_HELPER_THINKING_LEVEL", "MINIMAL"),
    )
