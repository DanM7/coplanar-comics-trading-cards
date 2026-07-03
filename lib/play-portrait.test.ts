import { describe, expect, it } from "vitest";
import { resolvePlayPortraitUrl } from "@/lib/play-portrait";

describe("resolvePlayPortraitUrl", () => {
  it("returns null when a done card print is missing its front PNG", () => {
    expect(resolvePlayPortraitUrl("040")).toBeNull();
  });

  it("returns the public card PNG URL when the front PNG exists", () => {
    expect(resolvePlayPortraitUrl("041")).toBe("/assets/cards/041-front.png");
  });
});
