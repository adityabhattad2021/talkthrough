import { buildServerUrl } from "@/lib/server";

import { HomeData } from "../model/types";
import { HomeRepository } from "./homeRepository";


export class HttpHomeRepository implements HomeRepository {
  async getHomeData(): Promise<HomeData> {
    const response = await fetch(buildServerUrl("/app/home?language_id=kannada"));

    if (!response.ok) {
      throw new Error(`Home request failed with status ${response.status}`);
    }

    return (await response.json()) as HomeData;
  }
}
