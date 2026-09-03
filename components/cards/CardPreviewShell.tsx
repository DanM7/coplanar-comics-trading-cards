import type { CSSProperties, ReactNode } from "react";
import {
  CARD_EDITOR_HEIGHT,
  CARD_EDITOR_WIDTH,
} from "@/lib/export-card-png";
import styles from "./card.module.css";

interface CardPreviewShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fixed-size card container for editor preview and PNG export.
 * Uses the same `.card` query container as pack/binder flip buttons so
 * `DesignedCardFace` typography scales identically everywhere.
 */
export function CardPreviewShell({ children, className }: CardPreviewShellProps) {
  return (
    <div
      className={[styles.card, styles.previewCardShell, className]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--card-width": `${CARD_EDITOR_WIDTH}px`,
          "--card-height": `${CARD_EDITOR_HEIGHT}px`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
