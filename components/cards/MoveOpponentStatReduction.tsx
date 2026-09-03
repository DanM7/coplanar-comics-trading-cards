import type { CSSProperties } from "react";
import { CORE_STAT_BLOCK_DEFS } from "@/lib/card-stat-blocks";
import { statBoostBlockCount } from "@/lib/move-stat-effects";
import type { MoveStatReductionEffect } from "@/types/character-moves";
import cardStyles from "./stat-blocks.module.css";
import rosterStyles from "../play/play.module.css";

type MoveOpponentStatReductionVariant = "card" | "roster";

interface MoveOpponentStatReductionProps {
  label: string;
  effects: MoveStatReductionEffect[];
  variant: MoveOpponentStatReductionVariant;
}

function OpponentDownTriangles({
  count,
  className,
  style,
}: {
  count: number;
  className: string;
  style: CSSProperties;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={className}
          style={style}
          aria-hidden
        >
          ▼
        </span>
      ))}
    </>
  );
}

export function MoveOpponentStatReduction({
  label,
  effects,
  variant,
}: MoveOpponentStatReductionProps) {
  const styles = variant === "card" ? cardStyles : rosterStyles;
  const effectSummary = effects
    .map(
      (effect) =>
        `${CORE_STAT_BLOCK_DEFS[effect.stat].label} -${effect.amount}`
    )
    .join(", ");

  return (
    <span
      className={styles.teamStatBoostRow}
      aria-label={`${label}: Opp ${effectSummary}`}
    >
      {effects.map((effect, groupIndex) => {
        const color = CORE_STAT_BLOCK_DEFS[effect.stat].color;
        const colorStyle = { "--boost-color": color } as CSSProperties;
        const triangleCount = statBoostBlockCount(effect.amount);

        return (
          <span
            key={`${effect.stat}-${groupIndex}`}
            className={styles.teamStatBoostGroup}
          >
            {groupIndex === 0 ? (
              <span
                className={styles.opponentStatReductionLead}
                style={colorStyle}
              >
                Opp.{" "}
                <OpponentDownTriangles
                  count={triangleCount}
                  className={styles.statEffectTriangle}
                  style={colorStyle}
                />
              </span>
            ) : (
              <OpponentDownTriangles
                count={triangleCount}
                className={`${styles.opponentStatReductionPlus} ${styles.statEffectTriangle}`}
                style={colorStyle}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}
