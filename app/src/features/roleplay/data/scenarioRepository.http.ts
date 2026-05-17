import { buildServerUrl } from "@/lib/server";

import type {
  ScenarioDetail,
  ScenarioDetailParams,
} from "../model/types";
import type { ScenarioRepository } from "./scenarioRepository";

export class HttpScenarioRepository implements ScenarioRepository {
  async getScenarioDetail({
    scenarioId,
    languageId,
    difficultyId,
  }: ScenarioDetailParams): Promise<ScenarioDetail> {
    const response = await fetch(
      buildServerUrl(
        `/app/scenarios/${scenarioId}?language_id=${languageId}&difficulty_id=${difficultyId}`,
      ),
    );

    if (!response.ok) {
      throw new Error(`Scenario request failed with status ${response.status}`);
    }

    return (await response.json()) as ScenarioDetail;
  }
}
