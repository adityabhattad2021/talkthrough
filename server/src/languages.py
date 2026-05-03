from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


LANGUAGES_DIR = Path(__file__).resolve().parent.parent / "languages"
DEFAULT_LANGUAGE_ID = "marathi"


@dataclass(frozen=True)
class Language:
    id: str
    display_name: str
    english_name: str
    romanization_notes: str


def _language_from_dict(data: dict) -> Language:
    return Language(
        id=str(data["id"]),
        display_name=str(data["display_name"]),
        english_name=str(data["english_name"]),
        romanization_notes=str(data.get("romanization_notes", "")),
    )


@lru_cache(maxsize=1)
def load_languages() -> dict[str, Language]:
    languages: dict[str, Language] = {}

    for path in sorted(LANGUAGES_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        language = _language_from_dict(data)
        languages[language.id] = language

    if DEFAULT_LANGUAGE_ID not in languages:
        raise ValueError(f"Default language '{DEFAULT_LANGUAGE_ID}' was not found in {LANGUAGES_DIR}")

    return languages


def list_languages() -> list[Language]:
    return list(load_languages().values())


def get_language(language_value: str | None) -> Language:
    languages = load_languages()
    if not language_value:
        return languages[DEFAULT_LANGUAGE_ID]

    normalized = language_value.strip().lower().replace("_", "-")
    for language in languages.values():
        if normalized in {
            language.id.lower(),
            language.display_name.lower(),
            language.english_name.lower(),
        }:
            return language

    return languages[DEFAULT_LANGUAGE_ID]
