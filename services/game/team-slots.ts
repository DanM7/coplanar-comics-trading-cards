import { CORE_STAT_BLOCK_DEFS } from "@/lib/card-stat-blocks";
import { primaryCharacterType } from "@/lib/format-character-home";
import { CORE_STAT_KEYS } from "@/types/character-stats";
import { MAX_CORE_STAT_BLOCKS } from "@/types/character-moves";
import type { CoreStats } from "@/types/character-stats";
import type { PlayRosterEntry } from "@/types/game";
import type { TeamSynergyBonuses } from "@/types/game";
import {
  computeTeamStatBonuses,
  computeTeamSynergy,
} from "@/services/game/stats";

export const TEAM_SLOT_COUNT = 3;

export type TeamSlots = Array<string | null>;

export function emptyTeamSlots(): TeamSlots {
  return [null, null, null];
}

/** Add to the first open slot, or remove and compact if already selected. */
export function toggleTeamSlot(slots: TeamSlots, characterId: string): TeamSlots {
  if (slots.includes(characterId)) {
    const compacted = slots.filter((id) => id !== characterId);
    while (compacted.length < TEAM_SLOT_COUNT) {
      compacted.push(null);
    }
    return compacted.slice(0, TEAM_SLOT_COUNT) as TeamSlots;
  }

  const next = [...slots];
  const openIndex = next.findIndex((id) => id === null);
  if (openIndex === -1) {
    return slots;
  }

  next[openIndex] = characterId;
  return next;
}

export function setTeamSlotsFromIds(characterIds: string[]): TeamSlots {
  const slots = emptyTeamSlots();
  for (let index = 0; index < Math.min(characterIds.length, TEAM_SLOT_COUNT); index++) {
    slots[index] = characterIds[index] ?? null;
  }
  return slots;
}

export function clearTeamSlot(slots: TeamSlots, slotIndex: number): TeamSlots {
  if (slotIndex < 0 || slotIndex >= TEAM_SLOT_COUNT) {
    return slots;
  }

  const next = [...slots];
  next[slotIndex] = null;
  const compacted: TeamSlots = next.filter((id) => id !== null);
  while (compacted.length < TEAM_SLOT_COUNT) {
    compacted.push(null);
  }
  return compacted.slice(0, TEAM_SLOT_COUNT);
}

export function entriesFromTeamSlots(
  slots: TeamSlots,
  roster: PlayRosterEntry[]
): PlayRosterEntry[] {
  return slots
    .map((id) => (id ? roster.find((entry) => entry.characterId === id) : undefined))
    .filter((entry): entry is PlayRosterEntry => entry !== undefined);
}

export interface TeamBonusPreview {
  statBonuses: CoreStats;
  synergy: TeamSynergyBonuses;
}

export function previewTeamBonuses(
  entries: PlayRosterEntry[]
): TeamBonusPreview | null {
  if (entries.length === 0) {
    return null;
  }

  return {
    statBonuses: computeTeamStatBonuses(entries.map((entry) => entry.stats)),
    synergy: computeTeamSynergy({
      types: entries.map((entry) => entry.type),
      alignments: entries.map((entry) => entry.alignment),
      homeDistricts: entries.map((entry) => entry.homeDistrict),
    }),
  };
}

/** Sum of each stat's highest slot value (max 30 with six stats at 5 blocks). */
export const MAX_TEAM_STAT_POWER =
  CORE_STAT_KEYS.length * MAX_CORE_STAT_BLOCKS;

export function teamStatPowerFromSlotEntries(
  slotEntries: Array<PlayRosterEntry | null>
): number {
  return CORE_STAT_KEYS.reduce((sum, key) => {
    const highest = Math.max(
      0,
      ...slotEntries.map((entry) => entry?.stats[key] ?? 0)
    );
    return sum + highest;
  }, 0);
}

/** Sum of all six team stat bonus decimals (max 3.0 with three tier-5 fighters). */
export function totalTeamStatBoost(bonuses: CoreStats): number {
  return CORE_STAT_KEYS.reduce((sum, key) => sum + (bonuses[key] ?? 0), 0);
}

/** Map +0.1 team bonus → one filled stat square (same scale as card backs). */
export function statBonusesAsBlockValues(bonuses: CoreStats): CoreStats {
  const blocks = {} as CoreStats;
  for (const key of CORE_STAT_KEYS) {
    blocks[key] = Math.min(
      5,
      Math.max(0, Math.round((bonuses[key] ?? 0) * 10))
    );
  }
  return blocks;
}

export function formatTeamStatBonuses(bonuses: CoreStats): string[] {
  return CORE_STAT_KEYS.filter((key) => bonuses[key] > 0).map((key) => {
    const label = CORE_STAT_BLOCK_DEFS[key].label;
    const value = bonuses[key];
    const display = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
    return `${label} +${display}`;
  });
}

export function formatTeamSynergyBonuses(
  entries: PlayRosterEntry[],
  synergy: TeamSynergyBonuses
): string[] {
  const parts: string[] = [];

  if (synergy.typeDamage > 0) {
    const typeCounts = new Map<string, number>();
    for (const entry of entries) {
      const primary = primaryCharacterType(entry.type) ?? "Unknown";
      typeCounts.set(primary, (typeCounts.get(primary) ?? 0) + 1);
    }

    const typeDetail = [...typeCounts.entries()]
      .filter(([, count]) => count >= 2)
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([type, count]) => `${type} x${count}`)
      .join(", ");

    parts.push(
      `Type (${typeDetail}): +${Math.round(synergy.typeDamage * 100)}% damage`
    );
  }

  if (synergy.alignmentDefense > 0) {
    const alignment = entries[0]?.alignment ?? "Unknown";
    parts.push(
      `Alignment (${alignment}): +${Math.round(synergy.alignmentDefense * 100)}% defense`
    );
  }

  if (synergy.homeAccuracy > 0) {
    const home = entries.find((entry) => entry.homeDistrict.trim())?.homeDistrict.trim();
    parts.push(
      `Home (${home ?? "Unknown"}): +${Math.round(synergy.homeAccuracy * 100)}% accuracy`
    );
  }

  return parts;
}
