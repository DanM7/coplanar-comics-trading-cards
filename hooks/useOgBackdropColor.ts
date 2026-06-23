"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_OG_FRAME_BACKDROP,
  sampleImageBackdropColor,
} from "@/lib/sample-image-backdrop-color";

export function useOgBackdropColor(
  imageUrl: string,
  storedColor?: string
): { effectiveColor: string; sampledColor: string | null } {
  const [sampledColor, setSampledColor] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      setSampledColor(null);
      return;
    }

    let cancelled = false;

    void sampleImageBackdropColor(trimmed).then((color) => {
      if (!cancelled) {
        setSampledColor(color);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  const effectiveColor =
    storedColor?.trim() || sampledColor || DEFAULT_OG_FRAME_BACKDROP;

  return { effectiveColor, sampledColor };
}
