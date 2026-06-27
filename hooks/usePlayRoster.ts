"use client";

import { useCallback, useEffect, useState } from "react";
import type { PlayRosterEntry } from "@/types/game";

export interface PlayRosterResponse {
  mode: "collection" | "guest";
  roster: PlayRosterEntry[];
  totalOwned: number;
}

export function usePlayRoster() {
  const [data, setData] = useState<PlayRosterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/play/roster");
      if (!res.ok) {
        throw new Error("Failed to load play roster");
      }
      const payload = (await res.json()) as PlayRosterResponse;
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}
