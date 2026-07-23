"use client";

import { PACK_COMPACT_HORIZONTAL_MQ } from "@/lib/pack-viewport";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Re-export for site header / play layout (same query as compact horizontal pack viewports). */
export const COMPACT_LANDSCAPE_MQ = PACK_COMPACT_HORIZONTAL_MQ;

/** Short or narrow landscape viewport (used by site header / play mode). */
export function useCompactLandscape(): boolean {
  return useMediaQuery(PACK_COMPACT_HORIZONTAL_MQ);
}
