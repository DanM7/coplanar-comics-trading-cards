import { primaryCharacterType } from "@/lib/format-character-home";
import type { Alignment } from "@/types/character";
import type { PlayRosterEntry } from "@/types/game";
import { scoreTeam } from "@/services/game/team-power";

export interface PlayRosterFilters {
  alignment?: Alignment | "";
  homeDistrict?: string;
  type?: string;
}

export type PlayRosterSort =
  | "num-asc"
  | "num-desc"
  | "tier-asc"
  | "tier-desc";

function characterNumber(entry: PlayRosterEntry): number {
  const parsed = Number.parseInt(entry.characterId, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sortPlayRoster(
  roster: PlayRosterEntry[],
  sort: PlayRosterSort
): PlayRosterEntry[] {
  const sorted = [...roster];

  sorted.sort((a, b) => {
    switch (sort) {
      case "num-asc": {
        const diff = characterNumber(a) - characterNumber(b);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      case "num-desc": {
        const diff = characterNumber(b) - characterNumber(a);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      case "tier-asc": {
        const diff = a.tier - b.tier;
        return diff !== 0 ? diff : characterNumber(a) - characterNumber(b);
      }
      case "tier-desc": {
        const diff = b.tier - a.tier;
        return diff !== 0 ? diff : characterNumber(a) - characterNumber(b);
      }
      default:
        return 0;
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
