import { useEffect, useState } from "react";

import { HttpHomeRepository } from "../data/homeRepository.http";
import { HomeData } from "../model/types";

const repository = new HttpHomeRepository();

type HomeDataState = {
  data: HomeData | null;
  isLoading: boolean;
  error: string | null;
};

export function useHomeData(): HomeDataState {
  const [state, setState] = useState<HomeDataState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await repository.getHomeData();

        if (!isMounted) {
          return;
        }

        setState({
          data,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "We couldn't load your home screen.",
        });
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
