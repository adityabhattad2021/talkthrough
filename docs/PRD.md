# Talkthrough — PRD v0

**Product:** Free, offline-first, situational language learning app for India
**Version:** v0 (MVP)
**Last updated:** April 10, 2026
**Philosophy:** Open-source. On-device AI. No subscriptions. No cloud dependency. Your phone is the classroom.

---

## 1. Problem

Millions of people relocate within or into India every year — domestic migrants moving between states, expats settling in new cities, travelers navigating unfamiliar regions. They don't need to pass a Hindi exam. They need to negotiate an auto fare, explain symptoms to a pharmacist, or order food at a dhaba — *today*.

Existing language apps teach grammar and vocabulary in isolation. They optimize for test scores, not survival. The few that use AI conversation require cloud APIs, subscriptions, and stable internet — luxuries for the domestic migrant on a ₹10/day data plan in a new city. There is no product that trains practical, situated fluency for Indian daily life and works offline, for free.

## 2. Solution

A voice-first, scenario-based language learning app powered by an on-device LLM (Gemma 4) that runs entirely on the user's phone. No internet required. No subscription. No data leaving the device.

Each scenario is a contained, real-world situation (negotiating with an auto driver, visiting a doctor, buying vegetables at a market). Users prepare with cultural context and key vocabulary, then enter an immersive voice conversation with an AI character running locally, and receive targeted feedback on what they said, how they said it, and whether it was culturally appropriate.

The moat is offline. Every other AI language app is a thin client over a cloud API. This app is the AI.

## 3. Target Users

**Primary — Expats and long-term visitors:** A software engineer from Berlin posted to Bangalore. Wants to speak enough Kannada/Hindi to stop feeling like a tourist. Has disposable income and a newer phone. Motivated by social integration.

**Secendary — Travelers:** Passing through for weeks or months. Wants a survival toolkit, not deep fluency. High initial engagement, lower retention.

## 4. Core Experience

On first launch, a three-screen onboarding sets the narrative, picks a language, and asks for a name. Takes 30 seconds. Then the user is on the Pathway and never sees onboarding again.

The app is structured as a linear journey through progressively complex real-world scenarios. The user moves through five screens per scenario:

**The Pathway → Scenario Briefing → Vocab Warm-Up → Active Roleplay → After-Action Review**

The Warm-Up is the critical bridge. The Briefing gives you context; the Warm-Up puts the words in your mouth. Without it, a user with zero Kannada is staring at a mic with nothing to say. With it, they've heard, repeated, and used the 6–8 key phrases at least once — enough to survive the conversation.

This loop is the entire product. There are no side quests, no social features, no leaderboards. The pathway is the curriculum.

## 5. v0 Scope

### 5.1 What ships

**Two language pairs at launch:**
- **Hindi** for English speakers — highest demand corridor.
- **Kannada** for Hindi speakers — validates the cross-regional use case from day one.

Each pair has its own scenario content, vocabulary, cultural tips, and Gemma 4 system prompts. The architecture supports adding more pairs without app changes (content is data, not code).

**Six scenarios per language, across three difficulty tiers:**

| Tier | Scenario | Key interaction |
|---|---|---|
| Beginner | Auto Rickshaw | Negotiate a fare, give directions |
| Beginner | Chai Stall | Order, make small talk |
| Intermediate | Grocery / Sabzi Mandi | Ask prices, bargain, count |
| Intermediate | Pharmacy | Describe symptoms, understand dosage |
| Advanced | Landlord Call | Discuss a maintenance issue |
| Advanced | Doctor Visit | Describe medical history, ask questions |

**Five screens, fully functional:**

1. **The Pathway (Home)** — Vertical node map. Nodes unlock sequentially. Completed nodes show a checkmark. Locked nodes are greyed out. Tapping an unlocked node opens a bottom sheet with the scenario title, a one-line summary, and a "Begin" button.

2. **Scenario Briefing** — Static screen. Cultural context card (the "Pragmatic Tip"), vocabulary list with transliteration, and a full-width CTA to continue.

3. **Vocab Warm-Up** — A short, interactive drill (60–90 seconds) that cycles through the scenario's 6–8 key phrases. Three micro-steps per phrase: *listen* (hear TTS pronounce it), *repeat* (speak it back, STT confirms), *use it* (see it in a one-line example sentence from the scenario). Swipe or tap to advance. No scoring, no failure state — this is a warm-up, not a test. The CTA at the end says "Ready? Start Roleplay."

