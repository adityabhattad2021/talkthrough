# Talkthrough — PRD v1

**Product:** Voice-first, scenario-based language learning app
**Version:** v0 (MVP)
**Last updated:** April 10, 2026
**Philosophy:** Situated fluency over abstract fluency. The conversation is the curriculum.

---

## 1. Problem

I'm in Bangalore and I can't speak Kannada. Not enough to negotiate with my auto driver, not enough to chat with my landlord, not enough to order at the dosa place down the street without defaulting to English. School-format apps teach me grammar I don't need. Cloud chatbots cost a subscription and don't sound like the people I'm actually trying to talk to. There's no app that puts me in the specific situations of daily Bangalore life, lets me fail safely, and tells me what I should have said.

This is a problem millions of people in India face — domestic migrants between states, expats settling in cities, anyone who needs to live in a language they didn't grow up speaking. v0 solves it for one user (me) so we can find out if the product idea actually works before solving it for everyone else.

## 2. Solution

A voice-first, scenario-based language learning app powered by a real-time conversational AI agent.

Each scenario is a contained, real-world Bangalore situation (auto rickshaw, chai stall, sabzi mandi, pharmacy, landlord call, doctor visit). The user prepares with cultural context and key vocabulary, then enters a real-time voice conversation with an AI character speaking Kannada at a calibrated difficulty level, then receives targeted feedback on what they said, how they said it, and whether it was culturally appropriate.

The thesis: *situated fluency beats abstract fluency.* You learn the language faster when you're trying to do the actual thing you'd do in the actual situation. The moat isn't the AI — anyone can wire up an API. The moat is the curriculum: situations chosen for their actual frequency in daily life, agent characters tuned for the specific register and pace of those situations, and a feedback layer that grades cultural appropriateness, not just grammar.

## 3. Target Users

**v0 — me.** Single user. English-speaking adult in Bangalore who wants to learn Kannada for daily life. The app exists to test whether the core loop works for one motivated learner before investing in serving anyone else.

**v1 — Indic learners broadly.** Expats and long-term visitors in Indian cities. Domestic migrants between states. Indians learning a second Indian language for work, study, or relocation. Added once the v0 loop is proven, alongside auth, multi-user state, and content for additional Indic language pairs.

**v2 and beyond — non-Indic markets.** French, Spanish, etc. for English speakers. Likely on a different vendor stack (ElevenLabs Conversational AI is well-suited). v0 deliberately doesn't try to serve these audiences yet.

## 4. Core Experience

On first launch, a three-screen onboarding sets the tone, confirms the language pair, and asks for a name. Takes 30 seconds. Then the user is on the Pathway and never sees onboarding again.

The app is structured as a linear journey through progressively complex real-world scenarios. The user moves through five screens per scenario:

**The Pathway → Scenario Briefing → Vocab Warm-Up → Active Roleplay → After-Action Review**

The Warm-Up is the critical bridge. The Briefing gives you context; the Warm-Up puts the words in your mouth. Without it, a user with zero Kannada is staring at a mic with nothing to say. With it, they've heard, repeated, and used the 6–8 key phrases at least once — enough to survive the conversation.

This loop is the entire product. There are no side quests, no social features, no leaderboards. The pathway is the curriculum.

## 5. v0 Scope

### 5.1 What ships

**One language pair:**
- **Kannada for English speakers.** Single pair, single vendor, single architecture, single user.

**Six scenarios across three difficulty tiers:**

| Tier | Scenario | Key interaction |
|---|---|---|
| Beginner | Auto Rickshaw | Negotiate a fare, give directions |
| Beginner | Chai Stall | Order, make small talk |
| Intermediate | Sabzi Mandi | Ask prices, bargain, count |
| Intermediate | Pharmacy | Describe symptoms, understand dosage |
| Advanced | Landlord Call | Discuss a maintenance issue |
| Advanced | Doctor Visit | Describe medical history, ask questions |

