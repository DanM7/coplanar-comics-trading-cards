import { describe, expect, it } from "vitest";
import { buildBinderPages } from "@/services/collection/user-collection";
import { BINDER_SLOTS_PER_PAGE, BINDER_TOTAL_PRINT_SLOTS } from "@/constants/series";

describe("buildBinderPages", () => {
  it("includes every print number in order, including unreleased slots", () => {
    const pages = buildBinderPages(new Map());
    const printIds = pages.flatMap((page) => page.slots.map((slot) => slot.printId));

    expect(printIds).toHaveLength(BINDER_TOTAL_PRINT_SLOTS);
    expect(printIds[0]).toBe("001");
    expect(printIds[5]).toBe("006");
    expect(printIds[7]).toBe("008");
    expect(printIds[11]).toBe("012");
    expect(printIds[12]).toBe("013");
  });

  it("shows placeholders for uncollected and unreleased prints", () => {
    const pages = buildBinderPages(new Map());
    const slots = pages.flatMap((page) => page.slots);

    const six = slots.find((slot) => slot.printId === "006");
    const eight = slots.find((slot) => slot.printId === "008");
    const seventeen = slots.find((slot) => slot.printId === "017");

    expect(six).toMatchObject({ owned: false, isCollectible: false });
    expect(eight).toMatchObject({ owned: false, isCollectible: false });
    expect(seventeen).toMatchObject({ owned: false, isCollectible: false });
  });

  it("paginates nine slots per page", () => {
    const pages = buildBinderPages(new Map());

    expect(pages).toHaveLength(BINDER_TOTAL_PRINT_SLOTS / BINDER_SLOTS_PER_PAGE);
    expect(pages[0]?.slots).toHaveLength(BINDER_SLOTS_PER_PAGE);
    expect(pages[0]?.slots.map((slot) => slot.printId)).toEqual([
      "001",
      "002",
      "003",
      "004",
      "005",
      "006",
      "007",
      "008",
      "009",
    ]);
    expect(pages[1]?.slots.map((slot) => slot.printId)).toEqual([
      "010",
      "011",
      "012",
      "013",
      "014",
      "015",
      "016",
      "017",
      "018",
    ]);
  });

  it("fills owned collectible slots with card data", () => {
    const pages = buildBinderPages(new Map([["001", 2]]));
    const first = pages[0]?.slots[0];

    expect(first).toMatchObject({
      printId: "001",
      owned: true,
      quantity: 2,
      isCollectible: true,
    });
    expect(first?.card?.characterId).toBe("001");
  });
});
