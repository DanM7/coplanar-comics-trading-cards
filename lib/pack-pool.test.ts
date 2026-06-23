import { describe, expect, it } from "vitest";
import { pickCardIdsFromPools } from "@/lib/pack-pool";

describe("pickCardIdsFromPools", () => {
  const displayable = ["001", "002", "003", "004", "005"];
  const commons = ["001", "002", "003"];

  it("does not duplicate commons until each common is in the pack", () => {
    const picked = pickCardIdsFromPools(3, displayable, commons, [], () => 0.01);

    expect(new Set(picked).size).toBe(3);
    expect(picked.every((id) => commons.includes(id))).toBe(true);
  });

  it("allows duplicates after all commons are owned", () => {
    const picked = pickCardIdsFromPools(
      4,
      displayable,
      commons,
      ["001", "002", "003"],
      () => 0
    );

    expect(picked).toEqual(["001", "001", "001", "001"]);
  });

  it("skips owned commons and fills with unowned commons before duplicates", () => {
    const picked = pickCardIdsFromPools(
      2,
      displayable,
      commons,
      ["001", "002"],
      () => 0
    );

    expect(picked[0]).toBe("003");
    expect(picked[1]).toBe("001");
  });
});