**Five screens, fully functional** (specs in Section 6).

**Infrastructure:** Cloud-based real-time voice agent (Gemini Live via Pipecat). Local SQLite for state. Requires internet during roleplay; Briefing and Warm-Up cache content for offline use.

### 5.2 Explicitly out of scope for v0

- Authentication and accounts. Local-only state.
- Multi-user data, cloud sync, telemetry, leaderboards, streaks-as-gamification.
- Multiple language pairs.
- Monetization. The app is free; there is no customer because there is no customer yet.
- App Store / Play Store distribution. Side-loaded via Expo dev build to your own device.
- Dark mode. Light mode only.
- Illustrations and decorative graphics.

These are added in v1 after the core loop is proven for one user.

---

## 6. Screen Specifications

### 6.0 Onboarding (First Launch Only)

Three screens, shown once. No skip button — this is a 30-second flow.

**Screen 1 — Narrative.** Full-screen, centered text on `bone`. No inputs, no illustration. A short, direct statement:

> *You don't need to study a language. You need to live in one. This app puts you in real conversations with an AI that speaks Kannada like the people around you.*

Single CTA at the bottom: "Let's go."

**Screen 2 — Language confirmation.** Heading: "You're learning Kannada." Subtitle: "More languages coming." Single CTA: "Continue."