4. **Active Roleplay** — Voice-first conversation screen. User holds a mic button to speak; AI responds with synthesized speech. Live transcription scrolls at the bottom (user text in black, AI text in terracotta). A pulsing circle provides visual feedback for AI speech. A close button and "End Conversation" button are always accessible. **Runs entirely on-device.**

5. **After-Action Review** — Score ring (percentage), three feedback cards (Pronunciation, Vocabulary Used, Cultural Etiquette), inline correction highlights, and a "Continue Journey" CTA that returns to the Pathway.

**Infrastructure:**

- On-device Gemma 4 model (quantized for mobile) with per-scenario system prompts (character, context, difficulty constraints, conversation goals).
- On-device speech-to-text for user input (Hindi/Kannada + English code-switching support).
- On-device text-to-speech for AI character responses.
- Local-first user profile: name, selected language pair, current node, completion states, streak count. Stored on-device via AsyncStorage/SQLite.
- Zero network dependency for core functionality.

### 5.2 What doesn't ship

- Additional language pairs beyond Hindi←English and Kannada←Hindi (Tamil, Marathi, Bengali — planned for v1+).
- Spaced repetition or standalone vocabulary review.
- Social/community features.
- Analytics dashboard for users (internal analytics only).
- Accessibility features beyond basic screen reader support.

### 5.3 Monetization (v0)

The app is free and fully functional with no paywalls on core features. A single optional "Support the Developer" screen is accessible from settings. One-time payments only (e.g., ₹149 / $1.99 tiers). No recurring subscriptions. No ads. No data monetization. The payment unlocks a small cosmetic acknowledgment (e.g., a "Supporter" badge on the profile) but zero functional gates.

This is a principled choice, not a placeholder. The app stays free.

## 6. Screen Specifications

### 6.0 Onboarding (First Launch Only)

Three screens, shown once. No skip button — this is a 30-second flow, not a wall. Data is saved locally; the user never sees these again.

**Screen 1 — Narrative**

**Purpose:** Set the tone. Tell the user what this app is and isn't. Build confidence before asking for anything.

**Layout:** Full-screen, centered text on `--color-background`. No inputs.

**Content:** A short, direct statement — something like:

> *"You don't need to study a language. You need to survive in one. This app throws you into real conversations — with an AI that lives on your phone, works offline, and doesn't judge your accent."*

The exact copy is a creative decision, but the intent is: you're not in school, you're in training. This is practical, this is immediate, and it works without Wi-Fi.

**Bottom:** Single CTA, full-width terracotta: "Let's go." Advances to Screen 2.

**Design notes:** Text only. No illustration, no animation. Let the words land. Eczar heading for the hook line, DM Sans for the body. Generous vertical padding.

**Screen 2 — Language Selection**

**Purpose:** Choose your learning pair.

**Layout:** Centered heading + two (or more, as languages are added) large selectable cards.

**Heading:** "What do you want to speak?" (24px Eczar)

**Cards:** Each card shows the target language name in its own script (large, e.g., "हिन्दी") with a subtitle indicating the source language (e.g., "for English speakers"). White surface, 1px border. Selected state: terracotta border, subtle terracotta tint on background.

**Bottom:** CTA: "Continue" — enabled only after selection.

**Data saved:** `language_pair` (e.g., `hi-en`, `kn-hi`).

**Screen 3 — Name**

**Purpose:** Personalize the experience. The app greets the user by name on the Pathway screen.

**Layout:** Centered heading + single text input + CTA.

**Heading:** "What should I call you?" (24px Eczar)

**Input:** Single-line, centered, 48px height, 1px border, 4px radius. Placeholder: "Your name". Auto-focused, keyboard opens immediately.

**Bottom:** CTA: "Start my journey" — enabled when input is non-empty. Transitions to The Pathway.

**Data saved:** `user_name`.

**Design notes:** Keep this warm but fast. No last name, no email, no account creation. Just a name so the app can say "Namaste, Arjun" instead of "Namaste, User."

### 6.1 The Pathway (Home)

**Layout:** Fixed 64px header with bottom border. Vertically scrolling body. Centered 2px vertical timeline.

