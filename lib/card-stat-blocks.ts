import type { CoreStatKey } from "@/types/character-stats";
import type { CardStats } from "@/types/card";
import type { MoveAttackType } from "@/types/character-moves";

export const MOVE_STAT_COLOR = "#f7fafc";

export const CORE_STAT_BLOCK_DEFS: Record<
  CoreStatKey,
  { label: string; color: string }
> = {
  strength: { label: "Strength", color: "#e84848" },
  speed: { label: "Speed", color: "#f6e05e" },
  intelligence: { label: "Intelligence", color: "#f6ad55" },
  durability: { label: "Durability", color: "#b794f4" },
  energy_projection: { label: "Energy Proj.", color: "#48c868" },
  skill: { label: "Skill", color: "#63b3ed" },
};

/** Left column: Intelligence, Strength, Durability (+ move1 when present). */
export const LEFT_STAT_COLUMN_KEYS: CoreStatKey[] = [
  "intelligence",
  "strength",
  "durability",
];

/** Right column: Skill, Energy Proj., Speed (+ move2 when present). */
export const RIGHT_STAT_COLUMN_KEYS: CoreStatKey[] = [
  "skill",
  "energy_projection",
  "speed",
];

export const MOVE_ATTACK_TYPE_COLORS: Record<MoveAttackType, string> = {
  physical: CORE_STAT_BLOCK_DEFS.strength.color,
  energy: CORE_STAT_BLOCK_DEFS.energy_projection.color,
};

export type StatBlockRowData = {
  label: string;
  value: number | null | undefined;
  color: string;
  maxBlocks?: number;
  /** Move rows top-align label + blocks when names wrap. */
  isMove?: boolean;
  moveAttackType?: MoveAttackType;
};

export function statBlockRowsForKeys(
  stats: CardStats,
  keys: CoreStatKey[]
): StatBlockRowData[] {
  return keys.map((key) => {
    const { label, color } = CORE_STAT_BLOCK_DEFS[key];
    return { label, value: stats[key], color };
  });
}

/** @deprecated Use statBlockRowsForKeys with column key lists. */
export function coreStatBlockRows(stats: CardStats): StatBlockRowData[] {
  return [
    ...statBlockRowsForKeys(stats, LEFT_STAT_COLUMN_KEYS),
    ...statBlockRowsForKeys(stats, RIGHT_STAT_COLUMN_KEYS),
  ];
}