(In v0 there's only one pair, so this is confirmation, not selection. The screen exists so v1 can drop a selector in without restructuring the flow.)

**Screen 3 — Name.** Heading: "What should I call you?" Single text input, auto-focused. CTA enabled when non-empty: "Start my journey." Saves `user_name` to local SQLite. Transitions to The Pathway.

### 6.1 The Pathway (Home)

**Layout:** Fixed 64px header with bottom border. Vertically scrolling body. Centered 1px vertical timeline in `stone`.

**Header:** Left-aligned greeting ("Namaste, {name}"). Right-aligned streak counter with a subtle flame icon — one of the few places sage appears in chrome.

**Nodes:** 48×48px circles positioned on the timeline.
- **Locked:** stone fill, no border, ash icon.
- **Active:** bone fill, sage-500 1.5px border, ink icon.
- **Completed:** sage-500 fill, paper checkmark.

**Interaction:** Tapping an active or completed node opens a bottom sheet with scenario name, one-line description, and a Begin or Retry CTA.

### 6.2 Scenario Briefing

**Layout:** Scrollable stack with fixed bottom CTA bar. No hero illustration in v0 — the scenario title in Heading size is the visual.

**Elements (top to bottom):**
- Scenario title (Heading style, 22px Inter Medium).
- Cultural context card: paper surface, 0.5px ink border at 8% opacity, 16px radius. Heading "The Pragmatic Tip" in title style. Body in 16px Inter Regular.
- Vocabulary section: flex-wrap chips. Each chip shows the word in Kannada script, romanized transliteration below, paper background, 0.5px border, 12px radius. Tap to hear pronunciation.
- Fixed bottom: 56px sage-500 primary button, "Continue to Warm-Up."

### 6.3 Vocab Warm-Up

**Purpose:** Get the key phrases into short-term memory so the user isn't silent in the roleplay. A warm-up, not a test.

**Layout:** Full-screen card carousel. One phrase per card. Fixed bottom progress dots and Next button.

**Card anatomy:**
- Target phrase in Kannada script (Title style, centered).
- Romanized transliteration below (Caption, fog).
- English meaning (Caption, fog).
- Speaker icon: tap to hear TTS pronounce the phrase. Auto-plays on card entry.
- Mic icon: press and hold to repeat. Native STT listens; on release, a checkmark confirms it heard something reasonable. No strict grading.
- Context line (Caption, italic): one-line example from the scenario.

**Final card:** "You're ready." Full-width sage CTA: "Start Roleplay."

**No gamification on this screen.** No points, no stars, no streaks. The warm-up should feel like a quick stretch before a run, not a quiz.

### 6.4 Active Roleplay

**Layout:** Maximally minimal. Top bar and pulse only.

**Top bar:** 56px. Close (×) on left. Scenario title centered (Title style). End text button on right.

**Center:** 120×120px breathing pulse with two soft halos.
- **AI speaking:** sage-500 fill, sage halos.
- **AI listening:** ink fill, ink halos.
- The pulse breathes at 0.5Hz (2-second loop), scaling 1.0 → 1.06 → 1.0. Slow enough to feel alive, never anxious.

**Below the pulse:** Character name in Micro style (uppercase, tracked) — e.g., "RAVI."

**Bottom 30%:** Last 3 transcript lines. User in ink, AI in sage-500. Title size, 1.35 line height.

**No mic button.** Gemini Live's VAD handles turn-taking — the user just talks. This is a deliberate departure from the original press-and-hold design; the magic of Gemini Live is that you don't think about when to talk.

**States:**
- Connecting: pulse static, "Connecting" label.
- Live: pulse breathing, character name shown.
- Error: ink error message, end button to retry.

### 6.5 After-Action Review

**Layout:** Scrollable body, fixed bottom CTA.

**Score ring:** 160px circular gauge, centered. 4px stroke. Sage-200 track, sage-500 fill. Fills with spring motion on screen entry, slight overshoot before settling. Percentage in Display style inside, with tabular numerals.

**Feedback cards:** Three paper cards with 0.5px ink borders at 8%, 16px radius, 20px padding, 12px vertical gap.
- **Pronunciation:** Lists flagged words. Each shows what was detected (struck through) → correct pronunciation. Tap play icon to hear correct version.
- **Vocabulary Used:** Which briefing vocab the user successfully deployed, and which were missed.
- **Cultural Etiquette:** Contextual notes (e.g., "You jumped to price before greeting — starting with 'anna' would have set a better tone.").

**CTA:** Sage primary button, "Continue Journey." Returns to Pathway with the next node unlocked.

---

## 7. Design System

See `DESIGN_SYSTEM.md` for the full spec. Summary:

**Direction:** Studio Calm. Restraint as personality. One color does one thing. Motion is the playfulness.

**Core palette:**
- `bone` (#F4F4F1) — app background
- `paper` (#FFFFFF) — card surfaces
- `ink` (#1A1A1A) — primary text
- `sage-500` (#6A8A6C) — the only chromatic color, used for AI voice, active states, success
- Plus supporting neutrals (`stone`, `mist`, `slate`, `fog`, `ash`)

**Typography:** Inter, two weights (400, 500), six sizes. Kannada script falls through to system font.

**Motion:** Three primitives. Spring (transitions, 22 damping / 280 stiffness / 0.8 mass), Breath (sustained pulse, 2s loop), Snap (immediate feedback, 120ms).

**No illustrations, no dark mode, no additional colors in v0.** These are the decisions most likely to be tempted out of in week 3; resist.

---

## 8. Technical Architecture

### 8.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Client | React Native via Expo (dev build, not Expo Go) | Mobile-first product; dev build for native audio + WebRTC |
| Voice transport | Pipecat React Native SDK + SmallWebRTC (dev) / Daily (production) | Industry-standard WebRTC pipeline; mature SDK |
| Pipeline orchestration | Pipecat (Python, single VM) | Open-source; Gemini Live plugin first-class supported |
| Voice engine | Gemini Live API (gemini-2.5-flash-native-audio) | Speech-to-speech in one model; sub-second turn-taking; affective dialog; Kannada quality validated empirically |
| Local state | SQLite via Expo SQLite | No auth, no cloud at v0 |
| Grading (post-call) | Claude Sonnet via API | Reasoning-heavy, separate from real-time pipeline |
| Server hosting | Single small VM in India region (DigitalOcean BLR or AWS Mumbai) | One user, one process, minimal infra |

### 8.2 Why Gemini Live (not Sarvam, not ElevenLabs)

This decision was empirical. After exploring Sarvam (best Indic-specialist option) and ElevenLabs (fastest to ship), Gemini Live's in-app voice chat was tested directly in Kannada and the quality was strong enough to commit. Three reasons it wins for v0:

1. **Speech-to-speech architecture preserves prosody.** Pipelined STT → LLM → TTS loses tone, hesitation, emphasis. Gemini Live processes raw audio and outputs raw audio, capturing the affect that makes conversation feel real.
2. **The "magic" you build matters.** The product hypothesis is that AI conversation can feel like real conversation. Building on a stack that already feels that way is the right starting point.
3. **Pipecat keeps it swappable.** If Gemini Live disappoints in production, swap to Sarvam (STT + TTS + LLM) in three lines of pipeline config. The RN client doesn't change.

### 8.3 Data flow

A scenario session has three phases:

**Pre-conversation.** Client loads scenario from local content (`/content/kn-en/{id}.json`): briefing copy, vocab list, cultural tip, agent system prompt, voice ID. Renders Briefing → Warm-Up. Warm-Up uses Gemini's standalone TTS endpoint for phrase playback (cheaper than spinning up an agent session) and the device's native STT for repeat-back confirmation.

**Conversation.** Client opens WebRTC connection to the Pipecat server with `scenario_id` as a connect parameter. Server loads the scenario config and constructs the system prompt. Pipecat pipes audio through Gemini Live: the model processes incoming audio, generates a response, and streams audio back. Pipecat exposes both user and assistant transcripts via callbacks; client renders them live in the transcript area.

**Post-conversation.** On `endSession`, the Pipecat server has the full transcript in `task.context.messages`. Server calls Claude Sonnet with the transcript + scenario metadata + structured grading prompt. Returns JSON matching the `reviews` schema. Client polls or subscribes via SSE; renders After-Action Review when ready (typically 3-5 seconds).

### 8.4 Latency budget and streaming architecture

Conversation latency is the thing that makes v0 succeed or fail. Real human conversations have ~300ms gaps between turns. Voice apps at 800ms feel alive. At 1.2s they feel okay. At 2s the user assumes the AI is broken.

**Targets:**
- P50 turn latency (end-of-speech to first AI audio): <1.0s
- P95 turn latency: <1.8s
- WebRTC drop rate: <2% of sessions

Gemini Live's native audio model handles all four traditional pipeline stages (STT, LLM thinking, TTS, audio streaming) internally as a single model call. There's no STT-then-LLM-then-TTS sequencing to optimize; the model takes audio and produces audio. Pipecat manages the WebRTC transport and pipeline metrics.

**What can break it on the client side:**
- Server in the wrong region. Host in India.
- Audio buffering before playback. Pipecat's RN transport plays as it streams; don't intercept.
- Blocking the JS thread on transcript rendering. Use efficient state updates, not synchronous re-renders.

Pipecat exposes pipeline metrics natively. Instrument these from day one — Phase 1 of the build order is "validate latency before building UI."

### 8.5 Pipecat pipeline (sketch)

```python
pipeline = Pipeline([
    transport.input(),
    GeminiMultimodalLiveLLMService(
        api_key=os.getenv("GOOGLE_API_KEY"),
        model="gemini-2.5-flash-native-audio",
        voice_id=scenario["voice_id"],
        system_instruction=build_system_prompt(scenario),
        params=InputParams(language="kn-IN", temperature=0.8),
    ),
    transport.output(),
])
```

One pipeline per active conversation. Scenario config (system prompt, voice, difficulty hints) loaded from local JSON at session start. Single-user; no multi-tenancy needed.

### 8.6 Scenario content as code

Six scenarios live as JSON files in the repo:

```
/content/kn-en/
├── auto_rickshaw.json
├── chai_stall.json
├── sabzi_mandi.json
├── pharmacy.json
├── landlord_call.json
└── doctor_visit.json
```

Each file contains: scenario metadata, briefing markdown, vocabulary list, cultural tip, character description, system prompt fields, voice ID, difficulty level, opening line. Source of truth is git. To add or edit, edit JSON and restart server.

### 8.7 Local SQLite schema

```
sessions    — id, scenario_id, started_at, ended_at, transcript_json, status
reviews     — session_id, score, pronunciation_notes, vocab_used, etiquette_notes
progress    — scenario_id, completed_at, best_score
```

No `users` table. When v1 adds auth, `user_id` columns get added and existing rows backfill with the original user's ID.

### 8.8 The grading call

Triggered after `endSession`. Server has the full transcript from Pipecat's context aggregator. Sends to Claude Sonnet with: transcript, scenario vocab, cultural tip, character goal, learner goal, difficulty level, structured-output rubric.

Returns JSON: score (0-100), per-turn pronunciation flags, vocabulary deployment list, etiquette observations.

Why Claude (not Gemini) for grading: reasoning over multi-turn transcripts with pedagogical nuance is Claude's strength. Latency is irrelevant here — the user is on a loading screen for 3-5 seconds. Worth re-evaluating in v1 if Gemini's grading quality catches up.

### 8.9 Cost model (v0, single user)

- Gemini Live native audio: priced per minute of conversation, several times the cost of pipelined alternatives. ~$0.50-0.80 per scenario.
- Claude grading: ~$0.03-0.05 per scenario.
- Server VM: ~$5-10/month.
- **Estimated cost per completed scenario: ~$0.55-0.85.**
- **Monthly burn at 3 scenarios/day: ~$50-80.**

Affordable for one-user v0. For v1 multi-user, this cost scales linearly and matters — likely the trigger to migrate to Sarvam-pipelined for cost optimization.

### 8.10 Vendor risk and migration strategy

Single-vendor dependency mitigated architecturally:

- **Pipecat abstracts services.** If Gemini Live deprecates a model (Google literally did this in March 2026 with `gemini-live-2.5-flash-preview-native-audio-09-2025`), update one import + voice config in `bot.py`. Pipeline structure unchanged.
- **Fallback path documented.** Whisper STT + Claude LLM + ElevenLabs TTS as a three-line swap in the pipeline definition. Same Pipecat pipeline shape.
- **Scenario content lives in git.** No vendor dashboard, no lock-in.
- **Conversation transcripts stored in your SQLite.** No vendor lock for data.

If Gemini Live becomes unreliable in the first two weeks of building, fall back without rewriting the app.

### 8.11 Risks specific to this architecture

- **Connectivity dependency.** WebRTC drop mid-conversation is the worst UX. Pipecat handles reconnection; client must surface "reconnecting" state clearly. Test on real Bangalore 4G in real auto rickshaws — your target environment.
- **Self-hosting Pipecat means you're on call.** For one user, fine. For v1, consider Pipecat Cloud or Daily Bots for managed hosting.
- **Gemini Live model deprecation.** Google moves fast and removes models with short notice. Pin to a specific model version, monitor deprecation announcements.
- **No telemetry.** You're the user; you'll know what's broken because you'll experience it. v1 needs PostHog or equivalent before the second user is added.

---

## 9. Success Metrics (v0)

v0 has one user. Quantitative metrics matter less than qualitative judgment.

**Did the loop work for me?**
- Did I complete all 6 scenarios?
- Did I want to repeat scenarios, or did once feel like enough?
- Did I actually learn Kannada I could use in the real world? *Test: did I successfully use a phrase from the app in a real auto/chai/dukaan situation?*
- Did the conversations feel like conversations, or did they feel like menu navigation?

**Did the technical pipeline hold up?**
- P50 turn latency under 1.0s in real use.
- P95 turn latency under 1.8s.
- WebRTC drop rate under 2%.
- Gemini Live Kannada voice quality acceptable for all 6 scenarios.

**What did each screen contribute?**
- Did the Briefing change how I performed in Roleplay?
- Did the Warm-Up actually warm me up, or did I skip it?
- Did the Review feedback change my behavior in the next scenario?

These are explicitly subjective and explicitly mine. v1 metrics get formalized when there are multiple users.

**v1 graduation criteria.** v0 is "successful" — and worth building v1 on top of — if: (a) you completed all 6 scenarios, (b) you used at least 3 phrases in real Bangalore situations, (c) you would honestly recommend it to a friend learning Kannada. Anything less means iterating on v0 before scaling.

---

## 10. Build Order

**Phase 1 — Pipeline first, no UI (week 1)**
1. Gemini API key. Test the Live API directly via Google AI Studio for Kannada quality.
2. Pipecat server: hello-world pipeline with Gemini Live for Kannada. Talk to it via Pipecat's CLI tool.
3. Validate end-to-end latency in your actual location and network.
4. Test fallback path: swap to Whisper + Claude + ElevenLabs in the pipeline, confirm it works.

*If Phase 1 doesn't produce a sub-1.5s P50 conversation in Kannada, stop and reassess before building UI.*

**Phase 2 — RN client connecting (week 2)**
5. Expo dev build set up.
6. Pipecat React Native SDK integrated; connect to Phase 1 server.
7. Single screen: tap to start → talk to bot → hear response. No design yet, just the loop.
8. Validate latency on actual mobile, in actual Bangalore network conditions.

**Phase 3 — Content + scenario screens (week 3)**
9. JSON content for all 6 scenarios.
10. Pathway, Briefing, Warm-Up screens — built against the design system.
11. Active Roleplay screen with proper pulse, transcript, motion.
12. Briefing → Warm-Up → Roleplay transitions wired up with spring motion.

**Phase 4 — Grading and Review (week 4)**
13. Claude grading endpoint on Pipecat server.
14. Grading prompt engineered against 5 sample transcripts of yours.
15. After-Action Review screen with score ring, feedback cards, sage success states.
16. Latency profiling — instrument turn-by-turn timings, validate P50/P95 targets.

**Phase 5 — Daily use and iteration (weeks 5-8)**
17. Use the app daily. Keep notes on what's broken, annoying, working.
18. Iterate on agent prompts, voice choices, briefing content, grading prompt.
19. Decide based on real evidence: is this worth adding auth + cloud + multi-user (v1), or is the core loop not compelling enough?

---

## Appendix A — Decisions made during PRD authoring

A record of the major decisions and what they replaced, so v1 has context:

- **Voice engine:** Started as on-device Gemma, then ElevenLabs Conversational AI, then Sarvam-via-Pipecat, finally Gemini Live via Pipecat. Decided empirically after testing Gemini Live's Kannada quality directly.
- **Language pair:** Started as Hindi-Kannada and French-English dual, then French-only, finally Kannada-for-English-only. Driven by founder-as-user insight (you're in Bangalore learning Kannada).
- **Architecture philosophy:** Started as offline-first with on-device models, finally cloud-based with Gemini Live. The "offline moat" was abandoned because the actual moat is curriculum and feel, not connectivity.
- **Auth and accounts:** Originally planned Supabase from day one, finally local SQLite with no auth. Single-user v0 doesn't need multi-tenancy.
- **Design direction:** Started as terracotta + saffron (India-coded), finally bone + sage + ink (Studio Calm). The original palette was designed for the migrant-focused product; the new palette is for a tool the user lives with daily.
- **Mobile vs web:** Confirmed as React Native mobile from day one. The app is used in real situations (autos, markets, dukaans) — phone is the right form factor.

These decisions shouldn't be re-litigated for v0. They should be reconsidered for v1 with real usage data.