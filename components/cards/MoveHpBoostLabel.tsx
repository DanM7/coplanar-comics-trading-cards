import type { CSSProperties } from "react";
import { formatHpBoostLabel } from "@/lib/move-stat-effects";
import type { MoveHpBoostEffect, MoveScope } from "@/types/character-moves";
import cardStyles from "./stat-blocks.module.css";
import rosterStyles from "../play/play.module.css";

const HP_BOOST_COLOR = "#f7fafc";

type MoveHpBoostLabelVariant = "card" | "roster";

interface MoveHpBoostLabelProps {
  label: string;
  hpBoost: MoveHpBoostEffect;
  scope?: MoveScope;
  variant: MoveHpBoostLabelVariant;
}

export function MoveHpBoostLabel({
  label,
  hpBoost,
  scope,
  variant,
}: MoveHpBoostLabelProps) {
  const styles = variant === "card" ? cardStyles : rosterStyles;
  const effectLabel = formatHpBoostLabel(hpBoost.percent, scope);
  const isTeam = scope === "team";
  const colorStyle = {
    "--boost-color": HP_BOOST_COLOR,
    color: HP_BOOST_COLOR,
  } as CSSProperties;

  return (
    <span className={styles.statBlockHpBoostRow} aria-label={`${label}: ${effectLabel}`}>
      {isTeam ? (
        <span className={styles.statBlockHpBoostPrefix}>Team: </span>
      ) : null}
      <span
        className={[
          styles.statBlockHpBoostTrack,
          isTeam ? styles.statBlockHpBoostTrackTeam : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={styles.statEffectTriangle} style={colorStyle} aria-hidden>
          ▲
        </span>
        <span className={styles.statBlockHpBoostAmount}>
          {hpBoost.percent}% HP
        </span>
      </span>
    </span>
  );
}