import { normalizeCharacterId } from "@/lib/character-id";

type RandomFn = () => number;

/**
 * Picks pack slots: unique unowned commons first, then any displayable card
 * (duplicates allowed once every common card is exhausted).
 */
export function pickCardIdsFromPools(
  count: number,
  displayableIds: string[],
  commonIds: string[],
  ownedCharacterIds: Iterable<string> = [],
  random: RandomFn = Math.random
): string[] {
  if (displayableIds.length === 0) {
    throw new Error("No cards with finished art are available.");
  }

  const owned = new Set(
    [...ownedCharacterIds].map((id) => normalizeCharacterId(id))
  );
  const commonSet = new Set(commonIds.map((id) => normalizeCharacterId(id)));
  const picked: string[] = [];
  const pickedInPack = new Set<string>();

  for (let i = 0; i < count; i++) {
    const remainingUnownedCommons = commonIds.filter((id) => {
      const normalized = normalizeCharacterId(id);
      return !owned.has(normalized) && !pickedInPack.has(normalized);
    });

    const pool =
      remainingUnownedCommons.length > 0
        ? remainingUnownedCommons
        : displayableIds;

    const index = Math.floor(random() * pool.length);
    const cardId = normalizeCharacterId(pool[index]);
    picked.push(cardId);
    pickedInPack.add(cardId);

    if (commonSet.has(cardId)) {
      owned.add(cardId);
    }
  }

  return picked;
}
