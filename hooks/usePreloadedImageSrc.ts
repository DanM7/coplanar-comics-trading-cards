"use client";

import { useEffect, useState } from "react";
import { preloadImageUrl } from "@/lib/preload-images";

/**
 * Keeps the previous image visible until the next URL has decoded,
 * avoiding empty flashes when flipping between cards.
 */
export function usePreloadedImageSrc(url: string): string {
  const [displayUrl, setDisplayUrl] = useState(url);

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setDisplayUrl("");
      return;
    }

    let cancelled = false;
    preloadImageUrl(trimmed);

    const img = new Image();
    img.decoding = "async";

    const commit = () => {
      if (!cancelled) {
        setDisplayUrl(trimmed);
      }
    };

    img.onload = commit;
    img.onerror = commit;
    img.src = trimmed;

    if (img.complete) {
      commit();
    }

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return displayUrl;
}
