"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearPlayRosterCache,
  fetchPlayRoster,
  getCachedPlayRoster,
  type PlayRosterResponse,
} from "@/lib/play-roster-client";

export type { PlayRosterResponse };

export function usePlayRoster() {
  const [data, setData] = useState<PlayRosterResponse | null>(() =>
    getCachedPlayRoster()
  );
  const [isLoading, setIsLoading] = useState(() => !getCachedPlayRoster());
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    clearPlayRosterCache();
    try {
      const payload = await fetchPlayRoster({ force: true });
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getCachedPlayRoster()) {
      return;
    }

    let cancelled = false;

    void fetchPlayRoster()
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error, refresh };
}
