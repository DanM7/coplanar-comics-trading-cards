"use client";

import { useState } from "react";
import type { GeneratedCard } from "@/types/card";
import { CardFront } from "./CardFront";
import { CardBack } from "./CardBack";
import { FinishedCardImage } from "./FinishedCardImage";
import styles from "./card.module.css";

interface CardFlipProps {
  card: GeneratedCard;
  compact?: boolean;
  defaultFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
}

export function CardFlip({
  card,
  compact,
  defaultFlipped = false,
  onFlip,
}: CardFlipProps) {
  const [flipped, setFlipped] = useState(defaultFlipped);

  const toggle = () => {
    const next = !flipped;
    setFlipped(next);
    onFlip?.(next);
  };

  return (
    <button
      type="button"
      className={`${styles.card} ${compact ? styles.compact : ""}`}
      onClick={toggle}
      aria-label={flipped ? "Show card front" : "Show card back"}
    >
      <div className={`${styles.cardInner} ${flipped ? styles.flipped : ""}`}>
        <FinishedCardImage
          side="front"
          url={card.finishedFrontUrl}
          alt={`${card.front.name} card front`}
          fallback={<CardFront front={card.front} compact={compact} />}
        />
        <FinishedCardImage
          side="back"
          url={card.finishedBackUrl}
          alt={`${card.front.name} card back`}
          fallback={<CardBack back={card.back} />}
        />
      </div>
    </button>
  );
}
