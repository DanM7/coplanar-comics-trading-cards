"use client";

import { useEffect, useState } from "react";

/** Phone-sized landscape: short viewport height, or narrow width in landscape. */
export const COMPACT_LANDSCAPE_MQ =
  "(orientation: landscape) and (max-height: 520px), (max-width: 899px) and (orientation: landscape)";

export function useCompactLandscape(): boolean {
  const [compactLandscape, setCompactLandscape] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(COMPACT_LANDSCAPE_MQ);

    const sync = () => {
      setCompactLandscape(media.matches);
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return compactLandscape;
}
