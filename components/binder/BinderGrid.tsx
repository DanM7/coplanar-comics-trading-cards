"use client";

import { CardFront } from "@/components/cards/CardFront";
import { FinishedCardImage } from "@/components/cards/FinishedCardImage";
import cardStyles from "@/components/cards/card.module.css";
import type { BinderSlot } from "@/types/collection";
import { EmptySlot } from "./EmptySlot";
import styles from "./binder.module.css";

interface BinderGridProps {
  slots: BinderSlot[];
  onSelectCard: (slot: BinderSlot) => void;
}

export function BinderGrid({ slots, onSelectCard }: BinderGridProps) {
  return (
    <div className={styles.pageGrid}>
      {slots.map((slot) => (
        <div key={slot.printId} className={styles.slotWrapper}>
          {slot.owned && slot.card ? (
            <button
              type="button"
              className={styles.slot}
              onClick={() => onSelectCard(slot)}
              aria-label={`View ${slot.card!.front.name}`}
            >
              <div className={`${cardStyles.card} ${cardStyles.compact}`}>
                <div className={cardStyles.cardInner}>
                  <FinishedCardImage
                    side="front"
                    url={slot.card.finishedFrontUrl}
                    alt={`${slot.card.front.name} card front`}
                    fallback={<CardFront front={slot.card.front} compact />}
                  />
                </div>
              </div>
            </button>
          ) : (
            <EmptySlot printId={slot.printId} />
          )}
          {slot.quantity > 1 && (
            <span className={styles.duplicateBadge}>×{slot.quantity}</span>
          )}
        </div>
      ))}
    </div>
  );
}