**Header:** Left-aligned greeting ("Namaste, {name}"). Right-aligned streak counter with a terracotta flame icon.

**Nodes:** 48×48px circles positioned on the timeline. Active nodes: terracotta fill, white icon. Completed nodes: terracotta fill, white checkmark. Locked nodes: off-white fill, warm-grey border and icon.

**Interaction:** Tapping an active/completed node opens a bottom sheet (slide-up, 200ms ease) with scenario name, one-line description, and a "Begin" / "Retry" CTA.

**State — Loading:** Timeline line pulses with an opacity fade animation.

### 6.2 Scenario Briefing

**Layout:** Scrollable stack. Fixed bottom CTA bar.

**Elements (top to bottom):**
- Line-art hero illustration, 200px height, white background.
- Scenario title (24px Eczar, 600 weight).
- Cultural context card: warm yellow background (#FFFBEB), 1px amber border (#FDE68A). Heading "The Pragmatic Tip" in saffron. Body in 16px DM Sans.
- Vocabulary section: flex-wrap chips. Each chip shows the word in Devanagari, romanized transliteration below, 1px border, 4px radius. Tap to hear pronunciation.
- Fixed bottom bar: 56px terracotta CTA, white text, "Continue to Warm-Up."

**State — Loading:** Skeleton rectangles for chips and context card.

### 6.3 Vocab Warm-Up

**Purpose:** Get the key phrases into short-term memory so the user isn't silent in the roleplay. A warm-up, not a test.

**Layout:** Full-screen card carousel. One phrase per card. Fixed bottom progress indicator + CTA.

**Card anatomy (per phrase):**
- Target phrase in native script (24px Eczar, centered). e.g., "कितना लगेगा?"
- Romanized transliteration below (16px DM Sans, muted). e.g., "Kitna lagega?"
- English meaning (13px DM Sans, muted). e.g., "How much will it cost?"
- Speaker icon: tap to hear TTS pronounce the phrase. Auto-plays on card entry.
- Mic icon: tap and hold to repeat. STT listens; on release, a simple checkmark confirms it heard something reasonable. No strict grading — even a rough attempt gets the check.
- Context line (13px DM Sans, italic): a one-line example from the scenario. e.g., "You'd say this to the auto driver before getting in."

**Progress:** Dot indicators at the bottom (one per phrase). Swipe left to advance, or tap "Next" button.

**Final card:** "You're ready." with a full-width CTA: "Start Roleplay." Transition to Active Roleplay.

**Design notes:** Same visual language as the rest of the app — white cards, 1px borders, 4px radius. No gamification (no points, no stars, no streaks on this screen). The warm-up should feel like a quick stretch before a run, not a quiz.

**States:**
- Listening: mic icon pulses terracotta, card border shifts to terracotta.
- Confirmed: checkmark appears next to the mic icon, subtle haptic.
- Skipped: user can swipe past without speaking. No penalty.

### 6.4 Active Roleplay

**Layout:** Maximally minimal. No chrome beyond a top bar and bottom mic.

**Top bar:** 48px. Close (X) on left. Scenario title centered. "End Conversation" text button on right.

**Center:** 120×120px pulsing circle. Terracotta when AI is speaking (pulse synced to volume). Dark grey when listening.

**Bottom 30%:** Live transcription area with a top-fade gradient mask. User lines in dark text, AI lines in terracotta. 18px DM Sans, 1.5 line height. Auto-scrolls to latest line.

**Mic button:** Fixed bottom center, 64×64px circle. Press-and-hold to speak. Haptic on press. Release sends audio to STT → LLM pipeline.

**States:**
- AI Speaking: visualizer pulses, mic dimmed.
- User Speaking (holding mic): visualizer dark, live transcription writes.
- Processing: brief spinner after mic release.
- Error: toast notification, "Something went wrong. Tap to retry." Mic disabled.

### 6.5 After-Action Review

**Layout:** Scrollable body, fixed bottom CTA.

**Score ring:** 160px circular gauge, centered. Percentage in large text inside. Ring fill color: terracotta for <70%, saffron/accent for 70–89%, green (#16A34A) for 90%+.

**Feedback cards:** Three white cards with 1px borders, 16px padding, 12px vertical gap.
- **Pronunciation:** Lists flagged words. Each shows what was detected (struck through) → correct pronunciation. Tap play icon to hear correct version.
- **Vocabulary Used:** Shows which briefing vocab the user successfully deployed, and which were missed.
- **Cultural Etiquette:** Contextual notes (e.g., "You jumped to price before greeting — starting with 'Bhaiya' would have set a better tone.").

**CTA:** "Continue Journey" → returns to Pathway with the next node unlocked.

**State — Loading:** Skeleton cards with pulsing text: "Analyzing your conversation…"

## 7. Design System

### Colors
| Token | Value | Usage |
|---|---|---|
| `--color-primary` | #D9534F | CTAs, active nodes, AI transcription |
| `--color-background` | #F9F9F8 | App background |
| `--color-surface` | #FFFFFF | Cards, sheets |
| `--color-text` | #1C1917 | Primary text |
| `--color-muted` | #A8A29E | Disabled states, secondary text |
| `--color-accent` | #D97706 | Success states, cultural tips |

### Typography
| Role | Font | Weight | Size |
|---|---|---|---|
| Headings | Eczar | 600 | 24–32px |
| Body | DM Sans | 400 | 16px |
| Small | DM Sans | 400 | 13px |
| Buttons | DM Sans | 500 | 15px, 1px tracking |

### Principles
- **Radius:** 4px default. Structured, slightly rigid.
- **Elevation:** 1px solid #E7E5E4 borders. No shadows. Flat, print-like.
- **Icons:** 1.5pt stroke, minimalist line art.
- **Motion:** Ease transitions, 150–200ms. No bouncy spring physics. Use React Native Reanimated for performant animations.

## 8. Technical Architecture (v0)

### Core Principle: Everything On-Device

The entire AI pipeline — inference, speech recognition, speech synthesis, grading — runs locally. The phone never needs to call a server to deliver the core experience. This is the product's moat: no API costs that scale with users, no latency from network round-trips, no privacy concerns, and full functionality on a train through a tunnel.

### Client

**Framework:** React Native (Expo managed workflow where possible, bare workflow for native module integration).

**Platforms:** Android first (primary user base), iOS in parallel. Android minimum target: Android 10+ with 4GB+ RAM (covers ~80% of Indian Android market).

**Navigation:** React Navigation (stack + bottom sheet). Four-screen linear flow per scenario.

**Local storage:** SQLite via `expo-sqlite` or `react-native-sqlite-storage` for user profile, progress, scores, and streak data. All scenario content (system prompts, vocabulary, cultural tips) bundled as JSON assets.

### On-Device LLM: Gemma 4

TODO

### Data Architecture

All user data stays on-device:

- **Profile:** name, selected language pair, active pathway position.
- **Progress:** Per-scenario completion state, best score, attempt count.
- **Streaks:** Current streak, longest streak, last active date.
- **Transcripts:** Optionally saved locally for user review. Never uploaded.

### Scenario Content Model

Scenarios are data, not code. Each scenario is a single JSON file conforming to a strict schema:

```
{
  "id": "auto-rickshaw",
  "language_pair": "hi-en",
  "tier": "beginner",
  "title": { "en": "Auto Rickshaw", "hi": "ऑटो रिक्शा" },
  "summary": "Negotiate a fare and give directions.",
  "cultural_tip": { "title": "The Pragmatic Tip", "body": "Always ask..." },
  "vocabulary": [
    {
      "word": "कितना",
      "transliteration": "Kitna",
      "meaning": "How much",
      "example": "Kitna lagega bhaiya?",
      "audio_key": "kitna.mp3"
    }
  ],
  "system_prompt": "You are Raju, a friendly auto driver in Bangalore...",
  "grading_prompt": "Evaluate the following conversation transcript...",
  "version": 1
}
```

**Bundled scenarios (v0):** 6 per language × 2 languages = 12 JSON files, shipped with the APK/IPA. These are the core product and work fully offline, forever.

**Community scenarios:** A public GitHub repo (`pragmatic-journey-scenarios`) hosts the scenario schema spec and accepts PRs. Anyone can author a scenario JSON for any language pair. The maintainer (you) reviews and merges. The app, when it has connectivity, checks a static JSON index file hosted on GitHub Pages or a cheap CDN. New/updated scenarios are downloaded and cached locally. Once cached, they work offline like bundled ones.

**How it works for the user:** On the Pathway screen, after the bundled scenarios, a "Community Scenarios" section appears (only if new packs have been synced). These show up as additional nodes with a subtle "community" badge. No paywall. No account required.

**Content contribution flow:** Contributor forks the repo → creates a JSON file following the schema → opens a PR → maintainer reviews for quality and safety → merge → appears in the index → users pick it up on next sync.

This keeps the architecture dead simple: no backend, no CMS, no database. Just a Git repo and a static file.

### App Size Budget

| Component | Size |
|---|---|
| React Native app bundle | ~30MB |
| Scenario content (2 languages × 6 scenarios) | ~3MB |
| Gemma 4 model (quantized) | ~2–4GB |
| **Total (post-model download)** | **~2.5–4.5GB** |

This is significant. The first-launch model download must be clearly communicated and ideally happens over WiFi. After that, the app is self-contained.

## 9. Success Metrics

**North star:** Scenario completion rate. What percentage of users who start a roleplay finish it and reach the review screen?

**Supporting metrics:**
- **Model download completion:** Percentage of installers who finish the initial Gemma 4 download. This is the first and highest-risk drop-off point.
- **Retention:** Day 1, Day 7, Day 30 return rates (measured locally; opt-in anonymous telemetry only).
- **Progression depth:** Average highest scenario reached per language pair.
- **Session length:** Time in Active Roleplay per session.
- **Streak consistency:** Percentage of users maintaining a 3+ day streak.
- **Inference latency:** P50 and P95 Gemma 4 response times on target devices. Must stay under 2 seconds for conversational feel.
- **Qualitative:** Post-session prompt ("Did this feel like a real conversation?" — 1 to 5). Stored locally.

**Anti-metrics (watch for negative signals):**
- High abandon rate during roleplay (suggests frustration, model quality, or latency issues).
- Users skipping the Briefing screen (suggests it's not adding value).
- Score inflation (if everyone scores 90%+, the grading prompt needs calibration).
- Model download abandonment (suggests size concern — may need smaller quantization).


## 10. Build Order

**Phase 1 — Foundation (Weeks 1–2)**
1. React Native project setup (Expo or bare workflow — decide based on native module needs for Gemma 4).
2. Gemma 4 integration: native module bridge, model loading, basic text inference on-device.
3. Onboarding flow: narrative screen, language selection, name input. Local persistence.
4. The Pathway (Home) screen: layout, colors, typography (Eczar + DM Sans), node/timeline system, navigation.

**Phase 2 — Content Screens (Weeks 3–4)**
4. Scenario Briefing screen: card surfaces, border patterns, chip components, cultural tip card.
5. Vocab Warm-Up screen: card carousel, listen/repeat micro-drill, STT integration for repeat-back.
6. Scenario content authoring: system prompts, vocabulary, cultural tips for all 12 scenarios (6 Hindi, 6 Kannada).
7. Language pair selection flow.

**Phase 3 — Core Loop (Weeks 5–7)**
8. Active Roleplay screen: minimal layout, voice visualizer, transcription display, mic interaction.
9. On-device STT integration (OS-level + Whisper.cpp fallback).
10. On-device TTS integration (OS-level, evaluate quality).
11. End-to-end voice loop: speak → STT → Gemma 4 → TTS → playback.

**Phase 4 — Feedback & Polish (Weeks 8–9)**
12. After-Action Review screen: score ring, feedback cards, correction highlights.
13. Grading prompt engineering and testing.
14. Model download flow (first-launch experience, progress UI, WiFi detection).
15. Community scenario sync (GitHub Pages index fetch, local caching).
16. Support the Developer screen.

**Phase 5 — Device Testing (Week 10)**
17. Performance profiling on 5 target Android devices.
18. Latency optimization, quantization tuning.
19. Bug fixes, edge cases, store submission prep.

## 11. Future Roadmap (Post-v0)

- **v1:** Tamil and Marathi language pairs. Spaced repetition for vocabulary review. 15+ scenarios per language. Community repo gains traction.
- **v1.5:** Scenario editor tool (simple web app) so non-technical contributors can author scenarios without writing JSON by hand. Community moderation pipeline.
- **v2:** Regional dialect support within languages. Smaller/faster on-device models as they become available. Conversation memory across scenarios (AI characters remember you). Possible wearable integration for hands-free practice.