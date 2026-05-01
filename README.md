# Talkthrough v0

Voice-first scenario-based language learning. v0 = Kannada for English speakers, single user (you).

## Architecture in one paragraph

Expo React Native client connects via WebRTC to a local Pipecat server. Pipecat runs a single-stage pipeline using Gemini Live's native audio model (speech in → speech out, no separate STT/TTS). Scenarios live as JSON in `/content/kn-en/`. After a conversation ends, the transcript goes to Claude for grading. Local SQLite for progress; no auth, no cloud, no Supabase yet.

## Project layout

```
talkthrough-v0/
├── server/              # Pipecat + Gemini Live
│   ├── bot.py           # The pipeline. Start here.
│   ├── pyproject.toml
│   └── .env.example
├── client/              # Expo React Native app
│   └── screens/
│       └── ActiveRoleplayScreen.tsx  # The only screen that touches voice
└── content/
    └── kn-en/
        └── auto_rickshaw.json        # Scenario 1 of 6
```

## Phase 1 — get the pipeline running (this week)

```bash
cd server
cp .env.example .env  # then fill in GOOGLE_API_KEY
uv sync
uv run python bot.py
```

Server listens on `:7860`. Test it with Pipecat's web playground or the RN client below before building any other screens.

**Validation criteria for Phase 1:**
- Conversation in Kannada works end-to-end.
- P50 turn latency < 1.0s, P95 < 1.8s (Pipecat exposes these in metrics).
- Interruption (barge-in) works — you can talk over the agent.
- Agent stays in Kannada even when you flail in English.

If any of these fail, fix before moving on. Don't build screens on top of a broken loop.

## Phase 2 — RN client connecting (next week)

```bash
cd client
npx create-expo-app@latest . --template blank-typescript
npx expo install expo-dev-client
npm i @pipecat-ai/client-js @pipecat-ai/small-webrtc-transport
# Plus react-native-webrtc and its peer deps
npx expo run:ios   # or run:android — needs a dev build, not Expo Go
```

The `ActiveRoleplayScreen.tsx` in `client/screens/` is the starting point. Wire it into a stub navigator with placeholder Pathway/Briefing screens for now.

## Phase 3 — content + remaining screens

Six scenarios. Auto rickshaw is done; copy its structure for:
- `chai_stall.json` (beginner)
- `sabzi_mandi.json` (intermediate)
- `pharmacy.json` (intermediate)
- `landlord_call.json` (advanced)
- `doctor_visit.json` (advanced)

Then build Pathway, Briefing, Warm-Up, Review screens per the PRD section 6 specs.

## Phase 4 — grading

After `client.disconnect()`, the server has the transcript in `task.context.messages`. Pass it to Claude with the scenario's vocab + cultural tip + rubric, get structured JSON back, write to SQLite. Stub is in `bot.py` at the bottom of `run_bot`.

## Phase 5 — daily use

Use it. Every day. Take notes. The point of v0 isn't to be impressive — it's to learn whether the loop is worth scaling. Decide v1 from real evidence, not from how it felt to design.

## Vendor swap escape hatch

If Gemini Live disappoints, swap to Sarvam in `bot.py`:

```python
# Replace GeminiMultimodalLiveLLMService block with:
from pipecat.services.sarvam.stt import SarvamSTTService
from pipecat.services.sarvam.tts import SarvamTTSService
from pipecat.services.anthropic.llm import AnthropicLLMService

stt = SarvamSTTService(api_key=os.getenv("SARVAM_API_KEY"), language="kn-IN")
llm = AnthropicLLMService(api_key=os.getenv("ANTHROPIC_API_KEY"), model="claude-sonnet-4.5")
tts = SarvamTTSService(api_key=os.getenv("SARVAM_API_KEY"), voice_id="...")

pipeline = Pipeline([transport.input(), stt, llm, tts, transport.output()])
```

Three lines change. The RN client doesn't change at all. This is the value of putting Pipecat between you and the vendor.