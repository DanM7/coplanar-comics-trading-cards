import { getCardRaritySymbol } from "@/constants/card-rarity";
import type { CardRarity } from "@/types/card-editor-designs";

/** Canonical print id for footer, storage keys, and lookups. */
export function formatCardPrintId(cardPrintId: number | string): string {
  const raw = String(cardPrintId).trim();
  if (/^\d+$/.test(raw)) {
    return raw.padStart(3, "0");
  }
  return raw;
}

/** e.g. `● 001 – Coplanar Comics Trading Cards – Series 1` or `◆ B01 – …` */
export function formatCardSeriesFooter(
  cardPrintId: number | string,
  rarity: CardRarity,
  seriesTitle: string
): string {
  const id = formatCardPrintId(cardPrintId);
  const symbol = getCardRaritySymbol(rarity);
  return `${symbol} ${id} – ${seriesTitle}`;
}
