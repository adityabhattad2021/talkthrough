# TalkThrough

Voice-first roleplay language learning with:
- a **Pipecat Python server** for live voice conversations
- an **Expo React Native app** for the mobile client

The current local-dev setup uses:
- **Pipecat SmallWebRTC** on the server
- **Pipecat React Native SmallWebRTC transport** in the app
- **Gemini Live** for the in-character voice agent
- a separate **helper model call** for translation, suggestions, and completion judgment

## Repo Layout

```text
talkthrough/
├── app/       # Expo React Native app
├── server/    # Pipecat backend
├── docs/      # Product docs / PRD
└── Makefile   # Root dev shortcuts
```

Important docs:
- [server/CONTEXT.md](server/CONTEXT.md)
- [server/ARCHITECTURE.md](server/ARCHITECTURE.md)
- [app/CONTEXT.md](app/CONTEXT.md)
- [docs/PRD.md](docs/PRD.md)

## Prerequisites

You should have these installed locally:
- `uv`
- Node.js + npm
- Xcode if running iOS
- Android Studio / Android SDK if running Android
- `adb` available in your shell if using Android

You also need:
- `server/.env` with a valid `GOOGLE_API_KEY`

Start from:

```bash
cp server/.env.example server/.env
```

Then fill in the API key.

## First-Time Setup

### Backend

```bash
cd talkthrough
make server-install
```

This runs `uv sync` inside `server/`.

### App

```bash
cd talkthrough
make app-install
```

This runs `npm install` inside `app/`.

## Main Commands

From the repo root:

```bash
make help
make doctor
make server-dev
make server-check
make android-check
make android-ready
make android-unreverse
make app-start
make app-android
make app-ios
```

### What each root command does

- `make doctor`
  - quick status check for backend + Android device
- `make server-install`
  - installs backend dependencies with `uv`
- `make server-dev`
  - runs the Pipecat backend in the foreground
- `make server-check`
  - checks whether the backend is responding on `http://localhost:7860/debug-client`
- `make android-check`
  - shows connected Android devices
- `make android-reverse`
  - forwards Android `localhost:7860` to your computer’s `localhost:7860`
- `make android-unreverse`
  - removes that reverse port mapping
- `make android-ready`
  - checks backend + Android device, then applies reverse port forwarding
- `make app-install`
  - installs Expo app dependencies
- `make app-android`
  - builds/runs the Android dev client
- `make app-ios`
  - builds/runs the iOS dev client
- `make app-start`
  - starts Expo Metro for the dev client

## Normal Development Flow

## Backend

Run the backend in one terminal:

```bash
cd talkthrough
make server-dev
```

The backend will be available on:

```text
http://localhost:7860
```

## Android Physical Device

If you are using a real Android phone, use this flow:

1. Start backend:

```bash
make server-dev
```

2. In another terminal, prepare Android localhost forwarding:

```bash
make android-ready
```

3. Start Metro:

```bash
make app-start
```

4. If the Android dev client is not built yet, or native config changed, rebuild it:

```bash
make app-android
```

In the app, use:

```text
http://localhost:7860
```

because `adb reverse` maps device localhost back to your computer.

When you no longer want the mapping:

```bash
make android-unreverse
```

## Android After Native Dependency Changes

If app native dependencies or Expo plugins changed, regenerate and rebuild:

```bash
cd app
make clean
make android
make reverse-android
make start
```

Or from root:

```bash
make server-dev
# in another terminal
make android-ready
make app-android
make app-start
```

## iOS

For iOS simulator:

1. Start backend:

```bash
make server-dev
```

2. Start Metro:

```bash
make app-start
```

3. Build/run the iOS dev client if needed:

```bash
make app-ios
```

For local simulator use, `localhost:7860` is usually fine.

## App-Level Commands

If you prefer working directly inside `app/`:

```bash
cd app
make help
```

Available there:
- `make install`
- `make start`
- `make android`
- `make ios`
- `make prebuild`
- `make clean`
- `make reverse-android`
- `make unreverse-android`
- `make watchman`

## Backend-Level Commands

If you prefer working directly inside `server/`:

```bash
cd server
uv sync
uv run bot.py
```

## Current App Screen

The RN app currently has a **debug roleplay screen** that lets you:
- choose scenario
- choose language
- set server URL
- connect to the Pipecat backend
- see:
  - latest bot speech
  - translation
  - suggestions
  - judge output
  - transcript

Main RN files:
- [app/src/features/roleplay/RoleplayDebugScreen.tsx](/Users/adityabhattad/Desktop/Github/talkthrough/app/src/features/roleplay/RoleplayDebugScreen.tsx)
- [app/src/lib/pipecat/useRoleplaySession.ts](/Users/adityabhattad/Desktop/Github/talkthrough/app/src/lib/pipecat/useRoleplaySession.ts)
- [app/src/lib/pipecat/client.ts](/Users/adityabhattad/Desktop/Github/talkthrough/app/src/lib/pipecat/client.ts)

## Current Server Flow

The server currently:
1. runs the live voice character with Gemini Live
2. after each assistant turn, calls a helper model
3. sends `helper_result` over RTVI to the app
4. sends `session_complete` when the conversation is done

Main server files:
- [server/src/session.py](/Users/adityabhattad/Desktop/Github/talkthrough/server/src/session.py)
- [server/src/conversation_helper.py](/Users/adityabhattad/Desktop/Github/talkthrough/server/src/conversation_helper.py)
- [server/src/rtvi.py](/Users/adityabhattad/Desktop/Github/talkthrough/server/src/rtvi.py)

## Troubleshooting

### Backend is not responding

Run:

```bash
make server-check
```

If it fails, start the backend:

```bash
make server-dev
```

### Android phone cannot reach localhost

Run:

```bash
make android-ready
```

Then keep the app server URL as:

```text
http://localhost:7860
```

### Expo / native config changed

Rebuild the app:

```bash
cd /Users/adityabhattad/Desktop/Github/talkthrough/app
make clean
make android
```

### Watchman recrawl warnings

Run:

```bash
cd /Users/adityabhattad/Desktop/Github/talkthrough/app
make watchman
```
