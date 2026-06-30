import { cardPrintPngPublicUrl } from "@/lib/card-export-filenames";
import { getDefaultCardPrintForCharacter } from "@/lib/card-editor-designs-loader";
import { normalizeCharacterId } from "@/lib/character-id";
import { characterHasFinishedCardArt } from "@/lib/displayable-cards";

/** Public play-mode portrait URL (finished card front PNG, no frame). */
export function resolvePlayPortraitUrl(characterId: string): string | null {
  const id = normalizeCharacterId(characterId);
  if (!characterHasFinishedCardArt(id)) {
    return null;
  }

  const print = getDefaultCardPrintForCharacter(id);
  if (!print) {
    return null;
  }

  return cardPrintPngPublicUrl(print.id, "front");
}
