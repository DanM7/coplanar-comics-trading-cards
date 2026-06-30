"use client";

import type { AttackAnimationEffect } from "@/types/character-moves";
import styles from "./play.module.css";

interface AttackEffectOverlayProps {
  effects: AttackAnimationEffect[];
  /** True when the attacker is on the CPU row (bolts travel downward). */
  boltsFromTop: boolean;
  flashColor?: string;
}

export function AttackEffectOverlay({
  effects,
  boltsFromTop,
  flashColor,
}: AttackEffectOverlayProps) {
  const showPulse = effects.includes("pulse");
  const showSpray = effects.includes("spray");
  const showSmoke = effects.includes("smoke");
  const showFlames = effects.includes("flames");
  const showLaserBolts = effects.includes("laserBolts");

  return (
    <>
      <div
        className={styles.hitFlashOverlay}
        style={{
          backgroundColor:
            flashColor ?? "color-mix(in srgb, #ffffff 70%, transparent)",
        }}
        aria-hidden
      />
      {showPulse ? (
        <div
          className={styles.pulseRing}
          style={{ color: flashColor ?? "#ffffff" }}
          aria-hidden
        />
      ) : null}
      {showSpray ? (
        <div
          className={styles.sprayOverlay}
          style={{ color: flashColor ?? "#ffffff" }}
          aria-hidden
        />
      ) : null}
      {showSmoke ? (
        <div className={styles.comicSmokeOverlay} aria-hidden>
          <span className={styles.comicSmokePuff} />
          <span className={styles.comicSmokePuff} />
          <span className={styles.comicSmokePuff} />
          <span className={styles.comicSmokePuff} />
        </div>
      ) : null}
      {showFlames ? (
        <div className={styles.comicFlamesOverlay} aria-hidden>
          <span className={styles.comicFlame} />
          <span className={styles.comicFlame} />
          <span className={styles.comicFlame} />
          <span className={styles.comicFlame} />
        </div>
      ) : null}
      {showLaserBolts ? (
        <div
          className={
            boltsFromTop
              ? styles.comicLaserOverlayFromTop
              : styles.comicLaserOverlayFromBottom
          }
          aria-hidden
        >
          <span className={styles.comicLaserBoltWrap} style={{ left: "22%" }}>
            <span className={styles.comicLaserBolt} />
          </span>
          <span className={styles.comicLaserBoltWrap} style={{ left: "46%" }}>
            <span className={styles.comicLaserBolt} />
          </span>
          <span className={styles.comicLaserBoltWrap} style={{ right: "18%" }}>
            <span className={styles.comicLaserBolt} />
          </span>
          <span className={styles.comicLaserImpact} />
        </div>
      ) : null}
    </>
  );
}
