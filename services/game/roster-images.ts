import { resolvePlayPortraitUrl } from "@/lib/play-portrait";
import type { PlayRosterEntry } from "@/types/game";

/** Server-only: attach raw front portrait URLs for play UI (no card frame). */
export function attachRosterFrontImages(
  roster: PlayRosterEntry[]
): PlayRosterEntry[] {
  return roster.map((entry) => {
    const portraitUrl = resolvePlayPortraitUrl(entry.characterId);
    if (!portraitUrl) {
      return entry;
    }

    return {
      ...entry,
      frontImageUrl: portraitUrl,
    };
  });
}
