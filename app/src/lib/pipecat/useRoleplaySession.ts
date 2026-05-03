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
  translation: "",
  suggestions: [],
  transcript: [],
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

  if (message.type === "helper_result" || message.type === "session_complete") {
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

export function useRoleplaySession() {
  const clientRef = useRef<PipecatClient | null>(null);
  const lastUserFinalRef = useRef("");
  const lastBotSentenceRef = useRef("");

  const [state, setState] = useState<RoleplaySessionState>(INITIAL_STATE);

  useEffect(() => {
    const client = createPipecatClient({
      onTransportStateChanged: (transportState) => {
        setState((current) => ({
          ...current,
          transportState,
        }));
      },
      onDisconnected: () => {
        setState((current) => ({
          ...current,
          transportState: TransportStateEnum.DISCONNECTED,
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
        }));
      },
      onUserTranscript: (data: TranscriptData) => {
        if (!data.final || !data.text || data.text === lastUserFinalRef.current) {
          return;
        }

        lastUserFinalRef.current = data.text;
        setState((current) => ({
          ...current,
          transcript: [
            ...current.transcript,
            createTranscriptLine("user", data.text),
          ],
        }));
      },
      onBotOutput: (data: BotOutputData) => {
        if (!data.spoken || data.aggregated_by !== "sentence" || !data.text) {
          return;
        }

        if (data.text === lastBotSentenceRef.current) {
          return;
        }

        lastBotSentenceRef.current = data.text;
        setState((current) => ({
          ...current,
          latestBotLine: data.text,
          transcript: [
            ...current.transcript,
            createTranscriptLine("bot", data.text),
          ],
        }));
      },
      onServerMessage: (payload: unknown) => {
        const message = normalizeServerMessage(payload);
        if (!message) {
          return;
        }

        if (message.type === "helper_result") {
          setState((current) => ({
            ...current,
            translation: message.data.translation,
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

  async function connect({ serverUrl, scenarioId, languageId }: ConnectParams) {
    const client = clientRef.current;
    if (!client) {
      return;
    }

    const baseUrl = serverUrl.trim().replace(/\/$/, "");
    if (!baseUrl) {
      setState((current) => ({
        ...current,
        error: "Server URL is required.",
      }));
      return;
    }

    lastUserFinalRef.current = "";
    lastBotSentenceRef.current = "";
    setState({
      ...INITIAL_STATE,
      transportState: TransportStateEnum.INITIALIZING,
    });

    try {
      await client.initDevices();
      await client.startBotAndConnect({
        endpoint: `${baseUrl}/start`,
        requestData: {
          body: {
            scenario_id: scenarioId,
            language: languageId,
          },
        },
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getErrorMessage(error),
        transportState: TransportStateEnum.ERROR,
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
    setState(INITIAL_STATE);
  }

  function clearError() {
    setState((current) => ({
      ...current,
      error: null,
    }));
  }

  return {
    state,
    connect,
    disconnect,
    clearError,
  };
}
