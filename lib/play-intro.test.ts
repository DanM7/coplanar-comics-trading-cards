import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  dismissPlayIntro,
  isPlayIntroDismissed,
} from "@/lib/play-intro";

function createLocalStorage() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe("play-intro", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createLocalStorage() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts undismissed", () => {
    expect(isPlayIntroDismissed()).toBe(false);
  });

  it("persists dismissal in localStorage", () => {
    dismissPlayIntro();
    expect(isPlayIntroDismissed()).toBe(true);
    expect(window.localStorage.getItem("coplanar:play-intro-dismissed")).toBe(
      "1"
    );
  });
});
