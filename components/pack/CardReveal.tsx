"use client";

import { TradingCard } from "@/components/cards/TradingCard";
import type { GeneratedCard } from "@/types/card";
import styles from "./pack.module.css";

interface CardRevealProps {
  cards: GeneratedCard[];
  revealIndex: number;
  onRevealNext: () => void;
  onRevealAll: () => void;
  onReset: () => void;
  phase: string;
  savedToCollection?: boolean;
}

export function CardReveal({
  cards,
  revealIndex,
  onRevealNext,
  onRevealAll,
  onReset,
  phase,
  savedToCollection,
}: CardRevealProps) {
  if (revealIndex < 0 || cards.length === 0) return null;

  const current = cards[revealIndex];
  const isLastCard = revealIndex === cards.length - 1;
  const showCompleteUi = phase === "complete" || isLastCard;

  return (
    <div className={styles.revealLayout}>
      <aside className={styles.cardStrip} aria-label="Opened cards in this pack">
        {cards.map((card, i) => {
          const isRevealed = i <= revealIndex;
          const thumbUrl = card.finishedFrontUrl ?? card.front.portraitUrl;

          return (
            <div
              key={`${card.characterId}-${i}`}
              className={[
                styles.stripThumb,
                isRevealed ? styles.revealed : styles.unrevealed,
                i === revealIndex ? styles.current : "",
              ]
                .filter(Boolean)
                .join(" ")}
              title={isRevealed ? card.front.name : "Unrevealed card"}
              style={
                isRevealed && thumbUrl
                  ? {
                      backgroundImage: `url("${thumbUrl}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {!isRevealed && (
                <span className={styles.stripUnknown} aria-hidden>
                  ?
                </span>
              )}
            </div>
          );
        })}
      </aside>

      <div className={styles.cardHero}>
        <div className={styles.cardStage}>
          <div key={revealIndex} className={styles.cardSlide}>
            <TradingCard card={current} />
          </div>
        </div>
      </div>

      <div className={styles.revealControls}>
        {!showCompleteUi ? (
          <>
            <button type="button" className={styles.btn} onClick={onRevealNext}>
              Next Card ({revealIndex + 1}/{cards.length})
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
            <p className={styles.completeMessage}>
              {savedToCollection
                ? "Pack complete! Cards added to your collection."
                : "Pack complete! Sign in to save cards to your collection."}
            </p>
            <button type="button" className={styles.btn} onClick={onReset}>
              Open another pack
            </button>
          </>
        )}
      </div>
    </div>
  );
}
