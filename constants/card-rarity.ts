import type { CardRarity } from "@/types/card-editor-designs";

/** Footer symbol for each known rarity tier. */
export const CARD_RARITY_SYMBOLS: Record<string, string> = {
  common: "●",
  uncommon: "◆",
  rare: "★",
  holo: "◆",
};

const DEFAULT_RARITY_SYMBOL = CARD_RARITY_SYMBOLS.common;

export function getCardRaritySymbol(rarity: CardRarity): string {
  const key = String(rarity).trim().toLowerCase();
  return CARD_RARITY_SYMBOLS[key] ?? DEFAULT_RARITY_SYMBOL;
}
