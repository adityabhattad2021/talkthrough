# TalkThrough App Context

This document explains how the React Native app works today, why it is structured this way, and what to look at when changing something.

## What This App Does

The app now has two main responsibilities:

- render the user-facing home screen where practice scenarios are surfaced
- connect to the Pipecat backend for live roleplay sessions

Today, the home screen is backed by a small feature module plus a real HTTP repository that fetches the backend app contract. It is still intentionally shaped so that later we can swap in:

- local SQLite or AsyncStorage-backed cached state
- synced backend + local fallback
- DB-backed server content without changing the app-facing payload shape

The roleplay layer is still the realtime part of the app.

Its job is to:
- connect to the Python Pipecat backend over Small WebRTC
- start a live voice roleplay session
- receive custom server messages for:
  - translation
  - suggestions
  - completion/judge output
- display conversation state in the UI

The backend does the heavy lifting for the live session:
- Gemini voice conversation
- helper model call for translation, suggestions, and completion judgment

The app is mainly responsible for:
- home screen rendering and local interaction state
- connection setup
- microphone/media initialization
- listening to Pipecat callbacks
- showing session data cleanly

## High-Level Flow

```mermaid
flowchart LR
    U["User"] --> A["React Native App"]
    A --> P["Pipecat RN Client"]
    P --> W["Small WebRTC"]
    W --> S["Python Pipecat Server"]
    S --> H["Helper Model"]
    H --> S
    S --> P
    P --> A
```

In plain English:

1. The user lands on the home screen.
2. The app loads a home payload through the home repository layer.
3. The user selects a scenario and difficulty.
4. The app hands that selection off to the roleplay flow with `scenarioId`, `difficultyId`, and `languageId`.
5. The Pipecat client connects to the backend through Small WebRTC.
6. The backend runs the live voice roleplay.
7. After each assistant turn, the backend sends extra structured data back:
   - translation
   - suggestions
   - judge/completion state
8. The app updates the UI.

## Current File Structure

```text
app/
├── app.json
├── Makefile
├── README.md
├── CONTEXT.md
├── scripts/
│   └── patch-rn-deps.mjs
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── (main)/
│   │   └── scenario/
│   ├── features/
│   │   ├── home/
│   │   │   ├── components/
│   │   │   ├── data/
│   │   │   ├── hooks/
│   │   │   ├── model/
│   │   └── roleplay/
│   │       ├── components/
│   │       ├── data/
│   │       ├── hooks/
│   │       ├── model/
│   │       ├── options.ts
│   │       └── RoleplayDebugScreen.tsx
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── radius.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   └── lib/
│       ├── server.ts
│       └── pipecat/
│           └── client.ts
└── ios/ android/
```

## What Each Important File Does

### [app.json](app.json)

Expo app configuration.

This is where we define:
- app name and bundle ids
- native plugin config
- Daily Expo plugin settings
- minimum native platform settings

Change this when you need:
- permissions
- bundle/package ids
- native plugin behavior
- splash/icon config

### [src/app/_layout.tsx](src/app/_layout.tsx)

Top-level Expo Router layout.

Right now it is intentionally minimal:
- imports `react-native-get-random-values`
- wraps the app with `SafeAreaProvider`
- renders the current route

If the whole app needs a provider later, this is a likely place for it.

### [src/app/index.tsx](src/app/index.tsx)

Entry screen route.

Right now it redirects to the main home route:
- [src/app/(main)/home.tsx](src/app/(main)/home.tsx)

This route should stay thin.

Good uses for this file:
- render the current top-level screen
- redirect once we add onboarding or auth gates

Bad uses for this file:
- large UI trees
- business logic
- data fetching details

### [src/app/(main)/home.tsx](src/app/(main)/home.tsx)

Current user-facing home screen.

It is responsible for:
- loading home data through `useHomeData()`
- rendering loading and error states
- rendering the dashboard-style home layout
- coordinating the scenario sheet and settings sheet

It should remain an orchestration file.

Keep out of this file when possible:
- hardcoded mock datasets
- reusable subcomponent markup
- repository implementation details

### `src/features/home/model/*`

The home domain types live here.

This is where we define:
- `HomeData`
- `ScenarioSummary`
- `DifficultyOption`
- language and user profile shapes

This layer matters because the home UI should depend on stable domain types, not on ad hoc backend responses. The current backend app routes are shaped to match this layer.

### `src/features/home/data/*`

Repository boundary for the home screen.

