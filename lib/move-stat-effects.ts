import { CORE_STAT_BLOCK_DEFS } from "@/lib/card-stat-blocks";
import { CORE_STAT_KEYS, type CoreStatKey } from "@/types/character-stats";
import type { CharacterMoveRecord, MoveScope } from "@/types/character-moves";
import {
  MAX_MOVE_STAT_BLOCKS,
  type MoveHpBoostEffect,
  type MoveStatBoostEffect,
  type MoveStatReductionEffect,
} from "@/types/character-moves";

export type { MoveStatBoostEffect, MoveHpBoostEffect, MoveStatReductionEffect };

export type MoveBoostSlot =
  | { kind: "empty" }
  | { kind: "plus"; color: string }
  | { kind: "block"; color: string };

const STAT_NAME_TO_KEY: Record<string, CoreStatKey> = {
  Strength: "strength",
  Speed: "speed",
  Intelligence: "intelligence",
  Durability: "durability",
  Energy_Projection: "energy_projection",
  EnergyProjection: "energy_projection",
  Skill: "skill",
};

const MOVE_STAT_EFFECT_PATTERN = /^([A-Za-z_]+)_Up_(\d+)$/;
const MOVE_STAT_REDUCTION_PATTERN = /^([A-Za-z_]+)_Down_(\d+)$/;
const MOVE_HP_EFFECT_PATTERN = /^HP_Up_(\d+)%$/;

export function parseMoveStatEffect(value: unknown): MoveStatBoostEffect | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const match = value.trim().match(MOVE_STAT_EFFECT_PATTERN);
  if (!match) {
    return null;
  }

  const stat = STAT_NAME_TO_KEY[match[1]];
  if (!stat || !CORE_STAT_KEYS.includes(stat)) {
    return null;
  }

  const amount = Number.parseInt(match[2], 10);
  if (!Number.isFinite(amount) || amount < 1) {
    return null;
  }

  return { stat, amount };
}

export function parseMoveStatReductionEffect(
  value: unknown
): MoveStatReductionEffect | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const match = value.trim().match(MOVE_STAT_REDUCTION_PATTERN);
  if (!match) {
    return null;
  }

  const stat = STAT_NAME_TO_KEY[match[1]];
  if (!stat || !CORE_STAT_KEYS.includes(stat)) {
    return null;
  }

  const amount = Number.parseInt(match[2], 10);
  if (!Number.isFinite(amount) || amount < 1) {
    return null;
  }

  return { stat, amount };
}

export function parseMoveHpEffect(value: unknown): MoveHpBoostEffect | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const match = value.trim().match(MOVE_HP_EFFECT_PATTERN);
  if (!match) {
    return null;
  }

  const percent = Number.parseInt(match[1], 10);
  if (!Number.isFinite(percent) || percent < 1) {
    return null;
  }

  return { percent };
}

export function formatTeamScopePrefix(scope?: MoveScope): string {
  return scope === "team" ? "Team: " : "";
}

export function formatHpBoostAmountLabel(percent: number): string {
  return `+${percent}% HP`;
}

export function formatHpBoostLabel(
  percent: number,
  scope?: MoveScope
): string {
  return `${formatTeamScopePrefix(scope)}${formatHpBoostAmountLabel(percent)}`;
}

export function moveStatBoostEffectsFromSlots(
  record: CharacterMoveRecord,
  slot: 1 | 2
): MoveStatBoostEffect[] {
  const prefix = slot === 1 ? "move1" : "move2";
  const effects: MoveStatBoostEffect[] = [];

  for (const suffix of ["_effect1", "_effect2"] as const) {
    const key = `${prefix}${suffix}` as keyof CharacterMoveRecord;
    const parsed = parseMoveStatEffect(record[key]);
    if (parsed) {
      effects.push(parsed);
    }
  }

  return effects;
}

export function moveStatReductionEffectsFromSlots(
  record: CharacterMoveRecord,
  slot: 1 | 2
): MoveStatReductionEffect[] {
  const prefix = slot === 1 ? "move1" : "move2";
  const effects: MoveStatReductionEffect[] = [];

  for (const suffix of ["_effect1", "_effect2"] as const) {
    const key = `${prefix}${suffix}` as keyof CharacterMoveRecord;
    const parsed = parseMoveStatReductionEffect(record[key]);
    if (parsed) {
      effects.push(parsed);
    }
  }

  return effects;
}

export function moveHpBoostFromSlot(
  record: CharacterMoveRecord,
  slot: 1 | 2
): MoveHpBoostEffect | undefined {
  const prefix = slot === 1 ? "move1" : "move2";

  for (const suffix of ["_effect1", "_effect2"] as const) {
    const key = `${prefix}${suffix}` as keyof CharacterMoveRecord;
    const parsed = parseMoveHpEffect(record[key]);
    if (parsed) {
      return parsed;
    }
  }

  return undefined;
}

export function statBoostBlockCount(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.min(MAX_MOVE_STAT_BLOCKS, Math.max(0, Math.round(amount)));
}

export function boostSlotsForEffects(
  effects: MoveStatBoostEffect[]
): MoveBoostSlot[] {
  const slots: MoveBoostSlot[] = Array.from(
    { length: MAX_MOVE_STAT_BLOCKS },
    () => ({ kind: "empty" })
  );

  if (!effects.length) {
    return slots;
  }

  const groups = effects.map((effect) => ({
    color: CORE_STAT_BLOCK_DEFS[effect.stat].color,
    blocks: statBoostBlockCount(effect.amount),
  }));

  let position = 0;
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex];
    if (position >= MAX_MOVE_STAT_BLOCKS) {
      break;
    }

    slots[position] = { kind: "plus", color: group.color };
    position++;

    for (
      let blockIndex = 0;
      blockIndex < group.blocks && position < MAX_MOVE_STAT_BLOCKS;
      blockIndex++
    ) {
      slots[position] = { kind: "block", color: group.color };
      position++;
    }

    if (groupIndex < groups.length - 1) {
      const remainingGroups = groups.slice(groupIndex + 1);
      const remainingSize =
        remainingGroups.reduce((sum, nextGroup) => sum + 1 + nextGroup.blocks, 0) +
        Math.max(0, remainingGroups.length - 1);

      if (position + 1 + remainingSize <= MAX_MOVE_STAT_BLOCKS) {
        position++;
      }
    }
  }

  return slots;
}
