.PHONY: help install start android ios prebuild clean watchman reverse-android unreverse-android

ROOT_DIR := $(abspath $(CURDIR)/..)

help:
	@echo "Available commands:"
	@echo "  make install    - install npm dependencies"
	@echo "  make start      - start the Expo dev server for the development client"
	@echo "  make android    - build and run the Android dev client"
	@echo "  make ios        - build and run the iOS dev client"
	@echo "  make prebuild   - regenerate native ios/android folders"
	@echo "  make clean      - regenerate native folders from scratch"
	@echo "  make reverse-android - forward Android localhost:7860 to your computer's localhost:7860"
	@echo "  make unreverse-android - remove Android localhost:7860 reverse forwarding"
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

reverse-android:
	adb reverse tcp:7860 tcp:7860

unreverse-android:
	adb reverse --remove tcp:7860

watchman:
	watchman watch-del '$(ROOT_DIR)' || true
	watchman watch-project '$(ROOT_DIR)'
