"use client";

import { useState, type ReactNode, type SyntheticEvent } from "react";
import styles from "./card.module.css";

interface FinishedCardImageProps {
  url?: string;
  alt: string;
  fallback: ReactNode;
  side: "front" | "back";
}

function isValidImageLoad(event: SyntheticEvent<HTMLImageElement>): boolean {
  const img = event.currentTarget;
  return img.naturalWidth > 0 && img.naturalHeight > 0;
}

/** Renders a baked card PNG when available; falls back to composed CSS card. */
export function FinishedCardImage({
  url,
  alt,
  fallback,
  side,
}: FinishedCardImageProps) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return <>{fallback}</>;
  }

  return (
    <div
      className={`${styles.face} ${side === "back" ? styles.back : styles.front}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className={styles.finishedCardArt}
        onError={() => setFailed(true)}
        onLoad={(event) => {
          if (!isValidImageLoad(event)) {
            setFailed(true);
          }
        }}
      />
    </div>
  );
}
