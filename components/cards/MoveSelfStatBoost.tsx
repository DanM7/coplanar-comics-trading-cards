import type { CSSProperties } from "react";
import { CORE_STAT_BLOCK_DEFS } from "@/lib/card-stat-blocks";
import { statBoostBlockCount } from "@/lib/move-stat-effects";
import type { MoveStatBoostEffect } from "@/types/character-moves";
import cardStyles from "./stat-blocks.module.css";
import rosterStyles from "../play/play.module.css";

type MoveSelfStatBoostVariant = "card" | "roster";

interface MoveSelfStatBoostProps {
  label: string;
  effects: MoveStatBoostEffect[];
  variant: MoveSelfStatBoostVariant;
}

export function MoveSelfStatBoost({
  label,
  effects,
  variant,
}: MoveSelfStatBoostProps) {
  const styles = variant === "card" ? cardStyles : rosterStyles;
  const effectSummary = effects
    .map(
      (effect) =>
        `${CORE_STAT_BLOCK_DEFS[effect.stat].label} +${effect.amount}`
    )
    .join(", ");

  return (
    <span
      className={styles.selfStatBoostRow}
      aria-label={`${label}: ${effectSummary}`}
    >
      {effects.map((effect, groupIndex) => {
        const color = CORE_STAT_BLOCK_DEFS[effect.stat].color;
        const colorStyle = {
          "--boost-color": color,
          color,
        } as CSSProperties;
        const triangleCount = statBoostBlockCount(effect.amount);

        return (
          <span
            key={`${effect.stat}-${groupIndex}`}
            className={styles.selfStatBoostGroup}
          >
            {Array.from({ length: triangleCount }, (_, index) => (
              <span
                key={index}
                className={styles.statEffectTriangle}
                style={colorStyle}
                aria-hidden
              >
                ▲
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}
