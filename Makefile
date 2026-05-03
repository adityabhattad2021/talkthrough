.PHONY: help server-install server-dev server-check android-check android-reverse android-unreverse android-ready app-install app-start app-android app-ios doctor

ROOT_DIR := /Users/adityabhattad/Desktop/Github/talkthrough
SERVER_DIR := $(ROOT_DIR)/server
APP_DIR := $(ROOT_DIR)/app
BACKEND_PORT ?= 7860
BACKEND_URL ?= http://localhost:$(BACKEND_PORT)

help:
	@echo "TalkThrough workspace commands:"
	@echo "  make doctor          - quick status for backend + Android device"
	@echo "  make server-install  - install backend dependencies with uv"
	@echo "  make server-dev      - run the Pipecat backend in the foreground"
	@echo "  make server-check    - verify the backend is responding"
	@echo "  make android-check   - show connected Android devices"
	@echo "  make android-reverse - map device localhost:$(BACKEND_PORT) to your computer"
	@echo "  make android-unreverse - remove the localhost reverse mapping"
	@echo "  make android-ready   - verify device + backend, then apply adb reverse"
	@echo "  make app-install     - install Expo app dependencies"
	@echo "  make app-android     - build/run the Android dev client"
	@echo "  make app-ios         - build/run the iOS dev client"
	@echo "  make app-start       - start Metro for the dev client"

server-install:
	cd $(SERVER_DIR) && uv sync

server-dev:
	cd $(SERVER_DIR) && uv run bot.py

server-check:
	@echo "Checking backend at $(BACKEND_URL)/debug-client ..."
	@curl -fsS $(BACKEND_URL)/debug-client >/dev/null \
		&& echo "Backend is live at $(BACKEND_URL)" \
		|| (echo "Backend is not responding. Start it with: make server-dev" && exit 1)

android-check:
	@echo "Connected Android devices:"
	@adb devices

android-reverse:
	adb reverse tcp:$(BACKEND_PORT) tcp:$(BACKEND_PORT)
	@echo "Android localhost:$(BACKEND_PORT) now points to your computer's localhost:$(BACKEND_PORT)"

android-unreverse:
	adb reverse --remove tcp:$(BACKEND_PORT)
	@echo "Removed Android reverse port mapping for $(BACKEND_PORT)"

android-ready: server-check android-check
	@adb get-state >/dev/null 2>&1 \
		&& $(MAKE) android-reverse \
		&& echo "Android is ready. In the app, use server URL: http://localhost:$(BACKEND_PORT)" \
		|| (echo "No Android device is ready. Connect a phone/emulator, then rerun make android-ready" && exit 1)

app-install:
	cd $(APP_DIR) && npm install

app-start:
	cd $(APP_DIR) && $(MAKE) start

app-android:
	cd $(APP_DIR) && $(MAKE) android

app-ios:
	cd $(APP_DIR) && $(MAKE) ios

doctor:
	@echo ""
	@echo "== Backend =="
	@$(MAKE) --no-print-directory server-check || true
	@echo ""
	@echo "== Android =="
	@adb devices || true
	@echo ""
	@echo "If backend is live and a device is connected, run:"
	@echo "  make android-ready"
	@echo "Then either:"
	@echo "  make app-start"
	@echo "or rebuild the app with:"
	@echo "  make app-android"
