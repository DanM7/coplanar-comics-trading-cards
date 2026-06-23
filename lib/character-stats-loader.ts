import characterStatsData from "@/data/character_stats.json";
import { normalizeCharacterId } from "@/lib/character-id";
import type { CardStats } from "@/types/card";
import type {
  CharacterStatRecord,
  CharacterStatsFile,
  CoreStats,
} from "@/types/character-stats";

let cachedById: Map<string, CharacterStatRecord> | null = null;

export function buildStatMapFromFile(
  file: CharacterStatsFile
): Map<string, CharacterStatRecord> {
  const map = new Map<string, CharacterStatRecord>();
  for (const row of file.stats ?? []) {
    map.set(normalizeCharacterId(row.id), {
      ...row,
      id: normalizeCharacterId(row.id),
    });
  }
  return map;
}

function loadStatMap(): Map<string, CharacterStatRecord> {
  if (!cachedById) {
    cachedById = buildStatMapFromFile(
      characterStatsData as CharacterStatsFile
    );
  }
  return cachedById;
}

/** Clears in-memory cache so the next read uses bundled JSON (e.g. after deploy). */
export function clearCharacterStatsCache(): void {
  cachedById = null;
}

export function getAllCharacterStatRecords(): CharacterStatRecord[] {
  return Array.from(loadStatMap().values());
}

export function getCharacterStatRecordById(
  id: string
): CharacterStatRecord | undefined {
  return loadStatMap().get(normalizeCharacterId(id));
}

export function coreStatsToCardStats(stats: CoreStats): CardStats {
  return {
    strength: stats.strength,
    speed: stats.speed,
    intelligence: stats.intelligence,
    durability: stats.durability,
    energy_projection: stats.energy_projection,
    skill: stats.skill,
  };
}

export function cardStatsFromCharacterId(id: string): CardStats | null {
  const record = getCharacterStatRecordById(id);
  if (!record) return null;
  return coreStatsToCardStats(record.stats);
}

export function tierFromCharacterStats(id: string): number | null {
  return getCharacterStatRecordById(id)?.tier ?? null;
}