Today:
- `homeRepository.ts` defines the contract
- `homeRepository.http.ts` fetches the real backend payload

The mock repository may still be useful for isolated UI work, but it is no longer the main data path.

Later this is where we can add:
- API-backed repository implementations
- local database readers
- sync-aware composition

The goal is to keep backend refactors localized to this layer.

### `src/features/home/hooks/*`

Small hooks for the home feature.

Today:
- `useHomeData()` loads the home payload
- `useHomeScreenState()` manages ephemeral UI state such as:
  - selected scenario
  - selected difficulty
  - sheet visibility

This separation is intentional:
- repository-backed data is one concern
- temporary UI state is another

### `src/features/home/components/*`

Small presentational pieces for the home screen.

The current split includes:
- header
- intro copy
- featured scenario card
- scenario grid and tiles
- difficulty picker
- scenario sheet
- settings sheet

These files should stay prop-driven and easy to read.

### [src/theme/colors.ts](src/theme/colors.ts), [radius.ts](src/theme/radius.ts), [spacing.ts](src/theme/spacing.ts), [typography.ts](src/theme/typography.ts)

Shared design tokens derived from the design system in [docs/DESIGN.md](../docs/DESIGN.md).

Use these files for:
- palette values
- spacing scale
- radius values
- text styles

Avoid scattering raw token values across feature files unless there is a very local one-off reason.

### [src/lib/server.ts](src/lib/server.ts)

Small helper for backend base URL construction.

Use this file when:

- backend host changes
- app fetch code needs a shared base URL helper

### [src/app/scenario/[id]/roleplay.tsx](src/app/scenario/[id]/roleplay.tsx)

Current production roleplay route.

It is responsible for:

- reading `scenarioId`, `difficultyId`, and `languageId` from route params
- calling `useRoleplayScreenState()`
- holding screen-local presentation behavior such as responsive layout and navigation
- composing the roleplay UI from smaller presentational components

This route should stay thin.

### [src/features/roleplay/RoleplayDebugScreen.tsx](src/features/roleplay/RoleplayDebugScreen.tsx)

Current UI screen for testing the full voice flow.

It shows:
- server URL
- scenario selector
- language selector
- transport state
- latest bot line
- translation
- suggestions
- judge output
- transcript

This file should stay mostly UI-focused.

If business logic starts growing here, move it into:
- the hook
- helper functions
- a dedicated state layer

This screen is no longer the app entry point, but it is still useful as an integration and debugging surface while the production roleplay flow is being built.

### `src/features/roleplay/model/*`

The roleplay domain types live here.

This layer now holds:
- scenario detail types
- session state types
- helper/server message shapes

If the backend message shape changes, start here first.

### `src/features/roleplay/data/*`

Repository boundary for the roleplay feature.

Today:
- `scenarioRepository.ts` defines the scenario-detail contract
- `scenarioRepository.http.ts` fetches `/app/scenarios/{id}`
- `roleplayRepository.ts` defines the realtime session contract
- `roleplayRepository.pipecat.ts` adapts Pipecat callbacks into app session state

This is where we isolate:
- backend fetch details
- Pipecat transport details
- realtime message normalization

### `src/features/roleplay/hooks/*`

Roleplay feature hooks now have clear boundaries.

Today:
- `useScenarioDetail()` loads scenario metadata
- `useRoleplaySession()` manages the live session through the roleplay repository
- `useRoleplayScreenState()` composes scenario data plus session state for the route
- `useSessionTimer()` is a small UI-layer hook for the running session timer

The important split is:
- repositories own external sources
- feature hooks compose feature state
- UI hooks own local presentation behavior

### `src/features/roleplay/components/*`

Small presentational pieces for the production roleplay route.

Today this includes:
- `RoleplayHeader`
- `AgentStatusSection`
- `Waveform`
- `TranslationCard`
- `SuggestionPanel`

These components should stay UI-focused.

### [src/features/roleplay/options.ts](src/features/roleplay/options.ts)

Simple UI options for scenarios and languages.

Good place for:
- labels
- picker/chip options

Not a good place for:
- connection logic
- network calls

### [src/lib/pipecat/client.ts](src/lib/pipecat/client.ts)

Creates the Pipecat client.

This file is the bridge between our app and Pipecat RN packages.

It currently:
- creates `DailyMediaManager`
- creates `RNSmallWebRTCTransport`
- creates `PipecatClient`

If we ever change transport or media manager, start here.

## How Connection Startup Works

