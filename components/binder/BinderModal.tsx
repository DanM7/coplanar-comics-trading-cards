"use client";

import { CardFlip } from "@/components/cards/CardFlip";
import type { GeneratedCard } from "@/types/card";
import styles from "./binder.module.css";

interface BinderModalProps {
  card: GeneratedCard;
  quantity: number;
  onClose: () => void;
}

export function BinderModal({ card, quantity, onClose }: BinderModalProps) {
  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal
      aria-label={`${card.front.name} card detail`}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <CardFlip card={card} />
        {quantity > 1 && (
          <p className={styles.stats}>Duplicates owned: {quantity}</p>
        )}
      </div>
    </div>
  );
}
