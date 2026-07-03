"use client";

import type { Ref } from "react";
import { EditableCardFace } from "@/components/editor/EditableCardFace";
import type { CardDisplay } from "@/types/card";
import type { CardSide } from "@/types/card-design";
import cardStyles from "./card.module.css";
import styles from "./designed-card.module.css";

interface DesignedCardFaceProps {
  side: CardSide;
  display: CardDisplay;
  canvasRef?: Ref<HTMLDivElement>;
}

/**
 * Live CSS card face for pack, binder, and editor preview.
 * Layout/CSS lives in EditableCardFace + editor.module.css; this wrapper only
 * provides the face shell and responsive canvas scaling (.canvas).
 */
export function DesignedCardFace({
  side,
  display,
  canvasRef,
}: DesignedCardFaceProps) {
  const faceClass = side === "front" ? cardStyles.front : cardStyles.back;

  return (
    <div className={`${cardStyles.face} ${faceClass} ${styles.host}`}>
      <EditableCardFace
        side={side}
        portraitUrl={display.frontPortraitUrl}
        backPortraitUrl={display.backPortraitUrl}
        meta={display.meta}
        design={display.design}
        canvasRef={canvasRef}
        canvasClassName={styles.canvas}
      />
    </div>
  );
}