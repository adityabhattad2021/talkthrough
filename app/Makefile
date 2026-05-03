.PHONY: help install start android ios prebuild clean watchman

help:
	@echo "Available commands:"
	@echo "  make install    - install npm dependencies"
	@echo "  make start      - start the Expo dev server for the development client"
	@echo "  make android    - build and run the Android dev client"
	@echo "  make ios        - build and run the iOS dev client"
	@echo "  make prebuild   - regenerate native ios/android folders"
	@echo "  make clean      - regenerate native folders from scratch"
	@echo "  make watchman   - reset Watchman if Metro shows recrawl warnings"

install:
	npm install

start:
	npx expo start --dev-client

android:
	npx expo run:android

ios:
	npx expo run:ios

prebuild:
	npx expo prebuild

clean:
	npx expo prebuild --clean

watchman:
	watchman watch-del '/Users/adityabhattad/Desktop/Github/talkthrough' || true
	watchman watch-project '/Users/adityabhattad/Desktop/Github/talkthrough'
