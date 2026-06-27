import { getDefaultCardPrintForCharacter } from "@/lib/card-editor-designs-loader";
import { cardPrintPngPublicUrl } from "@/lib/card-export-filenames";
import { finishedPngExists } from "@/lib/displayable-cards";
import type { PlayRosterEntry } from "@/types/game";

/** Server-only: attach finished front PNG URLs when assets exist on disk. */
export function attachRosterFrontImages(
  roster: PlayRosterEntry[]
): PlayRosterEntry[] {
  return roster.map((entry) => {
    const print = getDefaultCardPrintForCharacter(entry.characterId);
    if (!print || !finishedPngExists(print.id, "front")) {
      return entry;
    }

    return {
      ...entry,
      frontImageUrl: cardPrintPngPublicUrl(print.id, "front"),
    };
  });
}
