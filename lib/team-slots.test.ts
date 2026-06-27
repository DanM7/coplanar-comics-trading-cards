import { describe, expect, it } from "vitest";
import {
  clearTeamSlot,
  emptyTeamSlots,
  setTeamSlotsFromIds,
  statBonusesAsBlockValues,
  toggleTeamSlot,
  totalTeamStatBoost,
} from "@/services/game/team-slots";

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
