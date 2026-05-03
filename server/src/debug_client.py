from __future__ import annotations


DEBUG_CLIENT_HTML = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Talkthrough Debug Client</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f4f1;
        --card: #ffffff;
        --ink: #1a1a1a;
        --muted: #6b7280;
        --line: #d7d9d5;
        --sage: #6a8a6c;
        --sage-soft: #e7efe7;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: linear-gradient(180deg, #f4f4f1 0%, #ebece6 100%);
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .page {
        max-width: 1100px;
        margin: 0 auto;
        padding: 24px;
      }

      .hero {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        align-items: end;
        margin-bottom: 20px;
      }

      .hero h1 {
        margin: 0 0 6px;
        font-size: 32px;
        line-height: 1;
      }

      .hero p {
        margin: 0;
        color: var(--muted);
      }

      .status {
        min-width: 180px;
        padding: 12px 14px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.8);
      }

      .status-label {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .status-value {
        margin-top: 6px;
        font-size: 16px;
        font-weight: 600;
      }

      .controls,
      .layout {
        display: grid;
        gap: 16px;
      }

      .controls {
        grid-template-columns: 1.25fr 1fr 1fr auto auto;
        margin-bottom: 16px;
      }

      .layout {
        grid-template-columns: 1.05fr 0.95fr;
        align-items: start;
      }

      .column {
        display: grid;
        gap: 16px;
      }

      .card {
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 20px;
        padding: 18px;
        box-shadow: 0 8px 24px rgba(26, 26, 26, 0.04);
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      input,
      select,
      button {
        width: 100%;
        border-radius: 14px;
        border: 1px solid var(--line);
        padding: 12px 14px;
        font: inherit;
      }

      input,
      select {
        background: #fff;
      }

      button {
        cursor: pointer;
        font-weight: 600;
      }

      button.primary {
        background: var(--sage);
        border-color: var(--sage);
        color: white;
      }

      button.secondary {
        background: white;
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .panel-title {
        margin: 0 0 12px;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .panel-subtitle {
        margin: -4px 0 12px;
        color: var(--muted);
        font-size: 14px;
      }

      .latest-line {
        font-size: 24px;
        line-height: 1.3;
        margin: 0;
      }

      .translation {
        margin-top: 10px;
        font-size: 18px;
        color: #2b4230;
      }

      .summary {
        margin-top: 14px;
        padding: 12px 14px;
        border-radius: 14px;
        background: #f7f4ea;
        border: 1px solid #e4dcc3;
        color: #5d4d26;
        display: none;
      }

      .judge-meta {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 8px;
        color: #4c607e;
        font-size: 14px;
      }

      .judge-pill {
        padding: 4px 10px;
        border-radius: 999px;
        background: white;
        border: 1px solid #d5dfef;
        font-weight: 600;
      }

      .judge-reason {
        color: #31435c;
        line-height: 1.45;
      }

      .transcript {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 420px;
        overflow: auto;
      }

      .suggestions-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 260px;
        overflow: auto;
      }

      .suggestion-card {
        padding: 12px 14px;
        border-radius: 14px;
        background: var(--sage-soft);
        border: 1px solid #d2dfd3;
      }

      .suggestion-card strong {
        display: block;
        margin-bottom: 4px;
      }

      .event-log {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 420px;
        overflow: auto;
      }

      .line {
        padding: 12px 14px;
        border-radius: 14px;
        line-height: 1.4;
      }

      .line.user {
        background: #f2f4f0;
      }

      .line.bot {
        background: #edf3ed;
      }

      .line-role {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
      }

      .event-item {
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid var(--line);
        background: #fbfbfa;
      }

      .event-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: baseline;
      }

      .event-type {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
      }

      .event-time {
        font-size: 12px;
        color: var(--muted);
      }

      .event-text {
        margin-top: 6px;
        line-height: 1.45;
      }

      .event-item.success {
        background: #f4faf4;
        border-color: #cfe0d0;
      }

      .event-item.state {
        background: #f7f7f6;
      }

      .event-item.message {
        background: #f2f7f2;
        border-color: #d6e4d7;
      }

      .event-item.error {
        background: #fff4f4;
        border-color: #e9caca;
      }

      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        color: #374151;
        font-size: 13px;
        max-height: 420px;
        overflow: auto;
      }

      .hint {
        margin-top: 8px;
        color: var(--muted);
        font-size: 14px;
      }

      @media (max-width: 900px) {
        .controls,
        .layout {
          grid-template-columns: 1fr;
        }

        .hero {
          flex-direction: column;
          align-items: start;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="hero">
        <div>
          <h1>Talkthrough Debug Client</h1>
          <p>Use this page to inspect live subtitles, suggestions, and transcripts from your Pipecat server.</p>
        </div>
        <div class="status">
          <div class="status-label">Connection</div>
          <div id="status" class="status-value">disconnected</div>
        </div>
      </div>

      <div class="controls">
        <div class="card">
          <label for="serverUrl">Server Base URL</label>
          <input id="serverUrl" value="" />
        </div>
        <div class="card">
          <label for="scenarioId">Scenario</label>
          <select id="scenarioId">
            <option value="auto-rickshaw">auto-rickshaw</option>
            <option value="chai-stall">chai-stall</option>
            <option value="sabzi-mandi">sabzi-mandi</option>
            <option value="pharmacy">pharmacy</option>
            <option value="landlord-call">landlord-call</option>
            <option value="doctor-visit">doctor-visit</option>
          </select>
        </div>
        <div class="card">
          <label for="language">Language</label>
          <select id="language">
            <option value="marathi">Marathi</option>
            <option value="kannada">Kannada</option>
          </select>
        </div>
        <div class="card">
          <label>&nbsp;</label>
          <button id="connectBtn" class="primary">Connect</button>
        </div>
        <div class="card">
          <label>&nbsp;</label>
          <button id="disconnectBtn" class="secondary" disabled>Disconnect</button>
        </div>
      </div>

      <div class="layout">
        <div class="column">
          <div class="card">
            <div class="panel-title">Chat Transcript</div>
            <div class="panel-subtitle">Final user and bot utterances only, not token streaming.</div>
            <p id="latestBotLine" class="latest-line">Waiting for the bot to speak...</p>
            <div id="sessionSummary" class="summary"></div>
            <div id="transcript" class="transcript"></div>
          </div>
        </div>

        <div class="column">
          <div class="card">
            <div class="panel-title">Translation And Suggestions</div>
            <div class="panel-subtitle">Latest subtitle plus learner response suggestions from the helper model.</div>
            <div id="translation" class="translation">Translation will appear here.</div>
            <div id="suggestions" class="suggestions-list"></div>
          </div>

          <div class="card">
            <div class="panel-title">Judge</div>
            <div class="panel-subtitle">Latest structured completion decision from the helper model.</div>
            <div class="judge-meta">
              <span id="judgeComplete" class="judge-pill">in progress</span>
              <span id="judgeOutcome" class="judge-pill">outcome: in_progress</span>
            </div>
            <div id="judgeReason" class="judge-reason">Judge output will appear here after each assistant turn.</div>
          </div>

          <div class="card">
            <div class="panel-title">Latest Server Message</div>
            <div class="panel-subtitle">Raw custom RTVI payload for debugging.</div>
            <pre id="rawMessage">No server messages yet.</pre>
          </div>

          <div class="card">
            <div class="panel-title">Debug Log</div>
            <div class="panel-subtitle">Transport and event timeline.</div>
            <div id="debugLog" class="event-log"></div>
          </div>
        </div>
      </div>
    </div>

    <audio id="botAudio" autoplay playsinline></audio>

    <script type="module">
      import { PipecatClient } from "https://esm.sh/@pipecat-ai/client-js";
      import { SmallWebRTCTransport } from "https://esm.sh/@pipecat-ai/small-webrtc-transport";

      const statusEl = document.getElementById("status");
      const transcriptEl = document.getElementById("transcript");
      const rawMessageEl = document.getElementById("rawMessage");
      const debugLogEl = document.getElementById("debugLog");
      const latestBotLineEl = document.getElementById("latestBotLine");
      const sessionSummaryEl = document.getElementById("sessionSummary");
      const translationEl = document.getElementById("translation");
      const suggestionsEl = document.getElementById("suggestions");
      const judgeCompleteEl = document.getElementById("judgeComplete");
      const judgeOutcomeEl = document.getElementById("judgeOutcome");
      const judgeReasonEl = document.getElementById("judgeReason");
      const botAudioEl = document.getElementById("botAudio");
      const connectBtn = document.getElementById("connectBtn");
      const disconnectBtn = document.getElementById("disconnectBtn");
      const serverUrlEl = document.getElementById("serverUrl");
      const scenarioIdEl = document.getElementById("scenarioId");
      const languageEl = document.getElementById("language");

      serverUrlEl.value = window.location.origin;

      let client = null;
      let botAudioStream = null;

      function setStatus(value) {
        statusEl.textContent = value;
      }

      function log(type, text) {
        const timestamp = new Date().toLocaleTimeString();
        const item = document.createElement("div");
        item.className = `event-item ${type}`;
        item.innerHTML = `
          <div class="event-top">
            <span class="event-type">${type}</span>
            <span class="event-time">${timestamp}</span>
          </div>
          <div class="event-text">${text}</div>
        `;
        debugLogEl.prepend(item);

        while (debugLogEl.children.length > 20) {
          debugLogEl.removeChild(debugLogEl.lastChild);
        }

        debugLogEl.scrollTop = 0;
      }

      function addTranscript(role, text) {
        const line = document.createElement("div");
        line.className = `line ${role}`;
        line.innerHTML = `<span class="line-role">${role === "bot" ? "Ravi" : "You"}</span>${text}`;
        transcriptEl.prepend(line);

        while (transcriptEl.children.length > 14) {
          transcriptEl.removeChild(transcriptEl.lastChild);
        }

        transcriptEl.scrollTop = 0;
      }

      function renderSuggestions(items) {
        suggestionsEl.innerHTML = "";
        for (const item of items || []) {
          const card = document.createElement("div");
          card.className = "suggestion-card";
          card.innerHTML = `<strong>${item.romanized}</strong><div>${item.english}</div>`;
          suggestionsEl.appendChild(card);
        }
        suggestionsEl.scrollTop = 0;
      }

      async function attachBotAudioTrack(track, participant) {
        if (!track || track.kind !== "audio" || participant?.local) {
          return;
        }

        botAudioStream = new MediaStream([track]);
        botAudioEl.srcObject = botAudioStream;
        botAudioEl.muted = false;

        try {
          await botAudioEl.play();
          log("success", "Bot audio track attached.");
        } catch (error) {
          log("error", `Bot audio autoplay failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      function buildClient() {
        return new PipecatClient({
          transport: new SmallWebRTCTransport(),
          enableCam: false,
          enableMic: true,
          callbacks: {
            onConnected: () => {
              setStatus("connected");
              log("success", "Connected to transport.");
            },
            onDisconnected: () => {
              setStatus("disconnected");
              connectBtn.disabled = false;
              disconnectBtn.disabled = true;
              log("state", "Disconnected.");
            },
            onTransportStateChanged: (state) => {
              setStatus(state);
              log("state", `Transport state changed to ${state}.`);
            },
            onBotReady: (data) => {
              log("success", `Bot ready on RTVI ${data.version}.`);
            },
            onTrackStarted: (track, participant) => {
              void attachBotAudioTrack(track, participant);
            },
            onUserTranscript: (data) => {
              if (data.final && data.text) {
                addTranscript("user", data.text);
              }
            },
            onBotTranscript: (data) => {
              if (data?.text) {
                latestBotLineEl.textContent = data.text;
                addTranscript("bot", data.text);
              }
            },
            onBotOutput: (data) => {
              if (data.spoken && data.aggregated_by === "sentence" && data.text) {
                latestBotLineEl.textContent = data.text;
              }
            },
            onServerMessage: (message) => {
              rawMessageEl.textContent = JSON.stringify(message, null, 2);
              rawMessageEl.scrollTop = 0;
              log("message", `Server message received: ${message?.type ?? "unknown"}.`);

              const messageType = message?.type;
              const payload = message?.data;

              if (messageType === "session_complete") {
                const outcome = payload?.outcome === "success"
                  ? "Conversation complete."
                  : "Conversation ended without agreement.";
                sessionSummaryEl.style.display = "block";
                sessionSummaryEl.textContent = `${outcome} ${payload?.reason || ""} The session will disconnect automatically.`;
                log("success", `Session complete: ${payload?.outcome ?? "unknown"}.`);
                return;
              }

              if (messageType !== "helper_result") {
                return;
              }

              translationEl.textContent = payload?.translation || "";
              renderSuggestions(payload?.suggestions || []);
              judgeCompleteEl.textContent = payload?.isComplete ? "complete" : "in progress";
              judgeOutcomeEl.textContent = `outcome: ${payload?.outcome ?? "in_progress"}`;
              judgeReasonEl.textContent = payload?.reason || "No judge reason provided.";
            },
            onError: (message) => {
              log("error", `Error: ${JSON.stringify(message)}`);
            },
            onMessageError: (message) => {
              log("error", `Message error: ${JSON.stringify(message)}`);
            },
          },
        });
      }

      async function connect() {
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        rawMessageEl.textContent = "Waiting for server messages...";
        debugLogEl.innerHTML = "";
        transcriptEl.innerHTML = "";
        latestBotLineEl.textContent = "Waiting for the bot to speak...";
        sessionSummaryEl.style.display = "none";
        sessionSummaryEl.textContent = "";
        translationEl.textContent = "Translation will appear here.";
        suggestionsEl.innerHTML = "";
        judgeCompleteEl.textContent = "in progress";
        judgeOutcomeEl.textContent = "outcome: in_progress";
        judgeReasonEl.textContent = "Judge output will appear here after each assistant turn.";
        log("state", "Connecting...");
        client = buildClient();


        try {
          const baseUrl = serverUrlEl.value.replace(/\\/$/, "");
          await client.startBotAndConnect({
            endpoint: `${baseUrl}/start`,
            requestData: {
              body: {
                scenario_id: scenarioIdEl.value,
                language: languageEl.value.trim() || "marathi",
              },
            },
          });
          log("success", "startBotAndConnect() completed.");
        } catch (error) {
          log("error", `Connect failed: ${error instanceof Error ? error.message : String(error)}`);
          setStatus("error");
          connectBtn.disabled = false;
          disconnectBtn.disabled = true;
        }
      }

      async function disconnect() {
        disconnectBtn.disabled = true;
        try {
          if (client) {
            await client.disconnect();
          }
        } catch (error) {
          log("error", `Disconnect error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          botAudioEl.pause();
          botAudioEl.srcObject = null;
          botAudioStream = null;
          connectBtn.disabled = false;
          disconnectBtn.disabled = true;
          client = null;
          setStatus("disconnected");
        }
      }

      connectBtn.addEventListener("click", () => {
        void connect();
      });

      disconnectBtn.addEventListener("click", () => {
        void disconnect();
      });
    </script>
  </body>
</html>
"""
