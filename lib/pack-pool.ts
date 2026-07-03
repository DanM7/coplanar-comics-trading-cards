import { normalizeCharacterId } from "@/lib/character-id";

type RandomFn = () => number;

export type PackPullMode = "guest" | "collector";

export interface PickCardIdsOptions {
  mode?: PackPullMode;
}

function allCommonsOwned(
  commonIds: string[],
  owned: Set<string>
): boolean {
  return commonIds.every((id) => owned.has(normalizeCharacterId(id)));
}

/**
 * Picks pack slots with duplicate rules:
 * - guest: no duplicate characters within the same pack
 * - collector: no duplicates in a pack until every common card is owned; then duplicates allowed
 */
export function pickCardIdsFromPools(
  count: number,
  displayableIds: string[],
  commonIds: string[],
  ownedCharacterIds: Iterable<string> = [],
  random: RandomFn = Math.random,
  options: PickCardIdsOptions = {}
): string[] {
  if (displayableIds.length === 0) {
    throw new Error("No cards with finished art are available.");
  }

  const mode = options.mode ?? "collector";
  const owned = new Set(
    [...ownedCharacterIds].map((id) => normalizeCharacterId(id))
  );
  const commonSet = new Set(commonIds.map((id) => normalizeCharacterId(id)));
  const commonsComplete = allCommonsOwned(commonIds, owned);
  const requireUniqueInPack = mode === "guest" || !commonsComplete;

  const picked: string[] = [];
  const pickedInPack = new Set<string>();

  for (let i = 0; i < count; i++) {
    let pool: string[];

    if (requireUniqueInPack) {
      const available = displayableIds.filter(
        (id) => !pickedInPack.has(normalizeCharacterId(id))
      );
      if (available.length === 0) {
        throw new Error("Not enough unique cards available for this pack.");
      }

      const remainingUnownedCommons = commonIds.filter((id) => {
        const normalized = normalizeCharacterId(id);
        return !owned.has(normalized) && !pickedInPack.has(normalized);
      });

      pool =
        remainingUnownedCommons.length > 0 ? remainingUnownedCommons : available;
    } else {
      pool = displayableIds;
    }

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
