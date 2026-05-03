# TalkThrough App

This is the React Native app for TalkThrough, built with Expo SDK 55 and Expo Router.

## Important defaults

- This project uses Expo SDK 55, so the React Native New Architecture is enabled by default.
- We keep `"newArchEnabled": true` in [app.json](/Users/adityabhattad/Desktop/Github/talkthrough/app/app.json) to make that explicit for future contributors, even though SDK 55 already defaults to it.
- This app should be run with a development build, not Expo Go, because we will add native realtime voice dependencies.

## Common commands

From [/Users/adityabhattad/Desktop/Github/talkthrough/app](/Users/adityabhattad/Desktop/Github/talkthrough/app):

```bash
make help
make install
make android
make ios
make start
```

Recommended first-run flow:

```bash
make install
make android
make start
```

Or on iOS:

```bash
make install
make ios
make start
```

## What each command does

- `make install`: installs npm dependencies
- `make android`: builds and installs the Android development client
- `make ios`: builds and installs the iOS development client
- `make start`: starts the Expo dev server for the installed development client
- `make clean`: regenerates native folders from scratch if native config changes
- `make watchman`: clears common Watchman recrawl warnings
