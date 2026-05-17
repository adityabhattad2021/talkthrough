import {
  TransportStateEnum,
  type BotOutputData,
  type PipecatClient,
  type PipecatClientOptions,
  type TranscriptData,
} from "@pipecat-ai/client-js";

import { createPipecatClient } from "@/lib/pipecat/client";

import type {
  RoleplayRepositoryClientFactory,
  RoleplayRepository,
  RoleplaySessionListener,
} from "./roleplayRepository";
import type {
  ConnectParams,
  RoleplaySessionState,
  ServerEnvelope,
  TranscriptLine,
} from "../model/types";

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

export class PipecatRoleplayRepository implements RoleplayRepository {
  private readonly client: PipecatClient;
  private readonly listeners = new Set<RoleplaySessionListener>();
  private state: RoleplaySessionState = INITIAL_STATE;
  private lastUserFinal = "";
  private lastBotSentence = "";
  private botWordBuffer: string[] = [];
  private lastBotChunk = "";

  constructor(
    clientFactory: RoleplayRepositoryClientFactory = (
      callbacks: PipecatClientOptions["callbacks"],
    ) => createPipecatClient(callbacks),
  ) {
    this.client = clientFactory({
      onTransportStateChanged: (transportState) => {
        this.setState((current) => ({
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
        this.resetBuffers();
        this.setState((current) => ({
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

        this.setState((current) => ({
          ...current,
          error,
          uiState: "error",
        }));
      },
      onRemoteAudioLevel: (level) => {
        this.setState((current) => ({
          ...current,
          remoteAudioLevel: clampAudioLevel(level),
        }));
      },
      onUserStartedSpeaking: () => {
        this.setState((current) => ({
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
        this.setState((current) => ({
          ...current,
          isUserSpeaking: false,
          currentUserText: "",
          suggestions: [],
          uiState: getUiState(
            current.transportState,
            current.error,
            current.isBotSpeaking,
            false,
          ),
        }));
      },
      onBotStartedSpeaking: () => {
        this.setState((current) => {
          if (!current.isBotSpeaking) {
            this.botWordBuffer = [];
            this.lastBotChunk = "";
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
        this.lastBotChunk = "";
        this.setState((current) => ({
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
          this.setState((current) => ({
            ...current,
            currentUserText: data.text,
          }));
          return;
        }

        if (data.text === this.lastUserFinal) {
          return;
        }

        this.lastUserFinal = data.text;
        this.setState((current) => ({
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
          if (data.text !== this.lastBotChunk) {
            this.botWordBuffer = [...this.botWordBuffer, data.text];
            this.lastBotChunk = data.text;
          }

          this.setState((current) => ({
            ...current,
            currentBotText: this.botWordBuffer.join(" ").trim(),
          }));
          return;
        }

        if (
          !data.spoken ||
          data.aggregated_by !== "sentence" ||
          data.text === this.lastBotSentence
        ) {
          return;
        }

        this.lastBotSentence = data.text;
        this.setState((current) => ({
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

        if (data.text !== this.lastBotChunk) {
          this.botWordBuffer = [...this.botWordBuffer, data.text];
          this.lastBotChunk = data.text;
        }

        this.setState((current) => ({
          ...current,
          currentBotText: this.botWordBuffer.join(" ").trim(),
        }));
      },
      onServerMessage: (payload: unknown) => {
        const message = normalizeServerMessage(payload);
        if (!message) {
          return;
        }

        if (message.type === "translation_result") {
          this.setState((current) => ({
            ...current,
            translation: message.data.translation,
          }));
          return;
        }

        if (message.type === "helper_result") {
          this.setState((current) => ({
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

        this.setState((current) => ({
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
  }

  getSnapshot(): RoleplaySessionState {
    return this.state;
  }

  subscribe(listener: RoleplaySessionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async connect({
    serverUrl,
    scenarioId,
    languageId,
    difficultyId,
  }: ConnectParams): Promise<void> {
    const baseUrl = serverUrl.trim().replace(/\/$/, "");
    if (!baseUrl) {
      this.setState((current) => ({
        ...current,
        error: "Server URL is required.",
        uiState: "error",
      }));
      return;
    }

    this.resetBuffers();
    this.state = {
      ...INITIAL_STATE,
      transportState: TransportStateEnum.INITIALIZING,
      uiState: "connecting",
    };
    this.emit();

    try {
      await this.client.initDevices();
      await this.client.startBotAndConnect({
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
      this.setState((current) => ({
        ...current,
        error: getErrorMessage(error),
        transportState: TransportStateEnum.ERROR,
        uiState: "error",
      }));
    }
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
    this.resetBuffers();
    this.state = INITIAL_STATE;
    this.emit();
  }

  clearError(): void {
    this.setState((current) => ({
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

  async dispose(): Promise<void> {
    await this.client.disconnect();
    this.listeners.clear();
  }

  private setState(
    updater: (current: RoleplaySessionState) => RoleplaySessionState,
  ): void {
    this.state = updater(this.state);
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private resetBuffers(): void {
    this.lastUserFinal = "";
    this.lastBotSentence = "";
    this.botWordBuffer = [];
    this.lastBotChunk = "";
  }
}
