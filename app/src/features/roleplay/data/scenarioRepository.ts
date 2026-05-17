import type {
  ScenarioDetail,
  ScenarioDetailParams,
} from "../model/types";

export interface ScenarioRepository {
  getScenarioDetail(params: ScenarioDetailParams): Promise<ScenarioDetail>;
}
