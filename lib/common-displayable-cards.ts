import { getDefaultCardPrintForCharacter } from "@/lib/card-editor-designs-loader";
import { getDisplayableCharacters } from "@/lib/displayable-cards";
import type { Character } from "@/types/character";
import type { CardRarity } from "@/types/card-editor-designs";

export function isCommonCardRarity(rarity: CardRarity): boolean {
  return String(rarity).trim().toLowerCase() === "common";
}

/** Displayable characters whose default print is common rarity. */
export function getCommonDisplayableCharacters(): Character[] {
  return getDisplayableCharacters().filter((character) => {
    const print = getDefaultCardPrintForCharacter(character.id);
    return print ? isCommonCardRarity(print.rarity) : false;
  });
}
