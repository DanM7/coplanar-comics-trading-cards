"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserCollection } from "@/types/collection";

export function useCollection() {
  const [collection, setCollection] = useState<UserCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/collection");
      if (res.status === 401) {
        setCollection(null);
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load collection");
      }
      const data = (await res.json()) as UserCollection;
      setCollection(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { collection, isLoading, error, refresh };
}
