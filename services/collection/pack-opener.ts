import { CARDS_PER_PACK } from "@/constants/series";
import { normalizeCharacterId } from "@/lib/character-id";
import { getCommonDisplayableCharacters } from "@/lib/common-displayable-cards";
import { getDisplayableCharacters } from "@/lib/displayable-cards";
import { pickCardIdsFromPools, type PackPullMode } from "@/lib/pack-pool";
import { generateCardFromCharacter } from "@/services/pipeline";
import type { GeneratedCard } from "@/types/card";

/**
 * Picks `count` character IDs for a pack.
 * No duplicate commons until each common displayable card is owned or already in this pack.
 */
export function pickRandomCardIds(
  count: number = CARDS_PER_PACK,
  ownedCharacterIds: Iterable<string> = [],
  random?: () => number,
  mode: PackPullMode = "collector"
): string[] {
  const displayable = getDisplayableCharacters();
  const commons = getCommonDisplayableCharacters();

  return pickCardIdsFromPools(
    count,
    displayable.map((character) => character.id),
    commons.map((character) => character.id),
    ownedCharacterIds,
    random,
    { mode }
  );
}

export { pickCardIdsFromPools } from "@/lib/pack-pool";

export function resolvePackCards(cardIds: string[]): GeneratedCard[] {
  const characters = getDisplayableCharacters();
  const byId = new Map(characters.map((c) => [c.id, c]));

  return cardIds
    .map((id) => byId.get(normalizeCharacterId(id)))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((character) => generateCardFromCharacter(character));
}

export function openPack(
  ownedCharacterIds: Iterable<string> = [],
  mode: PackPullMode = "collector"
): {
  cardIds: string[];
  cards: GeneratedCard[];
} {
  const cardIds = pickRandomCardIds(CARDS_PER_PACK, ownedCharacterIds, undefined, mode);
  const cards = resolvePackCards(cardIds);
  return { cardIds, cards };
}
