import { primaryCharacterType } from "@/lib/format-character-home";
import type { Alignment } from "@/types/character";
import type { CoreStatKey } from "@/types/character-stats";
import type { PlayRosterEntry } from "@/types/game";
import { rosterEntryPowerScore, scoreTeam } from "@/services/game/team-power";

export interface PlayRosterFilters {
  alignment?: Alignment | "";
  homeDistrict?: string;
  type?: string;
}

export type PlayRosterSortField = "num" | "power" | CoreStatKey;

export type PlayRosterSortDirection = "asc" | "desc";

function characterNumber(entry: PlayRosterEntry): number {
  const parsed = Number.parseInt(entry.characterId, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compareNumbers(
  a: number,
  b: number,
  direction: PlayRosterSortDirection
): number {
  return direction === "asc" ? a - b : b - a;
}

function tieBreakByNumber(
  a: PlayRosterEntry,
  b: PlayRosterEntry,
  direction: PlayRosterSortDirection
): number {
  const diff = compareNumbers(characterNumber(a), characterNumber(b), direction);
  return diff !== 0 ? diff : a.name.localeCompare(b.name);
}

export function sortPlayRoster(
  roster: PlayRosterEntry[],
  field: PlayRosterSortField,
  direction: PlayRosterSortDirection
): PlayRosterEntry[] {
  const sorted = [...roster];

  sorted.sort((a, b) => {
    switch (field) {
      case "num": {
        const diff = compareNumbers(
          characterNumber(a),
          characterNumber(b),
          direction
        );
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      case "power": {
        const diff = compareNumbers(
          rosterEntryPowerScore(a),
          rosterEntryPowerScore(b),
          direction
        );
        return diff !== 0 ? diff : tieBreakByNumber(a, b, direction);
      }
      default: {
        const diff = compareNumbers(
          a.stats[field] ?? 0,
          b.stats[field] ?? 0,
          direction
        );
        return diff !== 0 ? diff : tieBreakByNumber(a, b, direction);
      }
    }
  });

  return sorted;
}

export function filterPlayRoster(
  roster: PlayRosterEntry[],
  filters: PlayRosterFilters
): PlayRosterEntry[] {
  return roster.filter((entry) => {
    if (filters.alignment && entry.alignment !== filters.alignment) {
      return false;
    }
    if (filters.homeDistrict && entry.homeDistrict !== filters.homeDistrict) {
      return false;
    }
    if (filters.type && primaryCharacterType(entry.type) !== filters.type) {
      return false;
    }
    return true;
  });
}

export { scoreTeam } from "@/services/game/team-power";

/** Best trio from the given roster under current filters (brute force). */
export function findBestTeam(roster: PlayRosterEntry[]): string[] {
  if (roster.length <= 3) {
    return roster.map((entry) => entry.characterId);
  }

  let bestScore = -Infinity;
  let bestIds: string[] = [];

  for (let i = 0; i < roster.length; i++) {
    for (let j = i + 1; j < roster.length; j++) {
      for (let k = j + 1; k < roster.length; k++) {
        const team = [roster[i], roster[j], roster[k]];
        const teamScore = scoreTeam(team);
        if (teamScore > bestScore) {
          bestScore = teamScore;
          bestIds = team.map((entry) => entry.characterId);
        }
      }
    }
  }

  return bestIds;
}
