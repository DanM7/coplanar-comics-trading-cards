import type { CSSProperties } from "react";
import {
  MOVE_ATTACK_TYPE_COLORS,
  MOVE_STAT_COLOR,
  LEFT_STAT_COLUMN_KEYS,
  RIGHT_STAT_COLUMN_KEYS,
  statBlockRowsForKeys,
  type StatBlockRowData,
} from "@/lib/card-stat-blocks";
import type { MoveAttackType, MoveDisplay, MoveScope, MoveHpBoostEffect, MoveStatBoostEffect, MoveStatReductionEffect } from "@/types/character-moves";
import {
  MAX_CORE_STAT_BLOCKS,
  MAX_MOVE_STAT_BLOCKS,
} from "@/types/character-moves";
import type { CardStats } from "@/types/card";
import { MoveTeamStatBoost } from "@/components/cards/MoveTeamStatBoost";
import { MoveOpponentStatReduction } from "@/components/cards/MoveOpponentStatReduction";
import { MoveSelfStatBoost } from "@/components/cards/MoveSelfStatBoost";
import { MoveHpBoostLabel } from "@/components/cards/MoveHpBoostLabel";

import styles from "./stat-blocks.module.css";

export type { MoveDisplay };

interface CardStatBlocksProps {
  stats: CardStats;
  moves?: MoveDisplay[];
  className?: string;
  /** When true, render scope indicators (e.g. range ovals) under move stat blocks. */
  showMoveScope?: boolean;
}

function MoveRangeIndicator({ color }: { color: string }) {
  const style = { "--range-color": color } as CSSProperties;

  return (
    <div className={styles.moveRangeRow} style={style} aria-hidden>
      {Array.from({ length: MAX_MOVE_STAT_BLOCKS }, (_, index) => (
        <span key={index} className={styles.moveRangeSizer} />
      ))}
      <div className={styles.moveRangeOverlay}>
        <span className={styles.moveRangeArrowLeft} />
        <span className={styles.moveRangeOvals}>
          <span className={styles.moveRangeOvalOuter} />
          <span className={styles.moveRangeOvalInner} />
        </span>
        <span className={styles.moveRangeArrowRight} />
      </div>
    </div>
  );
}

function StatBlockRow({
  label,
  value,
  maxBlocks,
  color,
  isMove,
  moveAttackType = "physical",
  moveScope,
  moveStatBoosts,
  moveStatReductions,
  moveHpBoost,
  showMoveScope = false,
}: {
  label: string;
  value: number | null | undefined;
  maxBlocks: number;
  color: string;
  isMove?: boolean;
  moveAttackType?: MoveAttackType;
  moveScope?: MoveScope;
  moveStatBoosts?: MoveStatBoostEffect[];
  moveStatReductions?: MoveStatReductionEffect[];
  moveHpBoost?: MoveHpBoostEffect;
  showMoveScope?: boolean;
}) {
  const filled =
    typeof value === "number" && Number.isFinite(value)
      ? Math.min(maxBlocks, Math.max(0, Math.round(value)))
      : 0;

  const rowStyle = { "--stat-color": color } as CSSProperties;
  const moveFillColor = MOVE_ATTACK_TYPE_COLORS[moveAttackType];
  const isStatBoostMove = Boolean(moveStatBoosts?.length);
  const isStatReductionMove = Boolean(moveStatReductions?.length);
  const isHpBoostMove = Boolean(moveHpBoost);

  const blocks = isHpBoostMove && moveHpBoost ? (
    <MoveHpBoostLabel
      label={label}
      hpBoost={moveHpBoost}
      scope={moveScope}
      variant="card"
    />
  ) : isStatBoostMove && moveStatBoosts ? (
    moveScope === "team" ? (
      <MoveTeamStatBoost label={label} effects={moveStatBoosts} variant="card" />
    ) : (
      <MoveSelfStatBoost label={label} effects={moveStatBoosts} variant="card" />
    )
  ) : isStatReductionMove && moveStatReductions ? (
    <MoveOpponentStatReduction
      label={label}
      effects={moveStatReductions}
      variant="card"
    />
  ) : (
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
    const showRangeIndicator =
      showMoveScope && moveScope === "range";

    return (
      <div
        className={`${styles.statBlockRow} ${styles.statBlockRowMove}`}
        style={rowStyle}
      >
        <span className={styles.statBlockLabel}>{label}</span>
        <div className={styles.statBlockMoveColumn}>
          {blocks}
          {showRangeIndicator ? (
            <MoveRangeIndicator color={moveFillColor} />
          ) : null}
        </div>
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

function StatColumn({
  rows,
  showMoveScope,
}: {
  rows: StatBlockRowData[];
  showMoveScope?: boolean;
}) {
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
          moveScope={row.moveScope}
          moveStatBoosts={row.moveStatBoosts}
          moveStatReductions={row.moveStatReductions}
          moveHpBoost={row.moveHpBoost}
          showMoveScope={showMoveScope}
        />
      ))}
    </div>
  );
}

export function CardStatBlocks({
  stats,
  moves = [],
  className,
  showMoveScope = false,
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
      moveScope: move1.scope,
      moveStatBoosts: move1.statBoosts,
      moveStatReductions: move1.statReductions,
      moveHpBoost: move1.hpBoost,
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
      moveScope: move2.scope,
      moveStatBoosts: move2.statBoosts,
      moveStatReductions: move2.statReductions,
      moveHpBoost: move2.hpBoost,
    });
  }

  return (
    <div className={[styles.statBlockList, className].filter(Boolean).join(" ")}>
      <StatColumn rows={leftRows} showMoveScope={showMoveScope} />
      <StatColumn rows={rightRows} showMoveScope={showMoveScope} />
    </div>
  );
}
