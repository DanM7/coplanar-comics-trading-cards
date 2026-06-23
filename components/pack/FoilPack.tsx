"use client";

import { CARD_PUBLISHER_LOGO_URL, PROJECT_NAME } from "@/constants/project";
import styles from "./pack.module.css";

interface FoilPackProps {
  phase: "idle" | "opening" | "opened";
  onOpen: () => void;
  disabled?: boolean;
}

export function FoilPack({ phase, onOpen, disabled }: FoilPackProps) {
  const classNames = [
    styles.foilPack,
    phase === "opening" ? styles.opening : "",
    phase === "opened" ? styles.opened : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classNames}
      onClick={onOpen}
      disabled={disabled || phase !== "idle"}
      aria-label="Open foil pack"
    >
      <div className={styles.foilSurface}>
        <div className={styles.foilBurst} aria-hidden />
        <div className={styles.foilLogoWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CARD_PUBLISHER_LOGO_URL}
            alt=""
            className={styles.foilLogo}
            crossOrigin="anonymous"
          />
        </div>
        <p className={styles.foilFooter}>{PROJECT_NAME.toUpperCase()}</p>
      </div>
    </button>
  );
}
