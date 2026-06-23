import {
  CORE_STAT_KEYS,
  type CoreStatKey,
  type CoreStats,
  type CharacterStatRecord,
} from "@/types/character-stats";

export const TIER_POWER_RANGES: Record<
  number,
  { min: number; max: number }
> = {
  1: { min: 0, max: 6 },
  2: { min: 7, max: 12 },
  3: { min: 13, max: 18 },
  4: { min: 19, max: 24 },
  5: { min: 25, max: 30 },
};

export interface StatValidationResult {
  valid: boolean;
  errors: string[];
}

export function computeTotalPower(stats: CoreStats): number {
  return CORE_STAT_KEYS.reduce((sum, key) => sum + stats[key], 0);
}

/** Tier implied by total power (sum of six core stats). */
export function tierFromTotalPower(total: number): number | null {
  for (const tier of [1, 2, 3, 4, 5] as const) {
    const range = TIER_POWER_RANGES[tier];
    if (total >= range.min && total <= range.max) {
      return tier;
    }
  }
  return null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCoreStats(value: unknown): { stats: CoreStats | null; errors: string[] } {
  const errors: string[] = [];
  if (!isPlainObject(value)) {
    return { stats: null, errors: ["stats must be an object"] };
  }

  const keys = Object.keys(value);
  const missing = CORE_STAT_KEYS.filter((k) => !keys.includes(k));
  const extra = keys.filter(
    (k) => !CORE_STAT_KEYS.includes(k as CoreStatKey)
  );

  if (missing.length > 0) {
    errors.push(`missing core stats: ${missing.join(", ")}`);
  }
  if (extra.length > 0) {
    errors.push(`extra stats not allowed: ${extra.join(", ")}`);
  }

  const parsed = {} as CoreStats;
  for (const key of CORE_STAT_KEYS) {
    const raw = value[key];
    if (typeof raw !== "number" || !Number.isInteger(raw)) {
      errors.push(`${key} must be an integer`);
      continue;
    }
    if (raw < 0 || raw > 5) {
      errors.push(`${key} must be between 0 and 5`);
    }
    parsed[key] = raw;
  }

  if (errors.length > 0) {
    return { stats: null, errors };
  }

  return { stats: parsed, errors: [] };
}

/** Validates a character stat entry; does not modify stats. */
export function validateCharacterStatEntry(
  entry: unknown
): StatValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(entry)) {
    return { valid: false, errors: ["entry must be an object"] };
  }

  if (entry.id === undefined || entry.id === null) {
    errors.push("id is required");
  }

  if (typeof entry.tier !== "number" || !Number.isInteger(entry.tier)) {
    errors.push("tier must be an integer");
  } else if (!(entry.tier in TIER_POWER_RANGES)) {
    errors.push("tier must be between 1 and 5");
  }

  const { stats, errors: statErrors } = parseCoreStats(entry.stats);
  errors.push(...statErrors);

  if (!stats || errors.length > 0) {
    return { valid: false, errors };
  }

  const total = computeTotalPower(stats);
  const tier = entry.tier as number;
  const range = TIER_POWER_RANGES[tier];

  if (range && (total < range.min || total > range.max)) {
    errors.push(
      `total power ${total} is outside tier ${tier} range (${range.min}–${range.max})`
    );
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidCharacterStatEntry(
  entry: CharacterStatRecord
): StatValidationResult {
  return validateCharacterStatEntry(entry);
}
