import { portraitUrlForCharacter } from "@/lib/character-portrait-url";
import { isDevToolsEnabled } from "@/lib/dev-only";
import { resolvePlayPortraitUrl } from "@/lib/play-portrait";
import type { PlayRosterEntry } from "@/types/game";

/** Server-only: attach finished front PNG + raw portrait URLs for play UI. */
export function attachRosterFrontImages(
  roster: PlayRosterEntry[]
): PlayRosterEntry[] {
  return roster.map((entry) => {
    const frontImageUrl = resolvePlayPortraitUrl(entry.characterId);
    const portraitUrl = isDevToolsEnabled()
      ? portraitUrlForCharacter(entry.characterId)
      : null;

    if (!frontImageUrl && !portraitUrl) {
      return entry;
    }

    return {
      ...entry,
      ...(frontImageUrl ? { frontImageUrl } : {}),
      ...(portraitUrl ? { portraitUrl } : {}),
    };
  });
}
