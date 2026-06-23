import type { CardDesignConfig } from "@/types/card-design";

/** Rarity tier label (e.g. common, holo). */
export type CardRarity = "common" | "uncommon" | "rare" | "holo" | string;

/**
 * One printable trading card product. Multiple entries may share the same
 * `character` (e.g. common #4 and holo #4 both use Trash-Man / character 4).
 */
export interface CardPrintDefinition {
  /** Print / product id shown in the footer (`"001"`, `"B01"`, …). */
  id: string;
  /** Rarity tier; footer symbol is resolved via `getCardRaritySymbol`. */
  rarity: CardRarity;
  /** Character id from character_descriptions.json (Pokemon-style # on card). */
  character: number | string;
  /** Optional front art filename in assets/raw_front (overrides character id lookup). */
  frontImage?: string;
  /** Optional back art filename in assets/raw_back (overrides OG naming convention). */
  backImage?: string;
  /** Optional layout overrides; omit to use global defaults. */
  design?: Partial<CardDesignConfig>;
  /** Editorial / production status (e.g. done, wip). */
  status?: string;
}

export interface CardEditorDesignsFile {
  cards: CardPrintDefinition[];
}
