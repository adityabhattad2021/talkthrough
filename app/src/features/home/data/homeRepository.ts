import { HomeData } from "../model/types";

export interface HomeRepository {
  getHomeData(): Promise<HomeData>;
}
