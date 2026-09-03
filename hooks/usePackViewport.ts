"use client";

import { PACK_STRIP_GRID_MQ } from "@/lib/pack-viewport";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** 3×4 thumb grid in reveal sidebar; one scroll row when stacked. */
export function usePackStripGrid(): boolean {
  return useMediaQuery(PACK_STRIP_GRID_MQ);
}
