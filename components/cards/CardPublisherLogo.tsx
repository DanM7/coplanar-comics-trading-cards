"use client";

import type { CSSProperties } from "react";
import { CARD_PUBLISHER_LOGO_URL } from "@/constants/project";
import styles from "./card.module.css";

interface CardPublisherLogoProps {
  compact?: boolean;
  className?: string;
  /** Size as % of CSS base width (default 100). */
  scale?: number;
  /** +X moves right, +Y moves up (px). */
  offsetX?: number;
  offsetY?: number;
}

export function publisherLogoTransformStyle(
  scale = 100,
  offsetX = 0,
  offsetY = 0
): CSSProperties {
  const s = Number.isFinite(scale) ? scale : 100;
  const x = Number.isFinite(offsetX) ? offsetX : 0;
  const y = Number.isFinite(offsetY) ? offsetY : 0;
  return {
    transform: `translate(${x}px, ${-y}px) scale(${s / 100})`,
    transformOrigin: "bottom right",
  };
}

/** Coplanar Comics publisher mark — bottom-right on card fronts. */
export function CardPublisherLogo({
  compact,
  className,
  scale,
  offsetX,
  offsetY,
}: CardPublisherLogoProps) {
  const hasTuning =
    scale !== undefined || offsetX !== undefined || offsetY !== undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={CARD_PUBLISHER_LOGO_URL}
      alt=""
      className={[
        styles.publisherLogo,
        compact ? styles.publisherLogoCompact : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        hasTuning ? publisherLogoTransformStyle(scale, offsetX, offsetY) : undefined
      }
      crossOrigin="anonymous"
      aria-hidden
    />
  );
}
