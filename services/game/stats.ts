import { characterTypesFromString, primaryCharacterType } from "@/lib/format-character-home";
import { CORE_STAT_KEYS, type CoreStats } from "@/types/character-stats";
import type { Alignment } from "@/types/character";
import type { TeamSynergyBonuses } from "@/types/game";

const SYNERGY_CAP = 0.4;
/** +damage when 2 or 3 fighters share a primary type (lower than alignment — tier should matter more). */
const TYPE_DAMAGE_BONUS_TRIPLE = 0.1;
const TYPE_DAMAGE_BONUS_PAIR = 0.05;
/** Incoming damage reduction when all three fighters share Good, Evil, or Neutral. */
const ALIGNMENT_DEFENSE_BONUS = 0.15;

/** Accuracy tiers — best match wins (district > location > plane). */
const HOME_ACCURACY_DISTRICT = 0.15;
const HOME_ACCURACY_LOCATION = 0.1;
const HOME_ACCURACY_PLANE = 0.05;

const ALIGNMENT_SYNERGY_VALUES = new Set<Alignment>([
  "Good",
  "Evil",
  "Neutral",
]);

function hasAlignmentSynergy(alignments: Alignment[]): boolean {
  if (alignments.length !== 3) {
    return false;
  }

  const shared = alignments[0];
  if (!ALIGNMENT_SYNERGY_VALUES.has(shared)) {
    return false;
  }

  return alignments.every((alignment) => alignment === shared);
}

/** Multi-value fields use ` / ` (e.g. Acid: `Human / Lapsed Continuum`). */
function parseHomeFieldValues(raw: string | undefined): string[] {
  return characterTypesFromString(raw);
}

/** True when every fighter shares at least one overlapping non-empty value. */
function teamSharesHomeValue(fields: (string | undefined)[]): string | null {
  if (fields.length !== 3) {
    return null;
  }

  const valueSets = fields.map((field) => new Set(parseHomeFieldValues(field)));
  if (valueSets.some((set) => set.size === 0)) {
    return null;
  }

  let shared: Set<string> | null = null;
  for (const set of valueSets) {
    if (shared === null) {
      shared = new Set(set);
      continue;
    }
    shared = new Set([...shared].filter((value) => set.has(value)));
  }

  if (!shared || shared.size === 0) {
    return null;
  }

  return [...shared].sort((a, b) => a.localeCompare(b))[0] ?? null;
}

function computeHomeAccuracy(input: {
  homePlanes: (string | undefined)[];
  homeLocations: (string | undefined)[];
  homeDistricts: (string | undefined)[];
}): {
  homeAccuracy: number;
  homeAccuracyMatch: TeamSynergyBonuses["homeAccuracyMatch"];
} {
  const sharedDistrict = teamSharesHomeValue(input.homeDistricts);
  if (sharedDistrict) {
    return {
      homeAccuracy: HOME_ACCURACY_DISTRICT,
      homeAccuracyMatch: { kind: "district", value: sharedDistrict },
    };
  }

  const sharedLocation = teamSharesHomeValue(input.homeLocations);
  if (sharedLocation) {
    return {
      homeAccuracy: HOME_ACCURACY_LOCATION,
      homeAccuracyMatch: { kind: "location", value: sharedLocation },
    };
  }

  const sharedPlane = teamSharesHomeValue(input.homePlanes);
  if (sharedPlane) {
    return {
      homeAccuracy: HOME_ACCURACY_PLANE,
      homeAccuracyMatch: { kind: "plane", value: sharedPlane },
    };
  }

  return { homeAccuracy: 0, homeAccuracyMatch: null };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeCoreStats(stats: CoreStats): CoreStats {
  const normalized = {} as CoreStats;
  for (const key of CORE_STAT_KEYS) {
    normalized[key] = clamp(Math.round(stats[key] ?? 0), 0, 5);
  }
  return normalized;
}

/** Highest team stat value → decimal bonus (1→0.1 … 5→0.5). */
export function computeTeamStatBonuses(teamStats: CoreStats[]): CoreStats {
  const bonuses = {} as CoreStats;
  for (const key of CORE_STAT_KEYS) {
    const highest = Math.max(...teamStats.map((stats) => stats[key] ?? 0));
    bonuses[key] = highest * 0.1;
  }
  return bonuses;
}

export function applyTeamStatBonuses(
  baseStats: CoreStats,
  teamBonuses: CoreStats
): CoreStats {
  const effective = {} as CoreStats;
  for (const key of CORE_STAT_KEYS) {
    effective[key] = (baseStats[key] ?? 0) + (teamBonuses[key] ?? 0);
  }
  return effective;
}

export function computeTeamSynergy(input: {
  types: (string | undefined)[];
  alignments: Alignment[];
  homePlanes?: (string | undefined)[];
  homeLocations?: (string | undefined)[];
  homeDistricts: (string | undefined)[];
}): TeamSynergyBonuses {
  const typeCounts = new Map<string, number>();
  for (const type of input.types) {
    const primary = primaryCharacterType(type) ?? "Unknown";
    typeCounts.set(primary, (typeCounts.get(primary) ?? 0) + 1);
  }
  const maxTypeCount = Math.max(0, ...typeCounts.values());
  const typeDamage =
    maxTypeCount >= 3
      ? TYPE_DAMAGE_BONUS_TRIPLE
      : maxTypeCount >= 2
        ? TYPE_DAMAGE_BONUS_PAIR
        : 0;

  const alignmentDefense = hasAlignmentSynergy(input.alignments)
    ? ALIGNMENT_DEFENSE_BONUS
    : 0;

  const { homeAccuracy, homeAccuracyMatch } = computeHomeAccuracy({
    homePlanes: input.homePlanes ?? [],
    homeLocations: input.homeLocations ?? [],
    homeDistricts: input.homeDistricts,
  });

  const rawTotal = typeDamage + alignmentDefense + homeAccuracy;
  const scale = rawTotal > SYNERGY_CAP ? SYNERGY_CAP / rawTotal : 1;

  return {
    typeDamage: typeDamage * scale,
    alignmentDefense: alignmentDefense * scale,
    homeAccuracy: homeAccuracy * scale,
    homeAccuracyMatch,
  };
}

/** HP formula — not in official rules; scales with effective durability. */
export function maxHpFromDurability(effectiveDurability: number): number {
  return 20 + Math.round(8 * effectiveDurability);
}

export function basePhysicalPower(stats: CoreStats): number {
  return 10 + 2 * stats.strength + stats.skill;
}

export function baseEnergyPower(stats: CoreStats): number {
  return 8 + 2 * stats.energy_projection + stats.intelligence;
}

export function defenseFactor(effectiveDurability: number): number {
  return Math.max(0.6, 1 - 0.02 * effectiveDurability);
}

export function physicalHitChance(
  attackerSkill: number,
  defenderSkill: number,
  homeAccuracyBonus: number
): number {
  return clamp(
    0.75 + 0.02 * (attackerSkill - defenderSkill) + homeAccuracyBonus,
    0.3,
    0.95
  );
}

export function energyHitChance(
  attackerIntelligence: number,
  defenderIntelligence: number,
  homeAccuracyBonus: number
): number {
  return clamp(
    0.7 + 0.02 * (attackerIntelligence - defenderIntelligence) + homeAccuracyBonus,
    0.3,
    0.95
  );
}
