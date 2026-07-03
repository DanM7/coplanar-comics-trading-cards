import type { PlayRosterEntry } from "@/types/game";

export interface PlayRosterResponse {
  mode: "collection" | "guest";
  roster: PlayRosterEntry[];
  totalOwned: number;
}

const ROSTER_URL = "/api/play/roster";

let cachedRoster: PlayRosterResponse | null = null;
let inflightRoster: Promise<PlayRosterResponse> | null = null;

export function getCachedPlayRoster(): PlayRosterResponse | null {
  return cachedRoster;
}

export function clearPlayRosterCache(): void {
  cachedRoster = null;
}

export async function fetchPlayRoster(
  options: { force?: boolean } = {}
): Promise<PlayRosterResponse> {
  if (!options.force && cachedRoster) {
    return cachedRoster;
  }

  if (!options.force && inflightRoster) {
    return inflightRoster;
  }

  const request = fetch(ROSTER_URL)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error("Failed to load play roster");
      }
      return (await res.json()) as PlayRosterResponse;
    })
    .then((payload) => {
      cachedRoster = payload;
      return payload;
    })
    .finally(() => {
      inflightRoster = null;
    });

  inflightRoster = request;
  return request;
}

/** Warm roster JSON while the user browses; failures are ignored. */
export function prefetchPlayRoster(): void {
  void fetchPlayRoster().catch(() => undefined);
}
