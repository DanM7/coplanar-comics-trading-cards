import type { PackPullMode } from "@/lib/pack-pool";
import { normalizeCharacterId } from "@/lib/character-id";
import { openPack } from "@/services/collection/pack-opener";
import type { PackOpenResult } from "@/types/collection";

export function buildPreparedPackPayload(
  ownedCharacterIds: Iterable<string>,
  mode: PackPullMode
): Omit<PackOpenResult, "savedToCollection"> {
  const owned = new Set(
    [...ownedCharacterIds].map((id) => normalizeCharacterId(id))
  );
  const { cardIds, cards } = openPack(owned, mode);
  const newCharacterIds = cardIds.filter(
    (id) => !owned.has(normalizeCharacterId(id))
  );

  return {
    cardIds,
    cards,
    newCharacterIds,
    openedAt: new Date().toISOString(),
  };
}
