import type {
  PipecatClient,
  PipecatClientOptions,
} from "@pipecat-ai/client-js";

import type { ConnectParams, RoleplaySessionState } from "../model/types";

export type RoleplaySessionListener = (
  state: RoleplaySessionState,
) => void;

export interface RoleplayRepository {
  getSnapshot(): RoleplaySessionState;
  subscribe(listener: RoleplaySessionListener): () => void;
  connect(params: ConnectParams): Promise<void>;
  disconnect(): Promise<void>;
  clearError(): void;
  dispose(): Promise<void>;
}

export type RoleplayRepositoryClientFactory = (
  callbacks: PipecatClientOptions["callbacks"],
) => PipecatClient;
