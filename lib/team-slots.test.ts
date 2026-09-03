import { describe, expect, it } from "vitest";
import {
  clearTeamSlot,
  emptyTeamSlots,
  formatTeamSynergyBonuses,
  MAX_TEAM_STAT_POWER,
  setTeamSlotsFromIds,
  statBonusesAsBlockValues,
  teamStatPowerFromSlotEntries,
  toggleTeamSlot,
  totalTeamStatBoost,
} from "@/services/game/team-slots";
import { computeTeamSynergy } from "@/services/game/stats";
import type { PlayRosterEntry } from "@/types/game";

describe("team stat bonus display", () => {
  it("maps +0.1 bonus to one filled block and sums total boost", () => {
    const bonuses = {
      strength: 0.4,
      speed: 0.2,
      intelligence: 0.1,
      durability: 0.5,
      energy_projection: 0,
      skill: 0.3,
    };

    expect(statBonusesAsBlockValues(bonuses)).toEqual({
      strength: 4,
      speed: 2,
      intelligence: 1,
      durability: 5,
      energy_projection: 0,
      skill: 3,
    });
    expect(totalTeamStatBoost(bonuses)).toBeCloseTo(1.5);
  });

  it("sums each stat's highest slot value out of 30", () => {
    const entry = (stats: Partial<PlayRosterEntry["stats"]>): PlayRosterEntry =>
      ({
        characterId: "x",
        name: "X",
        alignment: "Hero",
        type: "Human",
        homePlane: "Human",
        homeLocation: "Coplanar City",
        homeDistrict: "Downtown",
        tier: 3,
        stats: {
          strength: 4,
          speed: 2,
          intelligence: 3,
          durability: 5,
          energy_projection: 1,
          skill: 2,
          ...stats,
        },
        moves: [],
      }) as PlayRosterEntry;

    expect(
      teamStatPowerFromSlotEntries([
        entry({ strength: 5, intelligence: 4 }),
        entry({ strength: 3, intelligence: 5 }),
        null,
      ])
    ).toBe(5 + 2 + 5 + 5 + 1 + 2);
    expect(MAX_TEAM_STAT_POWER).toBe(30);
  });

  it("includes matching types and alignment in synergy labels", () => {
    const entries = [
      {
        characterId: "1",
        name: "A",
        alignment: "Good",
        type: "Construct",
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
        moves: [],
      },
      {
        characterId: "2",
        name: "B",
        alignment: "Good",
        type: "Construct",
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
        moves: [],
      },
      {
        characterId: "3",
        name: "C",
        alignment: "Good",
        type: "Superhuman",
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
        moves: [],
      },
    ] as PlayRosterEntry[];

    const synergy = computeTeamSynergy({
      types: entries.map((entry) => entry.type),
      alignments: entries.map((entry) => entry.alignment),
      homePlanes: entries.map((entry) => entry.homePlane),
      homeLocations: entries.map((entry) => entry.homeLocation),
      homeDistricts: entries.map((entry) => entry.homeDistrict),
    });

    expect(formatTeamSynergyBonuses(entries, synergy)).toEqual([
      "Type (Construct x2): +5% damage",
      "Alignment (Good): +15% defense",
      "District (Realspace Row): +15% accuracy",
    ]);
  });
});

describe("team slots", () => {
  it("fills the next empty slot and compacts on remove", () => {
    let slots = emptyTeamSlots();
    slots = toggleTeamSlot(slots, "a");
    slots = toggleTeamSlot(slots, "b");
    expect(slots).toEqual(["a", "b", null]);

    slots = toggleTeamSlot(slots, "a");
    expect(slots).toEqual(["b", null, null]);
  });

  it("sets slots from find-best results", () => {
    expect(setTeamSlotsFromIds(["3", "1", "2"])).toEqual(["3", "1", "2"]);
  });

  it("clears a slot and compacts remaining picks", () => {
    expect(clearTeamSlot(["a", "b", "c"], 1)).toEqual(["a", "c", null]);
  });
});
