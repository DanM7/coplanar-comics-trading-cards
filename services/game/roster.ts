import { getCharacterById, getAllCharacters } from "@/lib/cards-loader";
import { movesForCharacterId } from "@/lib/character-moves-loader";
import { CORE_STAT_KEYS } from "@/types/character-stats";
import type { Character } from "@/types/character";
import type { CoreStats } from "@/types/character-stats";
import type { PlayRosterEntry } from "@/types/game";
import { normalizeCoreStats } from "@/services/game/stats";

function characterToCoreStats(character: Character): CoreStats | null {
  const stats = {} as CoreStats;
  for (const key of CORE_STAT_KEYS) {
    const value = character.stats[key];
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return null;
    }
    stats[key] = value;
  }
  return normalizeCoreStats(stats);
}

export function characterToRosterEntry(
  character: Character,
  ownedQuantity?: number
): PlayRosterEntry | null {
  const stats = characterToCoreStats(character);
  if (!stats) {
    return null;
  }

  const moves = movesForCharacterId(character.id);
  if (moves.length === 0) {
    return null;
  }

  return {
    characterId: character.id,
    name: character.name,
    alignment: character.alignment,
    type: character.type,
    homeDistrict: character.home_district,
    tier: character.tier,
    stats,
    moves,
    ownedQuantity,
  };
}

export function buildPlayRoster(
  ownedCards?: Map<string, number>
): PlayRosterEntry[] {
  const roster: PlayRosterEntry[] = [];
  for (const character of getAllCharacters()) {
    if (ownedCards && !ownedCards.has(character.id)) {
      continue;
    }

    const entry = characterToRosterEntry(
      character,
      ownedCards?.get(character.id)
    );
    if (entry) {
      roster.push(entry);
    }
  }
  return roster.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

export function rosterEntryFromCharacterId(
  characterId: string
): PlayRosterEntry | null {
  const character = getCharacterById(characterId);
  if (!character) {
    return null;
  }
  return characterToRosterEntry(character);
}

export { buildBattleTeam } from "@/services/game/battle-team";

/** Demo CPU team — picks three varied characters by id. */
export function defaultCpuTeam(excludeIds: string[] = []): PlayRosterEntry[] {
  const exclude = new Set(excludeIds);
  const defaults = ["4", "7", "19"].filter((id) => !exclude.has(id));
  const entries: PlayRosterEntry[] = [];

  for (const id of defaults) {
    const entry = rosterEntryFromCharacterId(id);
    if (entry) {
      entries.push(entry);
    }
  }

  if (entries.length < 3) {
    for (const character of getAllCharacters()) {
      if (entries.length >= 3) {
        break;
      }
      if (exclude.has(character.id)) {
        continue;
      }
      const entry = characterToRosterEntry(character);
      if (entry && !entries.some((e) => e.characterId === entry.characterId)) {
        entries.push(entry);
      }
    }
  }

  return entries.slice(0, 3);
}
