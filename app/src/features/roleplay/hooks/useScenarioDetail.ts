import { useEffect, useState } from "react";

import type {
  ScenarioDetail,
  ScenarioDetailParams,
} from "../model/types";
import { HttpScenarioRepository } from "../data/scenarioRepository.http";

const repository = new HttpScenarioRepository();

type ScenarioDetailState = {
  scenario: ScenarioDetail | null;
  isLoading: boolean;
  error: string | null;
};

export function useScenarioDetail(
  params: ScenarioDetailParams,
): ScenarioDetailState {
  const [state, setState] = useState<ScenarioDetailState>({
    scenario: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!params.scenarioId) {
        return;
      }

      setState({
        scenario: null,
        isLoading: true,
        error: null,
      });

      try {
        const scenario = await repository.getScenarioDetail(params);

        if (!isMounted) {
          return;
        }

        setState({
          scenario,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          scenario: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "We couldn't load this roleplay.",
        });
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [params.difficultyId, params.languageId, params.scenarioId]);

  return state;
}
