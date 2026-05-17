import { useEffect, useState } from "react";

import { getServerUrl } from "@/lib/server";

import { PipecatRoleplayRepository } from "../data/roleplayRepository.pipecat";
import type { RoleplaySessionState } from "../model/types";

const repository = new PipecatRoleplayRepository();

type UseRoleplaySessionParams = {
  scenarioId: string;
  languageId: string;
  difficultyId: string;
  serverUrl?: string;
  autoConnect?: boolean;
};

const INITIAL_STATE = repository.getSnapshot();

export function useRoleplaySession({
  scenarioId,
  languageId,
  difficultyId,
  serverUrl = getServerUrl(),
  autoConnect = true,
}: UseRoleplaySessionParams) {
  const [state, setState] = useState<RoleplaySessionState>(INITIAL_STATE);

  useEffect(() => {
    return repository.subscribe(setState);
  }, []);

  useEffect(() => {
    if (!autoConnect) {
      return;
    }

    if (!scenarioId) {
      return;
    }

    void repository.connect({
      serverUrl,
      scenarioId,
      languageId,
      difficultyId,
    });

    return () => {
      void repository.disconnect();
    };
  }, [autoConnect, difficultyId, languageId, scenarioId, serverUrl]);

  return {
    state,
    connect: (override?: { serverUrl?: string }) =>
      repository.connect({
        serverUrl: override?.serverUrl ?? serverUrl,
        scenarioId,
        languageId,
        difficultyId,
      }),
    disconnect: () => repository.disconnect(),
    clearError: () => repository.clearError(),
  };
}
