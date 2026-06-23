"use client";

import { useCallback, useState } from "react";
import type { PackOpenResult } from "@/types/collection";

type PackPhase = "idle" | "opening" | "revealing" | "complete";

export function usePackOpen() {
  const [phase, setPhase] = useState<PackPhase>("idle");
  const [result, setResult] = useState<PackOpenResult | null>(null);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const openPack = useCallback(async () => {
    setPhase("opening");
    setError(null);
    setResult(null);
    setRevealIndex(-1);

    try {
      const res = await fetch("/api/packs/open", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as Partial<
        PackOpenResult & { error?: string }
      >;

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to open pack");
      }
      if (!data.cards?.length) {
        throw new Error("Pack opened with no cards to reveal");
      }

      setResult(data as PackOpenResult);
      setPhase("revealing");
      setRevealIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setPhase("idle");
    }
  }, []);

  const revealNext = useCallback(() => {
    if (!result) return;
    setRevealIndex((prev) => {
      const next = prev + 1;
      if (next >= result.cards.length) {
        setPhase("complete");
        return prev;
      }
      return next;
    });
  }, [result]);

  const revealAll = useCallback(() => {
    if (!result) return;
    setRevealIndex(result.cards.length - 1);
    setPhase("complete");
  }, [result]);

  const reset = useCallback(() => {
    setPhase("idle");
    setResult(null);
    setRevealIndex(-1);
    setError(null);
  }, []);

  return {
    phase,
    result,
    revealIndex,
    error,
    openPack,
    revealNext,
    revealAll,
    reset,
  };
}
