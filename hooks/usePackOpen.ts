"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { incrementGuestPackOpenCount } from "@/lib/guest-pack-session";
import { preloadPackArt } from "@/lib/pack-art-preload";
import type { PackOpenResult } from "@/types/collection";

type PackPhase = "idle" | "opening" | "revealing" | "complete";

async function fetchPreparedPack(): Promise<PackOpenResult | null> {
  const res = await fetch("/api/packs/prepare", { method: "POST" });
  const data = (await res.json().catch(() => ({}))) as Partial<
    PackOpenResult & { error?: string }
  >;

  if (!res.ok || !data.cards?.length) {
    return null;
  }

  return data as PackOpenResult;
}

async function commitPreparedPack(
  prepared: PackOpenResult
): Promise<PackOpenResult> {
  const res = await fetch("/api/packs/open", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preparedPack: prepared }),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<
    PackOpenResult & { error?: string }
  >;

  if (!res.ok || !data.cards?.length) {
    throw new Error(data.error ?? "Failed to save prepared pack");
  }

  return data as PackOpenResult;
}

export function usePackOpen() {
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  const [phase, setPhase] = useState<PackPhase>("idle");
  const [result, setResult] = useState<PackOpenResult | null>(null);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const prefetchedPackRef = useRef<PackOpenResult | null>(null);
  const prefetchInFlightRef = useRef(false);
  const preloadCancelRef = useRef<(() => void) | null>(null);

  const cancelPreload = useCallback(() => {
    preloadCancelRef.current?.();
    preloadCancelRef.current = null;
  }, []);

  const warmPackArt = useCallback(
    (pack: PackOpenResult) => {
      cancelPreload();
      preloadCancelRef.current = preloadPackArt(pack.cards);
    },
    [cancelPreload]
  );

  const prefetchNextPack = useCallback(async () => {
    if (prefetchInFlightRef.current || prefetchedPackRef.current) {
      return;
    }

    prefetchInFlightRef.current = true;
    try {
      const prepared = await fetchPreparedPack();
      if (prepared) {
        prefetchedPackRef.current = prepared;
        warmPackArt(prepared);
      }
    } finally {
      prefetchInFlightRef.current = false;
    }
  }, [warmPackArt]);

  const applyPackResult = useCallback(
    (data: PackOpenResult) => {
      if (!data.savedToCollection) {
        incrementGuestPackOpenCount();
      }

      setResult(data);
      setPhase("revealing");
      setRevealIndex(0);
      warmPackArt(data);
      void prefetchNextPack();
    },
    [prefetchNextPack, warmPackArt]
  );

  useEffect(() => {
    if (phase !== "idle") {
      return;
    }

    void prefetchNextPack();
  }, [phase, prefetchNextPack]);

  useEffect(() => cancelPreload, [cancelPreload]);

  useEffect(() => {
    if (!result || revealIndex < 0) {
      return;
    }

    cancelPreload();
    preloadCancelRef.current = preloadPackArt(result.cards, [
      revealIndex,
      revealIndex + 1,
    ]);
  }, [cancelPreload, result, revealIndex]);

  const openPack = useCallback(async () => {
    setPhase("opening");
    setError(null);
    setResult(null);
    setRevealIndex(-1);

    const prefetched = prefetchedPackRef.current;
    if (prefetched) {
      warmPackArt(prefetched);
    }

    if (prefetched) {
      prefetchedPackRef.current = null;

      try {
        applyPackResult({
          ...prefetched,
          savedToCollection: isSignedIn,
        });

        if (isSignedIn) {
          const committed = await commitPreparedPack(prefetched);
          setResult(committed);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        setPhase("idle");
      }
      return;
    }

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

      applyPackResult(data as PackOpenResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setPhase("idle");
    }
  }, [applyPackResult, isSignedIn]);

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
