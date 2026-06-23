import type { CSSProperties } from "react";
import {
  MOVE_ATTACK_TYPE_COLORS,
  MOVE_STAT_COLOR,
  LEFT_STAT_COLUMN_KEYS,
  RIGHT_STAT_COLUMN_KEYS,
  statBlockRowsForKeys,
  type StatBlockRowData,
} from "@/lib/card-stat-blocks";
import type { MoveAttackType, MoveDisplay } from "@/types/character-moves";
import {
  MAX_CORE_STAT_BLOCKS,
  MAX_MOVE_STAT_BLOCKS,
} from "@/types/character-moves";
import type { CardStats } from "@/types/card";

import styles from "./stat-blocks.module.css";

export type { MoveDisplay };

interface CardStatBlocksProps {
  stats: CardStats;
  moves?: MoveDisplay[];
  className?: string;
}

function StatBlockRow({
  label,
  value,
  maxBlocks,
  color,
  isMove,
  moveAttackType = "physical",
}: {
  label: string;
  value: number | null | undefined;
  maxBlocks: number;
  color: string;
  isMove?: boolean;
  moveAttackType?: MoveAttackType;
}) {
  const filled =
    typeof value === "number" && Number.isFinite(value)
      ? Math.min(maxBlocks, Math.max(0, Math.round(value)))
      : 0;

  const rowStyle = { "--stat-color": color } as CSSProperties;
  const moveFillColor = MOVE_ATTACK_TYPE_COLORS[moveAttackType];

  const blocks = (
    <span
      className={styles.statBlocks}
      aria-label={`${label}: ${filled} of ${maxBlocks}`}
    >
      {Array.from({ length: maxBlocks }, (_, index) => {
        const isFilled = index < filled;
        const blockStyle =
          isMove && isFilled
            ? ({ "--move-type-fill": moveFillColor } as CSSProperties)
            : undefined;

        let blockClass = styles.statBlock;
        if (isFilled) {
          blockClass += isMove
            ? ` ${styles.statBlockMoveFilled}`
            : ` ${styles.statBlockFilled}`;
        } else {
          blockClass += ` ${styles.statBlockEmpty}`;
        }

        return (
          <span
            key={index}
            className={blockClass}
            style={blockStyle}
            aria-hidden
          />
        );
      })}
    </span>
  );

  if (isMove) {
    return (
      <div
        className={`${styles.statBlockRow} ${styles.statBlockRowMove}`}
        style={rowStyle}
      >
        {blocks}
        <span className={styles.statBlockLabel}>{label}</span>
      </div>
    );
  }

  return (
    <div className={styles.statBlockRow} style={rowStyle}>
      <span className={styles.statBlockLabel}>{label}</span>
      {blocks}
    </div>
  );
}

function StatColumn({ rows }: { rows: StatBlockRowData[] }) {
  return (
    <div className={styles.statBlockColumn}>
      {rows.map((row) => (
        <StatBlockRow
          key={row.label}
          label={row.label}
          value={row.value}
          maxBlocks={row.maxBlocks ?? MAX_CORE_STAT_BLOCKS}
          color={row.color}
          isMove={row.isMove}
          moveAttackType={row.moveAttackType}
        />
      ))}
    </div>
  );
}

export function CardStatBlocks({
  stats,
  moves = [],
  className,
}: CardStatBlocksProps) {
  const leftRows = statBlockRowsForKeys(stats, LEFT_STAT_COLUMN_KEYS);
  const rightRows = statBlockRowsForKeys(stats, RIGHT_STAT_COLUMN_KEYS);

  const move1 = moves[0];
  const move2 = moves[1];
  if (move1?.name.trim()) {
    leftRows.push({
      label: move1.name,
      value: move1.value,
      color: MOVE_STAT_COLOR,
      maxBlocks: MAX_MOVE_STAT_BLOCKS,
      isMove: true,
      moveAttackType: move1.attackType,
    });
  }
  if (move2?.name.trim()) {
    rightRows.push({
      label: move2.name,
      value: move2.value,
      color: MOVE_STAT_COLOR,
      maxBlocks: MAX_MOVE_STAT_BLOCKS,
      isMove: true,
      moveAttackType: move2.attackType,
    });
  }

  return (
    <div className={[styles.statBlockList, className].filter(Boolean).join(" ")}>
      <StatColumn rows={leftRows} />
      <StatColumn rows={rightRows} />
    </div>
  );
}
