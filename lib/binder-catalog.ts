import { BINDER_TOTAL_PRINT_SLOTS } from "@/constants/series";
import { getCardPrintById } from "@/lib/card-editor-designs-loader";
import { characterHasFinishedCardArt } from "@/lib/displayable-cards";
import { formatCardPrintId } from "@/lib/format-card-series-footer";
import { normalizeCharacterId } from "@/lib/character-id";

export interface BinderCatalogEntry {
  printId: string;
  characterId: string;
  /** True when finished front/back PNGs exist for this character. */
  isCollectible: boolean;
}

/** Ordered binder slots by print number (001, 002, …). */
export function getBinderCatalog(): BinderCatalogEntry[] {
  return Array.from({ length: BINDER_TOTAL_PRINT_SLOTS }, (_, index) => {
    const printId = formatCardPrintId(index + 1);
    const print = getCardPrintById(printId);
    const characterId = normalizeCharacterId(print?.character ?? index + 1);
    return {
      printId,
      characterId,
      isCollectible: characterHasFinishedCardArt(characterId),
    };
  });
}
