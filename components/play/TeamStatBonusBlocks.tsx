import { type CSSProperties } from "react";
import {
  CORE_STAT_BLOCK_DEFS,
  LEFT_STAT_COLUMN_KEYS,
  RIGHT_STAT_COLUMN_KEYS,
} from "@/lib/card-stat-blocks";
import { MAX_CORE_STAT_BLOCKS } from "@/types/character-moves";
import type { CoreStatKey } from "@/types/character-stats";
import type { PlayRosterEntry } from "@/types/game";
import {
  MAX_TEAM_STAT_POWER,
  teamStatPowerFromSlotEntries,
} from "@/services/game/team-slots";
import statBlockStyles from "@/components/cards/stat-blocks.module.css";
import styles from "./play.module.css";

function StatGroup({
  statKey,
  slotValues,
}: {
  statKey: CoreStatKey;
  slotValues: number[];
}) {
  const { label, color } = CORE_STAT_BLOCK_DEFS[statKey];
  const maxValue = Math.max(...slotValues);

  return (
    <div className={styles.teamSlotStatGroup}>
      {slotValues.map((value, slotIndex) => (
        <div key={slotIndex} className={styles.teamSlotStatRow}>
          {slotIndex === 0 ? (
            <span className={styles.teamSlotStatLabel} style={{ color }}>
              {label}
            </span>
          ) : (
            <span className={styles.teamSlotStatLabelSpacer} aria-hidden />
          )}
          <StatBlockRow
            value={value}
            color={color}
            dimmed={value < maxValue}
          />
        </div>
      ))}
    </div>
  );
}

function StatColumn({
  statKeys,
  normalizedSlots,
}: {
  statKeys: CoreStatKey[];
  normalizedSlots: Array<PlayRosterEntry | null>;
}) {
  return (
    <div className={styles.teamSlotStatColumn}>
      {statKeys.map((statKey) => {
        const slotValues = normalizedSlots.map(
          (entry) => entry?.stats[statKey] ?? 0
        );

        return (
          <StatGroup key={statKey} statKey={statKey} slotValues={slotValues} />
        );
      })}
    </div>
  );
}

interface TeamStatBonusBlocksProps {
  slotEntries: Array<PlayRosterEntry | null>;
}

function filledBlockCount(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(MAX_CORE_STAT_BLOCKS, Math.max(0, Math.round(value)));
}

function StatBlockRow({
  value,
  color,
  dimmed,
}: {
  value: number;
  color: string;
  dimmed: boolean;
}) {
  const filled = filledBlockCount(value);
  const rowStyle = {
    "--stat-color": color,
    opacity: dimmed ? 0.34 : 1,
  } as CSSProperties;

  return (
    <span
      className={`${statBlockStyles.statBlocks} ${styles.teamSlotStatBlocks}`}
      style={rowStyle}
      aria-label={`${filled} of ${MAX_CORE_STAT_BLOCKS}`}
    >
      {Array.from({ length: MAX_CORE_STAT_BLOCKS }, (_, index) => {
        const isFilled = index < filled;
        return (
          <span
            key={index}
            className={[
              statBlockStyles.statBlock,
              isFilled
                ? statBlockStyles.statBlockFilled
                : statBlockStyles.statBlockEmpty,
            ].join(" ")}
            aria-hidden
          />
        );
      })}
    </span>
  );
}

export function TeamStatBonusBlocks({
  slotEntries,
}: TeamStatBonusBlocksProps) {
  const normalizedSlots = [
    slotEntries[0] ?? null,
    slotEntries[1] ?? null,
    slotEntries[2] ?? null,
  ];

  const teamStatPower = teamStatPowerFromSlotEntries(normalizedSlots);

  return (
    <div className={styles.teamStatBonusBlocks}>
      <p className={styles.teamStatPower}>
        Team Stat Power:{" "}
        <strong>
          {teamStatPower}/{MAX_TEAM_STAT_POWER}
        </strong>
      </p>

      <div className={styles.teamSlotStatGrid}>
        <StatColumn
          statKeys={LEFT_STAT_COLUMN_KEYS}
          normalizedSlots={normalizedSlots}
        />
        <StatColumn
          statKeys={RIGHT_STAT_COLUMN_KEYS}
          normalizedSlots={normalizedSlots}
        />
      </div>
    </div>
  );
}
