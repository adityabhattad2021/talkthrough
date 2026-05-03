import { useMemo, useState } from "react";

import {
  DifficultyId,
  DifficultyOption,
  HomeData,
  ScenarioSummary,
} from "../model/types";

type HomeScreenState = {
  difficultyId: DifficultyId;
  isScenarioSheetOpen: boolean;
  isSettingsSheetOpen: boolean;
  recommendedScenario: ScenarioSummary | null;
  selectedScenario: ScenarioSummary | null;
  selectDifficulty: (difficultyId: DifficultyId) => void;
  openScenario: (scenario: ScenarioSummary) => void;
  closeScenario: () => void;
  openSettings: () => void;
  closeSettings: () => void;
};

function getDefaultDifficulty(
  difficultyOptions: DifficultyOption[],
): DifficultyId {
  return difficultyOptions.find((option) => option.id === "medium")?.id ?? "easy";
}

export function useHomeScreenState(data: HomeData): HomeScreenState {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioSummary | null>(
    null,
  );
  const [isScenarioSheetOpen, setIsScenarioSheetOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [difficultyId, setDifficultyId] = useState<DifficultyId>(
    getDefaultDifficulty(data.difficultyOptions),
  );

  const recommendedScenario = useMemo(() => {
    if (!data.scenarios.length) {
      return null;
    }

    return (
      data.scenarios.find(
        (scenario) => scenario.id === data.recommendedScenarioId,
      ) ?? data.scenarios[0]
    );
  }, [data.recommendedScenarioId, data.scenarios]);

  function openScenario(scenario: ScenarioSummary) {
    setSelectedScenario(scenario);
    setDifficultyId(getDefaultDifficulty(data.difficultyOptions));
    setIsScenarioSheetOpen(true);
  }

  function closeScenario() {
    setIsScenarioSheetOpen(false);
  }

  function openSettings() {
    setIsSettingsSheetOpen(true);
  }

  function closeSettings() {
    setIsSettingsSheetOpen(false);
  }

  return {
    difficultyId,
    isScenarioSheetOpen,
    isSettingsSheetOpen,
    recommendedScenario,
    selectedScenario,
    selectDifficulty: setDifficultyId,
    openScenario,
    closeScenario,
    openSettings,
    closeSettings,
  };
}
