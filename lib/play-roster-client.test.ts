import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  clearPlayRosterCache,
  fetchPlayRoster,
  getCachedPlayRoster,
  prefetchPlayRoster,
} from "@/lib/play-roster-client";

const rosterPayload = {
  mode: "guest" as const,
  roster: [],
  totalOwned: 0,
};

describe("play-roster-client", () => {
  beforeEach(() => {
    clearPlayRosterCache();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(rosterPayload),
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("dedupes concurrent fetches and caches the result", async () => {
    const first = fetchPlayRoster();
    const second = fetchPlayRoster();

    await Promise.all([first, second]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(getCachedPlayRoster()).toEqual(rosterPayload);
  });

  it("prefetchPlayRoster warms the cache", async () => {
    prefetchPlayRoster();
    await vi.waitFor(() => {
      expect(getCachedPlayRoster()).toEqual(rosterPayload);
    });
  });
});
