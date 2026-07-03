import { describe, expect, it } from "vitest";
import { pickCardIdsFromPools } from "@/lib/pack-pool";

describe("pickCardIdsFromPools", () => {
  const displayable = ["001", "002", "003", "004", "005"];
  const commons = ["001", "002", "003"];

  it("does not duplicate cards in a collector pack until all commons are owned", () => {
    const picked = pickCardIdsFromPools(
      3,
      displayable,
      commons,
      [],
      () => 0.01,
      { mode: "collector" }
    );

    expect(new Set(picked).size).toBe(3);
    expect(picked.every((id) => commons.includes(id))).toBe(true);
  });

  it("allows duplicates after all commons are owned", () => {
    const picked = pickCardIdsFromPools(
      4,
      displayable,
      commons,
      ["001", "002", "003"],
      () => 0,
      { mode: "collector" }
    );

    expect(picked).toEqual(["001", "001", "001", "001"]);
  });

  it("skips owned commons and fills with unowned commons before duplicates", () => {
    const picked = pickCardIdsFromPools(
      2,
      displayable,
      commons,
      ["001", "002"],
      () => 0,
      { mode: "collector" }
    );

    expect(picked[0]).toBe("003");
    expect(picked[1]).toBe("001");
  });

  it("does not duplicate any card in a guest pack", () => {
    const displayableTwelve = [
      "001",
      "002",
      "003",
      "004",
      "005",
      "006",
      "007",
      "008",
      "009",
      "010",
      "011",
      "012",
      "013",
    ];
    const commonsTwelve = displayableTwelve.slice(0, 10);

    const picked = pickCardIdsFromPools(
      12,
      displayableTwelve,
      commonsTwelve,
      [],
      () => 0.01,
      { mode: "guest" }
    );

    expect(picked).toHaveLength(12);
    expect(new Set(picked).size).toBe(12);
  });

  it("keeps collector packs unique until every common is owned", () => {
    const picked = pickCardIdsFromPools(
      4,
      displayable,
      commons,
      ["001", "002"],
      () => 0,
      { mode: "collector" }
    );

    expect(new Set(picked).size).toBe(4);
    expect(picked[0]).toBe("003");
  });
});
