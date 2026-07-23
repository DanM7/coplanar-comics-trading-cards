import { afterEach, describe, expect, it, vi } from "vitest";
import { resolvePlayPortraitUrl } from "@/lib/play-portrait";

describe("resolvePlayPortraitUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when a done card print is missing its front PNG", () => {
    expect(resolvePlayPortraitUrl("049")).toBeNull();
  });

  it("returns the public card PNG URL when the front PNG exists", () => {
    expect(resolvePlayPortraitUrl("041")).toBe("/assets/cards/041-front.png");
  });

  it("returns the public card PNG URL in production without a local PNG check", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(resolvePlayPortraitUrl("049")).toBe("/assets/cards/049-front.png");
  });
});
