"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  dismissSignInReminder,
  getGuestPackOpenCount,
  isSignInReminderDismissed,
} from "@/lib/guest-pack-session";
import { CARDS_PER_PACK } from "@/constants/series";
import { usePackOpen } from "@/hooks/usePackOpen";
import { FoilPack } from "./FoilPack";
import { CardReveal } from "./CardReveal";
import { SignInReminderModal } from "./SignInReminderModal";
import styles from "./pack.module.css";

const PACK_SUBTITLE = `Each foil pack contains ${CARDS_PER_PACK} cards. Equal pull rates for now — rarity weighting comes later.`;

export function PackOpener() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
  const [showSignInReminder, setShowSignInReminder] = useState(false);

  useEffect(() => {
    if (authLoading || isAuthenticated || phase !== "complete") {
      return;
    }
    if (isSignInReminderDismissed()) {
      return;
    }
    if (getGuestPackOpenCount() >= 2) {
      setShowSignInReminder(true);
    }
  }, [authLoading, isAuthenticated, phase]);

  useEffect(() => {
    if (isAuthenticated) {
      setShowSignInReminder(false);
    }
  }, [isAuthenticated]);

  const handleDismissSignInReminder = () => {
    dismissSignInReminder();
    setShowSignInReminder(false);
  };

  const foilPhase =
    phase === "opening"
      ? "opening"
      : phase === "revealing" || phase === "complete"
        ? "opened"
        : "idle";

  const isRevealing =
    result && phase !== "idle" && phase !== "opening";

  const showIdleLayout = phase === "idle" || phase === "opening";

  return (
    <>
      <div
        className={`${styles.packScene} ${isRevealing || showIdleLayout ? styles.packSceneActive : ""}`}
      >
        {showIdleLayout && (
          <div
            className={[
              styles.idleLayout,
              compactLandscape ? styles.idleLayoutLandscape : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
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
                    Tap the pack to open.
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
            newCharacterIds={result.newCharacterIds ?? result.cardIds}
            revealIndex={revealIndex}
            onRevealNext={revealNext}
            onRevealAll={revealAll}
            onReset={reset}
            phase={phase}
            savedToCollection={result.savedToCollection}
          />
        )}
      </div>

      {showSignInReminder && !isAuthenticated && (
        <SignInReminderModal onDismiss={handleDismissSignInReminder} />
      )}
    </>
  );
}
