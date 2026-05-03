# TalkThrough App

This is the React Native app for TalkThrough, built with Expo SDK 54 and Expo Router.

For the full repo setup and day-to-day development flow, use the root README:
- [README.md](../README.md)

For a fuller explanation of how the app works, including the current Pipecat/Daily compatibility patch:
- [CONTEXT.md](CONTEXT.md)

## Important defaults

- This project uses Expo SDK 54.
- We keep `"newArchEnabled": true` in [app.json](app.json) to make the New Architecture setting explicit for future contributors.
- This app should be run with a development build, not Expo Go, because we will add native realtime voice dependencies.

## Common commands

From `app/`:

```bash
make help
make install
make android
make ios
make start
make reverse-android
make unreverse-android
make reverse-devserver-android
make unreverse-devserver-android
```

Recommended first-run flow:

```bash
make install
make clean
make android
make start
```

Or on iOS:

```bash
make install
make clean
make ios
make start
```

## What each command does

- `make install`: installs npm dependencies
- `make android`: builds and installs the Android development client
- `make ios`: builds and installs the iOS development client
- `make start`: starts the Expo dev server for the installed development client
- `make clean`: regenerates native folders from scratch if native config changes
- `make reverse-android`: forwards Android `localhost:7860` to your computer's `localhost:7860`
- `make unreverse-android`: removes the Android Pipecat reverse port forwarding
- `make reverse-devserver-android`: forwards Android Metro / Expo dev-server ports (`8081`, `19000`, `19001`) to your computer
- `make unreverse-devserver-android`: removes the Android Metro / Expo dev-server reverse port forwarding
- `make watchman`: clears common Watchman recrawl warnings

## Android networking notes

If your Android phone and laptop are not on the same network, the app will usually fail to reach the Expo / Metro dev server over LAN.

In that case, use USB reverse for the dev server:

```bash
make reverse-devserver-android
make start
```

If you also need the local Pipecat server on port `7860`, run:

```bash
make reverse-android
```

Typical Android dev flow when using USB:

```bash
make reverse-devserver-android
make reverse-android
make start
```