The app currently connects like this:

1. The roleplay route calls `useRoleplayScreenState(...)`.
2. `useRoleplayScreenState()` composes `useScenarioDetail()` and `useRoleplaySession()`.
3. `useRoleplaySession()` talks to `PipecatRoleplayRepository`.
4. The repository calls `client.initDevices()`.
5. Then it calls `client.startBotAndConnect(...)`.
6. The request goes to:
   - `http://localhost:7860/start`
7. We send:
   - `scenario_id`
   - `language`
   - `difficulty_id`
8. Backend starts the session and the realtime call begins.

Important detail:

We send request data like this:

```ts
requestData: {
  body: {
    scenario_id: scenarioId,
    language: languageId,
  },
}
```

That shape matters because the Pipecat server expects the actual request payload inside `body`.

## Why We Use `adb reverse`

On a real Android device, `localhost` means the phone itself, not your laptop.

So this command:

```bash
adb reverse tcp:7860 tcp:7860
```

means:
- when the phone requests `http://localhost:7860`
- forward that to your laptop’s `localhost:7860`

That lets the mobile app reach the local Pipecat server without hardcoding your LAN IP.

## Why There Is A Patch Script

### The short version

We currently depend on a few upstream React Native packages that have small compatibility issues in this exact setup.

Instead of editing `node_modules` manually after every install, we keep one script that reapplies those fixes automatically.

That script is:
- [scripts/patch-rn-deps.mjs](scripts/patch-rn-deps.mjs)

It runs automatically via:
- `postinstall` in [package.json](package.json)

### The actual bug it fixes

The important bug is in Pipecat’s RN Small WebRTC transport.

Upstream code assumes the peer connection already exists:

```js
return this.pc.getTransceivers()[AUDIO_TRANSCEIVER_INDEX];
```

But during connection setup, there is a timing window where `this.pc` can still be `null`.

That caused this runtime error:

```text
TypeError: Cannot read property 'getTransceivers' of null
```

Our fix changes the logic to:
- check whether `this.pc` exists
- if not, return `null`
- let the rest of the code continue safely

Conceptually, the change is:

```js
const transceivers = this.pc?.getTransceivers?.();
return transceivers?.[index] ?? null;
```

That is the real functional fix.

### The warning cleanup

The script also patches `@daily-co/react-native-webrtc` to reduce noisy development warnings:

1. `NativeEventEmitter` warning
   - React Native expects the native module to expose `addListener` and `removeListeners`
   - the current module shape does not
   - we provide a harmless fallback object so the warning stops appearing

2. `MediaDevices` log spam
   - upstream logs device monitor events very noisily
   - we remove those log lines because they do not help normal development

These two are mostly cleanup.
The transceiver null-check is the real bug fix.

## When To Remove The Patch Script

If upstream packages fix these issues, remove the script.

The likely removal condition is:
- Pipecat RN transport adds null-safe transceiver access
- Daily RN WebRTC resolves the emitter/logging issues

At that point:
1. remove `patch-rn-deps.mjs`
2. remove `patch-rn-deps` and `postinstall` from `package.json`
3. reinstall dependencies
4. verify logs stay clean

## Where To Look If You Need To Change Something

### Change session UI

Start in:
- [src/app/scenario/[id]/roleplay.tsx](src/app/scenario/[id]/roleplay.tsx)
- `src/features/roleplay/components/*`

### Change session behavior / callback handling

Start in:
- `src/features/roleplay/data/roleplayRepository.pipecat.ts`
- `src/features/roleplay/hooks/useRoleplaySession.ts`
- `src/features/roleplay/hooks/useRoleplayScreenState.ts`

### Change transport or media manager

Start in:
- [src/lib/pipecat/client.ts](src/lib/pipecat/client.ts)

### Change native plugin settings

Start in:
- [app.json](app.json)

### Change Android local dev forwarding

Start in:
- [Makefile](Makefile)
- root [Makefile](../Makefile)

### Change or remove the dependency compatibility patch

Start in:
- [scripts/patch-rn-deps.mjs](scripts/patch-rn-deps.mjs)
- [package.json](package.json)

## Current Practical State

Today, the app is:
- on Expo SDK 54
- using a dev build
- using Pipecat RN Small WebRTC transport
- using a small postinstall compatibility patch

That is a reasonable development setup.

The main thing to remember is:
- most app logic is ours
- the patch script exists only because of a small upstream transport/runtime gap

It should stay small, explicit, and well-documented.
