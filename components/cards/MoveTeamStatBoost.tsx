import type { CSSProperties } from "react";
import { CORE_STAT_BLOCK_DEFS } from "@/lib/card-stat-blocks";
import { statBoostBlockCount } from "@/lib/move-stat-effects";
import type { MoveStatBoostEffect } from "@/types/character-moves";
import cardStyles from "./stat-blocks.module.css";
import rosterStyles from "../play/play.module.css";

type MoveTeamStatBoostVariant = "card" | "roster";

interface MoveTeamStatBoostProps {
  label: string;
  effects: MoveStatBoostEffect[];
  variant: MoveTeamStatBoostVariant;
}

function TeamUpTriangles({
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
          ▲
        </span>
      ))}
    </>
  );
}

export function MoveTeamStatBoost({
  label,
  effects,
  variant,
}: MoveTeamStatBoostProps) {
  const styles = variant === "card" ? cardStyles : rosterStyles;
  const effectSummary = effects
    .map(
      (effect) =>
        `${CORE_STAT_BLOCK_DEFS[effect.stat].label} +${effect.amount}`
    )
    .join(", ");

  return (
    <span
      className={styles.teamStatBoostRow}
      aria-label={`${label}: Team ${effectSummary}`}
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
              <span className={styles.teamStatBoostLead} style={colorStyle}>
                Team:{" "}
                <TeamUpTriangles
                  count={triangleCount}
                  className={styles.statEffectTriangle}
                  style={colorStyle}
                />
              </span>
            ) : (
              <TeamUpTriangles
                count={triangleCount}
                className={`${styles.teamStatBoostPlus} ${styles.statEffectTriangle}`}
                style={colorStyle}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}
