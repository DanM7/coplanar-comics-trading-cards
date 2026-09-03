import { describe, expect, it } from "vitest";
import type { PlayRosterEntry } from "@/types/game";
import {
  findBestTeam,
  filterPlayRoster,
  scoreTeam,
  sortPlayRoster,
} from "@/services/game/team-optimizer";
import { rosterEntryPowerScore } from "@/services/game/team-power";

function mockEntry(
  id: string,
  overrides: Partial<PlayRosterEntry> = {}
): PlayRosterEntry {
  return {
    characterId: id,
    name: id,
    alignment: "Good",
    type: "Human",
    homePlane: "Human",
    homeLocation: "Coplanar City",
    homeDistrict: "Realspace Row",
    tier: 3,
    stats: {
      strength: 3,
      speed: 3,
      intelligence: 3,
      durability: 3,
      energy_projection: 3,
      skill: 3,
    },
    moves: [{ name: "Hit", attackType: "physical", value: 1 }],
    ...overrides,
  };
}

describe("sortPlayRoster", () => {
  it("sorts by card number", () => {
    const roster = [
      mockEntry("10", { tier: 2 }),
      mockEntry("2", { tier: 4 }),
      mockEntry("5", { tier: 1 }),
    ];

    expect(
      sortPlayRoster(roster, "num", "asc").map((entry) => entry.characterId)
    ).toEqual(["2", "5", "10"]);
  });

  it("sorts by power and core stats", () => {
    const roster = [
      mockEntry("1", {
        stats: {
          strength: 1,
          speed: 1,
          intelligence: 1,
          durability: 1,
          energy_projection: 1,
          skill: 1,
        },
      }),
      mockEntry("2", {
        stats: {
          strength: 5,
          speed: 5,
          intelligence: 5,
          durability: 5,
          energy_projection: 5,
          skill: 5,
        },
        moves: [{ name: "Blast", attackType: "energy", value: 3 }],
      }),
      mockEntry("3", {
        stats: {
          strength: 3,
          speed: 3,
          intelligence: 3,
          durability: 3,
          energy_projection: 3,
          skill: 3,
        },
      }),
    ];

    expect(
      sortPlayRoster(roster, "power", "desc").map((entry) => entry.characterId)
    ).toEqual(["2", "3", "1"]);
    expect(rosterEntryPowerScore(roster[1])).toBeGreaterThan(
      rosterEntryPowerScore(roster[2])
    );
    expect(
      sortPlayRoster(roster, "strength", "desc").map((entry) => entry.characterId)
    ).toEqual(["2", "3", "1"]);
  });
});

describe("filterPlayRoster", () => {
  it("filters by alignment, home, and primary type", () => {
    const roster = [
      mockEntry("1", { alignment: "Good", homeDistrict: "A", type: "Human" }),
      mockEntry("2", { alignment: "Evil", homeDistrict: "B", type: "Robot" }),
      mockEntry("3", {
        alignment: "Good",
        homeDistrict: "A",
        type: "Construct / Cartoon",
      }),
    ];

    expect(
      filterPlayRoster(roster, {
        alignment: "Good",
        homeDistrict: "A",
        type: "Construct",
      }).map((entry) => entry.characterId)
    ).toEqual(["3"]);
  });
});

describe("findBestTeam", () => {
  it("prefers a matching-type trio over mixed types", () => {
    const roster = [
      mockEntry("1", {
        type: "Human",
        stats: {
          strength: 2,
          speed: 2,
          intelligence: 2,
          durability: 2,
          energy_projection: 2,
          skill: 2,
        },
      }),
      mockEntry("2", {
        type: "Human",
        stats: {
          strength: 2,
          speed: 2,
          intelligence: 2,
          durability: 2,
          energy_projection: 2,
          skill: 2,
        },
      }),
      mockEntry("3", {
        type: "Human",
        stats: {
          strength: 2,
          speed: 2,
          intelligence: 2,
          durability: 2,
          energy_projection: 2,
          skill: 2,
        },
      }),
      mockEntry("4", {
        type: "Robot",
        stats: {
          strength: 5,
          speed: 5,
          intelligence: 5,
          durability: 5,
          energy_projection: 5,
          skill: 5,
        },
      }),
      mockEntry("5", {
        type: "Robot",
        stats: {
          strength: 5,
          speed: 5,
          intelligence: 5,
          durability: 5,
          energy_projection: 5,
          skill: 5,
        },
      }),
      mockEntry("6", {
        type: "Robot",
        stats: {
          strength: 5,
          speed: 5,
          intelligence: 5,
          durability: 5,
          energy_projection: 5,
          skill: 5,
        },
      }),
    ];

    const humanTrio = scoreTeam(roster.slice(0, 3));
    const robotTrio = scoreTeam(roster.slice(3, 6));
    const best = findBestTeam(roster);

    expect(robotTrio).toBeGreaterThan(humanTrio);
    expect(best).toEqual(["4", "5", "6"]);
  });
});
