import type { CoreStats } from "@/types/character-stats";
import type {
  BattleFighter,
  BattleTeam,
  BattleTeamId,
  PlayRosterEntry,
} from "@/types/game";
import {
  applyTeamStatBonuses,
  computeTeamStatBonuses,
  computeTeamSynergy,
  maxHpFromDurability,
} from "@/services/game/stats";

function buildFighter(input: {
  entry: PlayRosterEntry;
  team: BattleTeamId;
  slot: number;
  teamBonuses: CoreStats;
  fighterId: string;
}): BattleFighter {
  const effectiveStats = applyTeamStatBonuses(input.entry.stats, input.teamBonuses);
  return {
    id: input.fighterId,
    characterId: input.entry.characterId,
    name: input.entry.name,
    team: input.team,
    slot: input.slot,
    alignment: input.entry.alignment,
    type: input.entry.type,
    homeDistrict: input.entry.homeDistrict,
    baseStats: input.entry.stats,
    effectiveStats,
    moves: input.entry.moves,
    maxHp: maxHpFromDurability(effectiveStats.durability),
    currentHp: maxHpFromDurability(effectiveStats.durability),
    isKO: false,
    frontImageUrl: input.entry.frontImageUrl,
  };
}

export function buildBattleTeam(
  teamId: BattleTeamId,
  entries: PlayRosterEntry[]
): BattleTeam {
  if (entries.length !== 3) {
    throw new Error("Each team must have exactly 3 fighters.");
  }

  const baseStatsList = entries.map((entry) => entry.stats);
  const statBonuses = computeTeamStatBonuses(baseStatsList);
  const synergy = computeTeamSynergy({
    types: entries.map((entry) => entry.type),
    alignments: entries.map((entry) => entry.alignment),
    homeDistricts: entries.map((entry) => entry.homeDistrict),
  });

  const fighters = entries.map((entry, slot) =>
    buildFighter({
      entry,
      team: teamId,
      slot,
      teamBonuses: statBonuses,
      fighterId: `${teamId}-${slot}-${entry.characterId}`,
    })
  );

  return {
    id: teamId,
    fighters,
    synergy,
    statBonuses,
  };
}
