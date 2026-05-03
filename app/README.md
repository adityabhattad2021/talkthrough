# TalkThrough App

This is the React Native app for TalkThrough, built with Expo SDK 54 and Expo Router.

For the full repo setup and day-to-day development flow, use the root README:
- [README.md](/Users/adityabhattad/Desktop/Github/talkthrough/README.md)

## Important defaults

- This project uses Expo SDK 54.
- We keep `"newArchEnabled": true` in [app.json](/Users/adityabhattad/Desktop/Github/talkthrough/app/app.json) to make the New Architecture setting explicit for future contributors.
- This app should be run with a development build, not Expo Go, because we will add native realtime voice dependencies.

## Common commands

From [/Users/adityabhattad/Desktop/Github/talkthrough/app](/Users/adityabhattad/Desktop/Github/talkthrough/app):

```bash
make help
make install
make android
make ios
make start
make reverse-android
make unreverse-android
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
- `make unreverse-android`: removes the Android reverse port forwarding
- `make watchman`: clears common Watchman recrawl warnings
