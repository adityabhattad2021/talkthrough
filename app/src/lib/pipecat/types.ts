import type { TransportState } from "@pipecat-ai/client-js";

export type Suggestion = {
  romanized: string;
  english: string;
};

export type TranscriptLine = {
  id: string;
  role: "user" | "bot";
  text: string;
};

export type RoleplayUiState =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking"
  | "disconnecting"
  | "disconnected"
  | "error";

export type HelperResultPayload = {
  language: string;
  languageId: string;
  characterName: string;
  suggestions: Suggestion[];
  isComplete: boolean;
  outcome: string;
  reason: string;
};

export type TranslationResultPayload = {
  language: string;
  languageId: string;
  characterName: string;
  translation: string;
};

export type SessionCompletePayload = {
  language: string;
  characterName: string;
  outcome: string;
  reason: string;
  transcript: string[];
};

export type ServerEnvelope =
  | {
      type: "translation_result";
      data: TranslationResultPayload;
    }
  | {
      type: "helper_result";
      data: HelperResultPayload;
    }
  | {
      type: "session_complete";
      data: SessionCompletePayload;
    };

export type RoleplaySessionState = {
  transportState: TransportState;
  error: string | null;
  latestBotLine: string;
  currentBotText: string;
  currentUserText: string;
  translation: string;
  suggestions: Suggestion[];
  transcript: TranscriptLine[];
  remoteAudioLevel: number;
  isBotSpeaking: boolean;
  isUserSpeaking: boolean;
  uiState: RoleplayUiState;
  judge: {
    isComplete: boolean;
    outcome: string;
    reason: string;
  };
  summary: SessionCompletePayload | null;
};

export type ConnectParams = {
  serverUrl: string;
  scenarioId: string;
  languageId: string;
  difficultyId: string;
};
