import { describe, expect, it } from "vitest";
import { sumMovePower } from "@/lib/card-power-summary";
import type { MoveDisplay } from "@/types/character-moves";

function attackMove(
  overrides: Partial<MoveDisplay> = {}
): MoveDisplay {
  return {
    name: "Strike",
    value: 2,
    attackType: "physical",
    ...overrides,
  };
}

describe("sumMovePower", () => {
  it("sums attack move values", () => {
    expect(
      sumMovePower([attackMove({ value: 2 }), attackMove({ value: 3 })])
    ).toBe(5);
  });

  it("multiplies range attack moves by 3", () => {
    expect(
      sumMovePower([
        attackMove({ value: 2, scope: "range" }),
        attackMove({ value: 3 }),
      ])
    ).toBe(9);
  });

  it("ignores non-attack moves", () => {
    expect(
      sumMovePower([
        attackMove({ name: "", value: 5 }),
        attackMove({ statBoosts: [{ stat: "strength", amount: 1 }], value: 4 }),
        attackMove({ hpBoost: { percent: 25 }, value: 4 }),
      ])
    ).toBe(0);
  });
});
