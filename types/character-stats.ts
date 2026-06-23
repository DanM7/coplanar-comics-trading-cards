/** Six core stats (0–5 each). Character moves are stored in character_moves.json. */
export const CORE_STAT_KEYS = [
  "strength",
  "speed",
  "intelligence",
  "durability",
  "energy_projection",
  "skill",
] as const;

export type CoreStatKey = (typeof CORE_STAT_KEYS)[number];

export type CoreStats = Record<CoreStatKey, number>;

export interface CharacterStatRecord {
  id: string | number;
  name: string;
  tier: number;
  stats: CoreStats;
}

export interface CharacterStatsFile {
  stats: CharacterStatRecord[];
}
