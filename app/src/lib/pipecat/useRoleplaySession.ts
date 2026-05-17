import { useEffect, useRef, useState } from "react";

import {
  TransportStateEnum,
  type BotOutputData,
  type PipecatClient,
  type TranscriptData,
} from "@pipecat-ai/client-js";

import { createPipecatClient } from "./client";
import type {
  ConnectParams,
  RoleplaySessionState,
  ServerEnvelope,
  TranscriptLine,
} from "./types";

const INITIAL_STATE: RoleplaySessionState = {
  transportState: TransportStateEnum.DISCONNECTED,
  error: null,
  latestBotLine: "",
  currentBotText: "",
  currentUserText: "",
  translation: "",
  suggestions: [],
  transcript: [],
  remoteAudioLevel: 0,
  isBotSpeaking: false,
  isUserSpeaking: false,
  uiState: "disconnected",
  judge: {
    isComplete: false,
    outcome: "in_progress",
    reason: "",
  },
  summary: null,
};

function createTranscriptLine(
  role: TranscriptLine["role"],
  text: string,
): TranscriptLine {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  };
}

function normalizeServerMessage(payload: unknown): ServerEnvelope | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const message = payload as { type?: unknown; data?: unknown };
  if (
    typeof message.type !== "string" ||
    !message.data ||
    typeof message.data !== "object"
  ) {
    return null;
  }

  if (
    message.type === "translation_result" ||
    message.type === "helper_result" ||
    message.type === "session_complete"
  ) {
    return message as ServerEnvelope;
  }

  return null;
}

