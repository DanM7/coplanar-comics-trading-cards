import characterDescriptionsData from "@/data/character_descriptions.json";
import { normalizeCharacterId } from "@/lib/character-id";
import {
  cardStatsFromCharacterId,
  tierFromCharacterStats,
} from "@/lib/character-stats-loader";
import { EMPTY_CARD_STATS } from "@/types/card";
import type { CharacterStatRecord } from "@/types/character-stats";
import type {
  Character,
  CharacterDescriptionRecord,
  CharacterDescriptionsFile,
} from "@/types/character";
import type { HomeRegion } from "@/types/character";

let cachedCharacters: Character[] | null = null;
const characterById = new Map<string, Character>();

/**
 * Loads characters from descriptions + stats (tier and core stats from character_stats.json).
 */
export function buildCharactersFromDescriptions(
  master: CharacterDescriptionsFile,
  statsById?: Map<string, CharacterStatRecord>
): Character[] {
  return (master.descriptions ?? []).map((record) =>
    normalizeCharacterRecord(record, statsById)
  );
}

export function getAllCharacters(): Character[] {
  if (!cachedCharacters) {
    cachedCharacters = buildCharactersFromDescriptions(
      characterDescriptionsData as CharacterDescriptionsFile
    );
    characterById.clear();
    for (const character of cachedCharacters) {
      characterById.set(character.id, character);
    }
  }
  return cachedCharacters;
}

export function clearCharactersCache(): void {
  cachedCharacters = null;
  characterById.clear();
}

export function getCharacterById(id: string): Character | undefined {
  getAllCharacters();
  return characterById.get(id);
}

export function getCharacterIds(): string[] {
  return getAllCharacters().map((c) => c.id);
}

function normalizeCharacterRecord(
  record: CharacterDescriptionRecord,
  statsById?: Map<string, CharacterStatRecord>
): Character {
  const id = normalizeCharacterId(record.id);
  const statRecord = statsById?.get(id);
  const stats = statRecord
    ? {
        strength: statRecord.stats.strength,
        speed: statRecord.stats.speed,
        intelligence: statRecord.stats.intelligence,
        durability: statRecord.stats.durability,
        energy_projection: statRecord.stats.energy_projection,
        skill: statRecord.stats.skill,
      }
    : (cardStatsFromCharacterId(id) ?? { ...EMPTY_CARD_STATS });
  const tier = statRecord?.tier ?? tierFromCharacterStats(id) ?? 1;

  return {
    id,
    name: record.name,
    alignment: record.alignment,
    tier,
    description: record.description,
    home_plane: record.home_plane,
    home_location: record.home_location ?? "",
    home_district: record.home_district ?? "",
    home_region: toHomeRegion(record.home_plane),
    type: record.type,
    identity: record.identity,
    is_boss: record.is_boss,
    first_appearance: record.first_appearance,
    stats,
  };
}

export function characterToCardStats(
  character: Pick<Character, "stats">
): Character["stats"] {
  return character.stats;
}

function toHomeRegion(
  homePlane: CharacterDescriptionRecord["home_plane"]
): HomeRegion {
  switch (homePlane) {
    case "Human":
      return "Human Realm";
    case "3D":
      return "3D Geometry Realm";
    case "2D":
      return "2D Flatlands";
    case "Comic":
      return "Comic Realm";
    default:
      return "Human Realm";
  }
}
