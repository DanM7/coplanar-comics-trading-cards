import { describe, expect, it } from "vitest";
import type { CoreStats } from "@/types/character-stats";
import { computeTeamSynergy } from "@/services/game/stats";
import { scoreTeam } from "@/services/game/team-optimizer";
import type { PlayRosterEntry } from "@/types/game";

function tierStats(totalTier: number): CoreStats {
  const perStat = Math.max(1, Math.min(5, Math.round(totalTier / 1.5)));
  return {
    strength: perStat,
    speed: perStat,
    intelligence: perStat,
    durability: perStat,
    energy_projection: perStat,
    skill: perStat,
  };
}

function mockEntry(
  id: string,
  overrides: Partial<PlayRosterEntry> = {}
): PlayRosterEntry {
  return {
    characterId: id,
    name: id,
    alignment: "Good",
    type: "Human",
    homeDistrict: "Realspace Row",
    tier: 3,
    stats: tierStats(3),
    moves: [{ name: "Hit", attackType: "physical", value: 1 }],
    ...overrides,
  };
}

describe("computeTeamSynergy type", () => {
  it("grants reduced damage bonuses for matching types", () => {
    expect(
      computeTeamSynergy({
        types: ["Construct", "Construct", "Construct"],
        alignments: [],
        homeDistricts: [],
      }).typeDamage
    ).toBe(0.1);

    expect(
      computeTeamSynergy({
        types: ["Human", "Human", "Robot"],
        alignments: [],
        homeDistricts: [],
      }).typeDamage
    ).toBe(0.05);
  });
});

describe("computeTeamSynergy alignment", () => {
  it("grants defense bonus for all-Good, all-Evil, or all-Neutral teams", () => {
    expect(
      computeTeamSynergy({
        types: [],
        alignments: ["Good", "Good", "Good"],
        homeDistricts: [],
      }).alignmentDefense
    ).toBe(0.15);

    expect(
      computeTeamSynergy({
        types: [],
        alignments: ["Evil", "Evil", "Evil"],
        homeDistricts: [],
      }).alignmentDefense
    ).toBe(0.15);

    expect(
      computeTeamSynergy({
        types: [],
        alignments: ["Neutral", "Neutral", "Neutral"],
        homeDistricts: [],
      }).alignmentDefense
    ).toBe(0.15);
  });

  it("does not grant alignment bonus for mixed teams", () => {
    expect(
      computeTeamSynergy({
        types: [],
        alignments: ["Good", "Evil", "Good"],
        homeDistricts: [],
      }).alignmentDefense
    ).toBe(0);

    expect(
      computeTeamSynergy({
        types: [],
        alignments: ["Good", "Good", "Neutral"],
        homeDistricts: [],
      }).alignmentDefense
    ).toBe(0);
  });
});

describe("team balance", () => {
  it("favors three tier-4 Good fighters over a mixed-tier Construct stack", () => {
    const tier4 = tierStats(4);
    const tier3 = tierStats(3);
    const tier2 = tierStats(2);

    const goodTeam = [
      mockEntry("1", { tier: 4, alignment: "Good", type: "Human", stats: tier4 }),
      mockEntry("2", { tier: 4, alignment: "Good", type: "Superhuman", stats: tier4 }),
      mockEntry("3", { tier: 4, alignment: "Good", type: "Robot", stats: tier4 }),
    ];

    const constructTeam = [
      mockEntry("4", { tier: 4, alignment: "Neutral", type: "Construct", stats: tier4 }),
      mockEntry("5", { tier: 3, alignment: "Neutral", type: "Construct", stats: tier3 }),
      mockEntry("6", { tier: 2, alignment: "Neutral", type: "Construct", stats: tier2 }),
    ];

    expect(scoreTeam(goodTeam)).toBeGreaterThan(scoreTeam(constructTeam));
  });
});
