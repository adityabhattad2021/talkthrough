import { useMemo } from "react";

import type { RoleplayScreenState } from "../model/types";
import { useRoleplaySession } from "./useRoleplaySession";
import { useScenarioDetail } from "./useScenarioDetail";

type UseRoleplayScreenStateParams = {
  scenarioId: string;
  languageId: string;
  difficultyId: string;
};

function getStatusLabel(
  uiState: ReturnType<typeof useRoleplaySession>["state"]["uiState"],
  isLoadingScenario: boolean,
  scenarioError: string | null,
): string {
  if (scenarioError) {
    return "error";
  }

  if (isLoadingScenario) {
    return "loading";
  }

  switch (uiState) {
    case "connecting":
      return "connecting";
    case "listening":
      return "listening";
    case "speaking":
      return "speaking";
    case "disconnecting":
      return "disconnecting";
    case "disconnected":
      return "disconnected";
    case "error":
      return "error";
    default:
      return "idle";
  }
}

export function useRoleplayScreenState({
  scenarioId,
  languageId,
  difficultyId,
}: UseRoleplayScreenStateParams): RoleplayScreenState {
  const {
    scenario,
    isLoading: isLoadingScenario,
    error: scenarioError,
  } = useScenarioDetail({
    scenarioId,
    languageId,
    difficultyId,
  });
  const { state, disconnect, clearError } = useRoleplaySession({
    scenarioId,
    languageId,
    difficultyId,
    autoConnect: true,
  });

  const streamedBotLine = useMemo(() => {
    return state.currentBotText || state.latestBotLine || "";
  }, [state.currentBotText, state.latestBotLine]);

  const statusLabel = useMemo(() => {
    return getStatusLabel(state.uiState, isLoadingScenario, scenarioError);
  }, [isLoadingScenario, scenarioError, state.uiState]);

  return {
    scenario,
    isLoadingScenario,
    scenarioError,
    session: state,
    streamedBotLine,
    statusLabel,
    disconnect,
    clearError,
  };
}
