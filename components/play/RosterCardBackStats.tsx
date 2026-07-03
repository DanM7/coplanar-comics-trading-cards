import type { CSSProperties } from "react";
import { sumCardStats } from "@/lib/card-power-summary";
import {
  CORE_STAT_BLOCK_DEFS,
  LEFT_STAT_COLUMN_KEYS,
  MOVE_ATTACK_TYPE_COLORS,
  RIGHT_STAT_COLUMN_KEYS,
} from "@/lib/card-stat-blocks";
import { MAX_TEAM_STAT_POWER } from "@/services/game/team-slots";
import type { MoveDisplay } from "@/types/character-moves";
import {
  MAX_CORE_STAT_BLOCKS,
  MAX_MOVE_STAT_BLOCKS,
} from "@/types/character-moves";
import type { CoreStatKey } from "@/types/character-stats";
import type { CardStats } from "@/types/card";
import styles from "./play.module.css";

interface RosterCardBackStatsProps {
  stats: CardStats;
  moves?: MoveDisplay[];
}

function filledBlockCount(
  value: number | null | undefined,
  maxBlocks: number
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(maxBlocks, Math.max(0, Math.round(value)));
}

function CoreStatBlockRow({
  statKey,
  value,
}: {
  statKey: CoreStatKey;
  value: number | null | undefined;
}) {
  const { label, color } = CORE_STAT_BLOCK_DEFS[statKey];
  const filled = filledBlockCount(value, MAX_CORE_STAT_BLOCKS);
  const rowStyle = { "--stat-color": color } as CSSProperties;

  return (
    <div className={styles.rosterCardBackCoreRow} style={rowStyle}>
      <span
        className={styles.rosterCardBackCoreBlocks}
        aria-label={`${label}: ${filled} of ${MAX_CORE_STAT_BLOCKS}`}
      >
        {Array.from({ length: MAX_CORE_STAT_BLOCKS }, (_, index) => {
          const isFilled = index < filled;
          return (
            <span
              key={index}
              className={[
                styles.rosterCardBackBlock,
                isFilled
                  ? styles.rosterCardBackBlockFilled
                  : styles.rosterCardBackBlockEmpty,
              ].join(" ")}
              aria-hidden
            />
          );
        })}
      </span>
    </div>
  );
}

function MoveStatSection({ move }: { move: MoveDisplay }) {
  const filled = filledBlockCount(move.value, MAX_MOVE_STAT_BLOCKS);
  const moveFillColor = MOVE_ATTACK_TYPE_COLORS[move.attackType];

  return (
    <div className={styles.rosterCardBackMoveSection}>
      <span className={styles.rosterCardBackMoveLabel}>{move.name}</span>
      <div className={styles.rosterCardBackCore}>
        <div className={styles.rosterCardBackCoreColumn}>
          <div className={styles.rosterCardBackCoreRow}>
            <span
              className={styles.rosterCardBackCoreBlocks}
              aria-label={`${move.name}: ${filled} of ${MAX_MOVE_STAT_BLOCKS}`}
            >
              {Array.from({ length: MAX_MOVE_STAT_BLOCKS }, (_, index) => {
                const isFilled = index < filled;
                const blockStyle = isFilled
                  ? ({ "--move-type-fill": moveFillColor } as CSSProperties)
                  : undefined;

                return (
                  <span
                    key={index}
                    className={[
                      styles.rosterCardBackBlock,
                      styles.rosterCardBackMoveBlock,
                      isFilled
                        ? styles.rosterCardBackBlockMoveFilled
                        : styles.rosterCardBackBlockEmpty,
                    ].join(" ")}
                    style={blockStyle}
                    aria-hidden
                  />
                );
              })}
            </span>
          </div>
        </div>
        <div className={styles.rosterCardBackCoreColumn} aria-hidden />
      </div>
    </div>
  );
}

export function RosterCardBackStats({
  stats,
  moves = [],
}: RosterCardBackStatsProps) {
  const move1 = moves[0]?.name.trim() ? moves[0] : null;
  const move2 = moves[1]?.name.trim() ? moves[1] : null;
  const statPower = sumCardStats(stats) ?? 0;

  return (
    <div className={styles.rosterCardBackLayout}>
      <div className={styles.rosterCardBackStatsHeader}>
        <p className={styles.rosterCardBackStatPower}>
          Stat Power: {statPower}/{MAX_TEAM_STAT_POWER}
        </p>

        <div className={styles.rosterCardBackCore}>
          <div className={styles.rosterCardBackCoreColumn}>
            {LEFT_STAT_COLUMN_KEYS.map((statKey) => (
              <CoreStatBlockRow
                key={statKey}
                statKey={statKey}
                value={stats[statKey]}
              />
            ))}
          </div>
          <div className={styles.rosterCardBackCoreColumn}>
            {RIGHT_STAT_COLUMN_KEYS.map((statKey) => (
              <CoreStatBlockRow
                key={statKey}
                statKey={statKey}
                value={stats[statKey]}
              />
            ))}
          </div>
        </div>
      </div>

      {move1 || move2 ? (
        <div className={styles.rosterCardBackMoves}>
          {move1 ? <MoveStatSection move={move1} /> : null}
          {move2 ? <MoveStatSection move={move2} /> : null}
        </div>
      ) : null}
    </div>
  );
}
