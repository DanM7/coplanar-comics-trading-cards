"use client";

import { useState } from "react";
import type { GeneratedCard } from "@/types/card";
import { CardFront } from "./CardFront";
import { CardBack } from "./CardBack";
import { DesignedCardFace } from "./DesignedCardFace";
import { FinishedCardImage } from "./FinishedCardImage";
import styles from "./card.module.css";

interface CardFlipProps {
  card: GeneratedCard;
  compact?: boolean;
  defaultFlipped?: boolean;
  flipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
  onFlip?: (flipped: boolean) => void;
}

function usesFlatFlip(card: GeneratedCard): boolean {
  return Boolean(
    card.display || (card.finishedFrontUrl && card.finishedBackUrl)
  );
}

export function CardFlip({
  card,
  compact,
  defaultFlipped = false,
  flipped,
  onFlipChange,
  onFlip,
}: CardFlipProps) {
  const [internalFlipped, setInternalFlipped] = useState(defaultFlipped);
  const isControlled = flipped !== undefined;
  const isFlipped = isControlled ? flipped : internalFlipped;
  const flatFlip = usesFlatFlip(card);

  const setFlipped = (next: boolean) => {
    if (!isControlled) {
      setInternalFlipped(next);
    }
    onFlipChange?.(next);
    onFlip?.(next);
  };

  const toggle = () => {
    setFlipped(!isFlipped);
  };

  const front = card.display ? (
    <DesignedCardFace side="front" display={card.display} />
  ) : (
    <FinishedCardImage
      side="front"
      url={card.finishedFrontUrl}
      alt={`${card.front.name} card front`}
      fallback={<CardFront front={card.front} compact={compact} />}
    />
  );

  const back = card.display ? (
    <DesignedCardFace side="back" display={card.display} />
  ) : (
    <FinishedCardImage
      side="back"
      url={card.finishedBackUrl}
      alt={`${card.front.name} card back`}
      fallback={<CardBack back={card.back} />}
    />
  );

  return (
    <button
      type="button"
      className={[
        styles.card,
        compact ? styles.compact : "",
        flatFlip ? styles.cardFlatFlip : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={toggle}
      aria-label={isFlipped ? "Show card front" : "Show card back"}
    >
      {flatFlip ? (
        <div className={styles.cardInnerFlat}>{isFlipped ? back : front}</div>
      ) : (
        <div className={`${styles.cardInner} ${isFlipped ? styles.flipped : ""}`}>
          {front}
          {back}
        </div>
      )}
    </button>
  );
}
