"use client";

import { useEffect, useMemo, useState } from "react";
import { TradingCard } from "@/components/cards/TradingCard";
import { usePackStripGrid } from "@/hooks/usePackViewport";
import { alignmentBorderColor } from "@/lib/alignment-border-color";
import { PackCardStrip } from "./PackCardStrip";
import { normalizeCharacterId } from "@/lib/character-id";
import { preloadCardArtEager, waitForCardBackPortrait } from "@/lib/pack-art-preload";
import type { GeneratedCard } from "@/types/card";
import styles from "./pack.module.css";

interface CardRevealProps {
  cards: GeneratedCard[];
  newCharacterIds: string[];
  revealIndex: number;
  onRevealNext: () => void;
  onRevealAll: () => void;
  onReset: () => void;
  phase: string;
  savedToCollection?: boolean;
}

export function CardReveal({
  cards,
  newCharacterIds,
  revealIndex,
  onRevealNext,
  onRevealAll,
  onReset,
  phase,
  savedToCollection,
}: CardRevealProps) {
  const useStripGrid = usePackStripGrid();
  const [viewIndex, setViewIndex] = useState(revealIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progressBackAcknowledged, setProgressBackAcknowledged] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [newBadgeFading, setNewBadgeFading] = useState(false);

  const newCharacterIdSet = useMemo(
    () => new Set(newCharacterIds.map((id) => normalizeCharacterId(id))),
    [newCharacterIds]
  );

  useEffect(() => {
    setViewIndex(revealIndex);
  }, [revealIndex]);

  useEffect(() => {
    setIsFlipped(false);
    setProgressBackAcknowledged(false);
  }, [revealIndex]);

  useEffect(() => {
    setIsFlipped(false);
  }, [viewIndex]);

  const canRender = revealIndex >= 0 && cards.length > 0;
  const displayed = canRender
    ? (cards[viewIndex] ?? cards[revealIndex])
    : null;

  useEffect(() => {
    if (!displayed) {
      return;
    }

    preloadCardArtEager(displayed);
    void waitForCardBackPortrait(displayed);
  }, [displayed?.characterId, viewIndex]);

  useEffect(() => {
    if (!cards.length) {
      return;
    }

    const progressCard = cards[revealIndex];
    if (progressCard) {
      preloadCardArtEager(progressCard);
      void waitForCardBackPortrait(progressCard);
    }
  }, [cards, revealIndex]);

  const isProgressCard = canRender && viewIndex === revealIndex;
  const isNewCard =
    displayed !== null &&
    newCharacterIdSet.has(normalizeCharacterId(displayed.characterId));
  const needsBackView =
    isNewCard && isProgressCard && !progressBackAcknowledged;

  useEffect(() => {
    if (!canRender || !displayed || !isNewCard || isFlipped) {
      setShowNewBadge(false);
      setNewBadgeFading(false);
      return;
    }

    setShowNewBadge(true);
    setNewBadgeFading(false);
    const fadeTimer = window.setTimeout(() => setNewBadgeFading(true), 2500);
    const hideTimer = window.setTimeout(() => setShowNewBadge(false), 3400);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [
    canRender,
    displayed?.characterId,
    isFlipped,
    isNewCard,
    viewIndex,
  ]);

  if (!canRender || !displayed) return null;

  const showCompleteUi = phase === "complete";

  const handlePrimaryAction = () => {
    if (needsBackView && !isFlipped) {
      setIsFlipped(true);
      return;
    }

    if (needsBackView && isFlipped) {
      setProgressBackAcknowledged(true);
    }

    onRevealNext();
  };

  const primaryLabel =
    needsBackView && !isFlipped
      ? "View Back"
      : `Next Card (${revealIndex + 1}/${cards.length})`;

  return (
    <div className={styles.revealLayout}>
      <div className={styles.cardHero}>
        <div className={styles.cardStage}>
          <div key={`${viewIndex}-${displayed.characterId}`} className={styles.cardSlide}>
            <div className={styles.cardHeroStack}>
              {showNewBadge && !isFlipped && (
                <span
                  className={[
                    styles.newCardBadge,
                    newBadgeFading ? styles.newCardBadgeFade : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  New!
                </span>
              )}
              <TradingCard
                card={displayed}
                flipped={isFlipped}
                onFlipChange={setIsFlipped}
              />
            </div>
          </div>
        </div>
      </div>

      <PackCardStrip grid={useStripGrid} activeIndex={viewIndex}>
        {cards.map((card, i) => {
          const isRevealed = i <= revealIndex;
          const thumbUrl = card.finishedFrontUrl ?? card.front.portraitUrl;
          const isViewing = i === viewIndex;
          const isNewInPack = newCharacterIdSet.has(
            normalizeCharacterId(card.characterId)
          );
          const thumbBorderColor = alignmentBorderColor(card.front.alignment);

          return (
            <div
              key={`${card.characterId}-${i}`}
              className={[
                styles.stripItem,
                isViewing ? styles.stripItemCurrent : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {isRevealed ? (
                <button
                  type="button"
                  className={[
                    styles.stripThumb,
                    styles.revealed,
                    isViewing ? styles.current : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  title={card.front.name}
                  aria-label={`View ${card.front.name}`}
                  aria-current={isViewing ? "true" : undefined}
                  onClick={() => setViewIndex(i)}
                  style={{
                    borderColor: thumbBorderColor,
                    boxShadow: isViewing ? `0 0 8px ${thumbBorderColor}` : undefined,
                    ...(thumbUrl
                      ? {
                          backgroundImage: `url("${thumbUrl}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {}),
                  }}
                >
                  {isNewInPack && (
                    <span className={styles.stripNewBadge} aria-hidden>
                      !
                    </span>
                  )}
                </button>
              ) : (
                <div
                  className={`${styles.stripThumb} ${styles.unrevealed}`}
                  title="Unrevealed card"
                  aria-hidden
                >
                  <span className={styles.stripUnknown}>?</span>
                </div>
              )}
              <span
                className={[
                  styles.stripMarker,
                  isViewing && isRevealed ? styles.stripMarkerActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden
              />
            </div>
          );
        })}
      </PackCardStrip>

      <div className={styles.revealControls}>
        {!showCompleteUi ? (
          <>
            <button type="button" className={styles.btn} onClick={handlePrimaryAction}>
              {primaryLabel}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={onRevealAll}
            >
              Reveal All
            </button>
          </>
        ) : (
          <>
            <button type="button" className={styles.btn} onClick={onReset}>
              Open another pack
            </button>
            <p className={styles.completeMessage}>
              {savedToCollection
                ? "Pack complete! Cards added to your collection."
                : "Pack complete! Sign in to save cards to your collection."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
