import { describe, expect, it } from "vitest";
import {
  computeTotalPower,
  TIER_POWER_RANGES,
  validateCharacterStatEntry,
} from "@/lib/character-stat-validation";
import type { CharacterStatRecord } from "@/types/character-stats";

function validEntry(
  overrides: Partial<CharacterStatRecord> & {
    stats?: Partial<CharacterStatRecord["stats"]>;
  } = {}
): CharacterStatRecord {
  const base: CharacterStatRecord = {
    id: "001",
    name: "Test Hero",
    tier: 2,
    stats: {
      strength: 2,
      speed: 2,
      intelligence: 2,
      durability: 2,
      energy_projection: 2,
      skill: 2,
    },
  };
  return {
    ...base,
    ...overrides,
    stats: { ...base.stats, ...overrides.stats },
  };
}

describe("validateCharacterStatEntry", () => {
  it("accepts a character with valid stats and tier", () => {
    expect(validateCharacterStatEntry(validEntry({ tier: 2 })).valid).toBe(true);
  });

  it("rejects when total falls outside tier range", () => {
    const entry = validEntry({
      tier: 1,
      stats: {
        strength: 2,
        speed: 2,
        intelligence: 2,
        durability: 1,
        energy_projection: 0,
        skill: 0,
      },
    });
    const result = validateCharacterStatEntry(entry);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("outside tier"))).toBe(true);
  });

  it("rejects a stat below 0", () => {
    const entry = validEntry({ stats: { strength: -1 } });
    expect(validateCharacterStatEntry(entry).valid).toBe(false);
  });

  it("rejects a stat above 5", () => {
    const entry = validEntry({ stats: { skill: 6 } });
    expect(validateCharacterStatEntry(entry).valid).toBe(false);
  });

  it("rejects missing core stats", () => {
    const entry = {
      id: "001",
      name: "X",
      tier: 1,
      stats: { strength: 1, speed: 1 },
    };
    expect(validateCharacterStatEntry(entry).valid).toBe(false);
    expect(validateCharacterStatEntry(entry).errors.some((e) => e.includes("missing"))).toBe(true);
  });

  it("rejects non-integer stats", () => {
    const entry = validEntry({ stats: { speed: 2.5 } });
    expect(validateCharacterStatEntry(entry).valid).toBe(false);
  });

  it("rejects extra stats", () => {
    const entry = {
      ...validEntry(),
      stats: { ...validEntry().stats, gag: 3 },
    };
    expect(validateCharacterStatEntry(entry).valid).toBe(false);
    expect(validateCharacterStatEntry(entry).errors.some((e) => e.includes("extra"))).toBe(true);
  });

  it.each([
    [1, 0],
    [1, 6],
    [2, 7],
    [2, 12],
    [3, 13],
    [3, 18],
    [4, 19],
    [4, 24],
    [5, 25],
    [5, 30],
  ] as const)("accepts tier %i boundary total %i", (tier, total) => {
    const perStat = Math.floor(total / 6);
    const remainder = total - perStat * 6;
    const keys = [
      "strength",
      "speed",
      "intelligence",
      "durability",
      "energy_projection",
      "skill",
    ] as const;
    const stats = Object.fromEntries(
      keys.map((k, i) => [k, perStat + (i < remainder ? 1 : 0)])
    ) as CharacterStatRecord["stats"];
    const entry = validEntry({ tier, stats });
    expect(validateCharacterStatEntry(entry).valid).toBe(true);
    expect(computeTotalPower(stats)).toBe(total);
  });

  it.each([
    [1, 7],
    [2, 6],
    [2, 13],
    [3, 12],
    [3, 19],
    [4, 18],
    [4, 25],
    [5, 24],
  ] as const)("rejects tier %i total %i just outside boundary", (tier, total) => {
    const perStat = Math.floor(total / 6);
    const remainder = total - perStat * 6;
    const keys = [
      "strength",
      "speed",
      "intelligence",
      "durability",
      "energy_projection",
      "skill",
    ] as const;
    const stats = Object.fromEntries(
      keys.map((k, i) => [k, Math.max(0, Math.min(5, perStat + (i < remainder ? 1 : 0)))])
    ) as CharacterStatRecord["stats"];
    const entry = validEntry({ tier, stats });
    const result = validateCharacterStatEntry(entry);
    expect(result.valid).toBe(false);
  });

  it("computes total power as sum of six stats", () => {
    const stats = validEntry().stats;
    expect(computeTotalPower(stats)).toBe(12);
  });

  it("defines tier ranges 1 through 5", () => {
    expect(Object.keys(TIER_POWER_RANGES).map(Number).sort()).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });
});
