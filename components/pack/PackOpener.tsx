"use client";

import { usePackOpen } from "@/hooks/usePackOpen";
import { FoilPack } from "./FoilPack";
import { CardReveal } from "./CardReveal";
import styles from "./pack.module.css";

const PACK_SUBTITLE =
  "Each foil pack contains 10 cards. Equal pull rates for now — rarity weighting comes later.";

export function PackOpener() {
  const {
    phase,
    result,
    revealIndex,
    error,
    openPack,
    revealNext,
    revealAll,
    reset,
  } = usePackOpen();

  const foilPhase =
    phase === "opening"
      ? "opening"
      : phase === "revealing" || phase === "complete"
        ? "opened"
        : "idle";

  const isRevealing =
    result && phase !== "idle" && phase !== "opening";

  const showFoil =
    phase === "idle" ||
    phase === "opening" ||
    (phase === "revealing" && revealIndex < 0);

  return (
    <div
      className={`${styles.packScene} ${isRevealing || showFoil ? styles.packSceneActive : ""}`}
    >
      {showFoil && (
        <div className={styles.idleLayout}>
          <div className={styles.cardHero}>
            <div className={styles.cardStage}>
              <FoilPack
                phase={foilPhase}
                onOpen={phase === "idle" ? () => void openPack() : () => {}}
                disabled={phase !== "idle"}
              />
            </div>
          </div>

          <aside className={styles.packSidebar}>
            {phase === "idle" && (
              <>
                <p className={styles.message}>
                  Tap the pack to open. Sign in anytime to save
                  your collection.
                </p>
                <p className={styles.packSubtitle}>{PACK_SUBTITLE}</p>
              </>
            )}
            {phase === "opening" && (
              <p className={styles.message}>Opening pack…</p>
            )}
          </aside>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {isRevealing && (
        <CardReveal
          cards={result.cards}
          revealIndex={revealIndex}
          onRevealNext={revealNext}
          onRevealAll={revealAll}
          onReset={reset}
          phase={phase}
          savedToCollection={result.savedToCollection}
        />
      )}
    </div>
  );
}