function normalizeSessionTranscript(lines: string[]): TranscriptLine[] {
  return lines.flatMap((line, index) => {
    const separatorIndex = line.indexOf(": ");
    if (separatorIndex === -1) {
      return [];
    }

    const speaker = line.slice(0, separatorIndex).trim().toLowerCase();
    const text = line.slice(separatorIndex + 2).trim();
    const role: TranscriptLine["role"] =
      speaker === "learner" ? "user" : "bot";

    return [
      {
        id: `${role}-${index}`,
        role,
        text,
      },
    ];
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong while connecting to Pipecat.";
}

function getUiState(
  transportState: RoleplaySessionState["transportState"],
  error: string | null,
  isBotSpeaking: boolean,
  isUserSpeaking: boolean,
): RoleplaySessionState["uiState"] {
  if (error) {
    return "error";
  }

  if (transportState === TransportStateEnum.DISCONNECTING) {
    return "disconnecting";
  }

  if (transportState === TransportStateEnum.DISCONNECTED) {
    return "disconnected";
  }

  if (isBotSpeaking) {
    return "speaking";
  }

  if (
    isUserSpeaking ||
    transportState === TransportStateEnum.CONNECTED ||
    transportState === TransportStateEnum.READY
  ) {
    return "listening";
  }

  if (
    transportState === TransportStateEnum.INITIALIZING ||
    transportState === TransportStateEnum.INITIALIZED ||
    transportState === TransportStateEnum.AUTHENTICATING ||
    transportState === TransportStateEnum.AUTHENTICATED ||
    transportState === TransportStateEnum.CONNECTING
  ) {
    return "connecting";
  }

  return "idle";
}

function clampAudioLevel(level: number): number {
  if (!Number.isFinite(level)) {
    return 0;
  }

  return Math.max(0, Math.min(1, level));
}

export function useRoleplaySession() {
  const clientRef = useRef<PipecatClient | null>(null);
  const lastUserFinalRef = useRef("");
  const lastBotSentenceRef = useRef("");
  const botWordBufferRef = useRef<string[]>([]);
  const lastBotChunkRef = useRef("");

  const [state, setState] = useState<RoleplaySessionState>(INITIAL_STATE);

  useEffect(() => {
    const client = createPipecatClient({
      onTransportStateChanged: (transportState) => {
        setState((current) => ({
          ...current,
          transportState,
          uiState: getUiState(
            transportState,
            current.error,
            current.isBotSpeaking,
            current.isUserSpeaking,
          ),
        }));
      },
      onDisconnected: () => {
        botWordBufferRef.current = [];
        lastBotChunkRef.current = "";
        setState((current) => ({
          ...current,
          transportState: TransportStateEnum.DISCONNECTED,
          remoteAudioLevel: 0,
          isBotSpeaking: false,
          isUserSpeaking: false,
          uiState: "disconnected",
        }));
      },
      onError: (message) => {
        const maybeMessage = message?.data as { message?: unknown } | undefined;
        const error =
          typeof maybeMessage?.message === "string"
            ? maybeMessage.message
            : "Pipecat reported an error.";

        setState((current) => ({
          ...current,
          error,
          uiState: "error",
        }));
      },
      onRemoteAudioLevel: (level) => {
        setState((current) => ({
          ...current,
          remoteAudioLevel: clampAudioLevel(level),
        }));
      },
      onUserStartedSpeaking: () => {
        setState((current) => ({
          ...current,
          isUserSpeaking: true,
          uiState: getUiState(
            current.transportState,
            current.error,
            current.isBotSpeaking,
            true,
          ),
        }));
      },
      onUserStoppedSpeaking: () => {
        setState((current) => ({
          ...current,
          isUserSpeaking: false,
          currentUserText: "",
          uiState: getUiState(
            current.transportState,
            current.error,
            current.isBotSpeaking,
            false,
          ),
        }));
      },
      onBotStartedSpeaking: () => {
        setState((current) => {
          if (!current.isBotSpeaking) {
            botWordBufferRef.current = [];
            lastBotChunkRef.current = "";
          }

          return {
            ...current,
            currentBotText: current.isBotSpeaking ? current.currentBotText : "",
            translation: current.isBotSpeaking ? current.translation : "",
            isBotSpeaking: true,
            uiState: getUiState(
              current.transportState,
              current.error,
              true,
              current.isUserSpeaking,
            ),
          };
        });
      },
      onBotStoppedSpeaking: () => {
        lastBotChunkRef.current = "";
        setState((current) => ({
          ...current,
          isBotSpeaking: false,
          remoteAudioLevel: 0,
          uiState: getUiState(
            current.transportState,
            current.error,
            false,
            current.isUserSpeaking,
          ),
        }));
      },
      onUserTranscript: (data: TranscriptData) => {
        if (!data.text) {
          return;
        }

        if (!data.final) {
          setState((current) => ({
            ...current,
            currentUserText: data.text,
          }));
          return;
        }

        if (data.text === lastUserFinalRef.current) {
          return;
        }

        lastUserFinalRef.current = data.text;
        setState((current) => ({
          ...current,
          currentUserText: "",
          transcript: [
            ...current.transcript,
            createTranscriptLine("user", data.text),
          ],
        }));
      },
      onBotOutput: (data: BotOutputData) => {
        if (!data.text) {
          return;
        }

        if (data.spoken && data.aggregated_by === "word") {
          if (data.text !== lastBotChunkRef.current) {
            botWordBufferRef.current = [...botWordBufferRef.current, data.text];
            lastBotChunkRef.current = data.text;
          }

          setState((current) => ({
            ...current,
            currentBotText: botWordBufferRef.current.join(" ").trim(),
          }));
          return;
        }

        if (
          !data.spoken ||
          data.aggregated_by !== "sentence" ||
          data.text === lastBotSentenceRef.current
        ) {
          return;
        }

        lastBotSentenceRef.current = data.text;
        setState((current) => ({
          ...current,
          latestBotLine: data.text,
          currentBotText: data.text,
          transcript: [
            ...current.transcript,
            createTranscriptLine("bot", data.text),
          ],
        }));
      },
      onBotTtsText: (data) => {
        if (!data.text) {
          return;
        }

        if (data.text !== lastBotChunkRef.current) {
          botWordBufferRef.current = [...botWordBufferRef.current, data.text];
          lastBotChunkRef.current = data.text;
        }

        setState((current) => ({
          ...current,
          currentBotText: botWordBufferRef.current.join(" ").trim(),
        }));
      },
      onServerMessage: (payload: unknown) => {
        const message = normalizeServerMessage(payload);
        if (!message) {
          return;
        }

        if (message.type === "translation_result") {
          setState((current) => ({
            ...current,
            translation: message.data.translation,
          }));
          return;
        }

        if (message.type === "helper_result") {
          setState((current) => ({
            ...current,
            suggestions: message.data.suggestions,
            judge: {
              isComplete: message.data.isComplete,
              outcome: message.data.outcome,
              reason: message.data.reason,
            },
          }));
          return;
        }

        setState((current) => ({
          ...current,
          transcript: normalizeSessionTranscript(message.data.transcript),
          judge: {
            isComplete: true,
            outcome: message.data.outcome,
            reason: message.data.reason,
          },
          summary: message.data,
        }));
      },
    });

    clientRef.current = client;

    return () => {
      void client.disconnect();
      clientRef.current = null;
    };
  }, []);

  async function connect({
    serverUrl,
    scenarioId,
    languageId,
    difficultyId,
  }: ConnectParams) {
    const client = clientRef.current;
    if (!client) {
      return;
    }

    const baseUrl = serverUrl.trim().replace(/\/$/, "");
    if (!baseUrl) {
      setState((current) => ({
        ...current,
        error: "Server URL is required.",
        uiState: "error",
      }));
      return;
    }

    lastUserFinalRef.current = "";
    lastBotSentenceRef.current = "";
    botWordBufferRef.current = [];
    lastBotChunkRef.current = "";
    setState({
      ...INITIAL_STATE,
      transportState: TransportStateEnum.INITIALIZING,
      uiState: "connecting",
    });

    try {
      await client.initDevices();
      await client.startBotAndConnect({
        endpoint: `${baseUrl}/start`,
        requestData: {
          body: {
            scenario_id: scenarioId,
            language: languageId,
            difficulty_id: difficultyId,
          },
        },
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getErrorMessage(error),
        transportState: TransportStateEnum.ERROR,
        uiState: "error",
      }));
    }
  }

  async function disconnect() {
    const client = clientRef.current;
    if (!client) {
      return;
    }

    await client.disconnect();
    lastUserFinalRef.current = "";
    lastBotSentenceRef.current = "";
    botWordBufferRef.current = [];
    lastBotChunkRef.current = "";
    setState(INITIAL_STATE);
  }

  function clearError() {
    setState((current) => ({
      ...current,
      error: null,
      uiState: getUiState(
        current.transportState,
        null,
        current.isBotSpeaking,
        current.isUserSpeaking,
      ),
    }));
  }

  return {
    state,
    connect,
    disconnect,
    clearError,
  };
}
