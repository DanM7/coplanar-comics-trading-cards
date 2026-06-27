import type { CoreStats } from "@/types/character-stats";
import type { BattleTeam, PlayRosterEntry, TeamSynergyBonuses } from "@/types/game";
import {
  applyTeamStatBonuses,
  baseEnergyPower,
  basePhysicalPower,
  computeTeamStatBonuses,
  computeTeamSynergy,
  maxHpFromDurability,
} from "@/services/game/stats";

/** Synergy weight in overall team power (matches Find Best heuristic). */
export const SYNERGY_SCORE_WEIGHTS = {
  typeDamage: 280,
  alignmentDefense: 450,
  homeAccuracy: 250,
} as const;

export const MOVE_SCORE_MULTIPLIER = 15;

export interface TeamPowerBreakdown {
  characterIds: string[];
  names: string[];
  statBonuses: CoreStats;
  synergy: TeamSynergyBonuses;
  totalHp: number;
  totalPhysicalPower: number;
  totalEnergyPower: number;
  moveScore: number;
  synergyScore: number;
  totalScore: number;
}

function averageMoveValue(entry: PlayRosterEntry): number {
  return (
    entry.moves.reduce((sum, move) => sum + move.value, 0) /
    Math.max(1, entry.moves.length)
  );
}

function synergyScore(synergy: TeamSynergyBonuses): number {
  return (
    synergy.typeDamage * SYNERGY_SCORE_WEIGHTS.typeDamage +
    synergy.alignmentDefense * SYNERGY_SCORE_WEIGHTS.alignmentDefense +
    synergy.homeAccuracy * SYNERGY_SCORE_WEIGHTS.homeAccuracy
  );
}

/** Heuristic team strength (stats, HP, moves, synergy) — same formula as Find Best. */
export function computeTeamPower(
  entries: PlayRosterEntry[]
): TeamPowerBreakdown | null {
  if (entries.length !== 3) {
    return null;
  }

  const statBonuses = computeTeamStatBonuses(entries.map((entry) => entry.stats));
  const synergy = computeTeamSynergy({
    types: entries.map((entry) => entry.type),
    alignments: entries.map((entry) => entry.alignment),
    homeDistricts: entries.map((entry) => entry.homeDistrict),
  });

  let totalHp = 0;
  let totalPhysicalPower = 0;
  let totalEnergyPower = 0;
  let moveScore = 0;

  for (const entry of entries) {
    const effective = applyTeamStatBonuses(entry.stats, statBonuses);
    totalHp += maxHpFromDurability(effective.durability);
    totalPhysicalPower += basePhysicalPower(effective);
    totalEnergyPower += baseEnergyPower(effective);
    moveScore += averageMoveValue(entry) * MOVE_SCORE_MULTIPLIER;
  }

  const synergyScoreValue = synergyScore(synergy);
  const totalScore =
    totalHp + totalPhysicalPower + totalEnergyPower + moveScore + synergyScoreValue;

  return {
    characterIds: entries.map((entry) => entry.characterId),
    names: entries.map((entry) => entry.name),
    statBonuses,
    synergy,
    totalHp,
    totalPhysicalPower,
    totalEnergyPower,
    moveScore,
    synergyScore: synergyScoreValue,
    totalScore,
  };
}

export function scoreTeam(entries: PlayRosterEntry[]): number {
  return computeTeamPower(entries)?.totalScore ?? 0;
}

export function computeTeamPowerFromBattleTeam(
  team: BattleTeam
): TeamPowerBreakdown | null {
  const entries: PlayRosterEntry[] = team.fighters.map((fighter) => ({
    characterId: fighter.characterId,
    name: fighter.name,
    alignment: fighter.alignment,
    type: fighter.type,
    homeDistrict: fighter.homeDistrict,
    tier: 0,
    stats: fighter.baseStats,
    moves: fighter.moves,
  }));

  return computeTeamPower(entries);
}

export function formatTeamPowerScore(score: number): string {
  return Number.isInteger(score) ? score.toFixed(0) : score.toFixed(1);
}
