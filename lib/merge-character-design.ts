import {
  getCardPrintById,
  storageKeyForCardPrint,
} from "@/lib/card-editor-designs-loader";
import { normalizeCharacterId } from "@/lib/character-id";
import {
  DEFAULT_CARD_DESIGN,
  normalizeCardDesign,
  type CardDesignConfig,
} from "@/types/card-design";
import type { CardPrintDefinition } from "@/types/card-editor-designs";

const STORAGE_PREFIX = "coplanar-comics-card-design:";

function loadDesignFromStorageKey(key: string): Partial<CardDesignConfig> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<CardDesignConfig>;
  } catch {
    return null;
  }
}

/**
 * Merges default → browser (per print, then per character/file) → repo card entry.
 */
export function mergeCardPrintDesign(
  cardPrint: CardPrintDefinition | null,
  characterId: string | null,
  frontFilename: string | null
): CardDesignConfig {
  const characterKey = characterId ? normalizeCharacterId(characterId) : null;

  let merged: Partial<CardDesignConfig> = { ...DEFAULT_CARD_DESIGN };

  if (frontFilename) {
    const byFile = loadDesignFromStorageKey(frontFilename);
    if (byFile) merged = { ...merged, ...byFile };
  }

  if (characterKey) {
    const byCharacter = loadDesignFromStorageKey(characterKey);
    if (byCharacter) merged = { ...merged, ...byCharacter };
  }

  if (cardPrint) {
    const byPrint = loadDesignFromStorageKey(storageKeyForCardPrint(cardPrint.id));
    if (byPrint) merged = { ...merged, ...byPrint };
    if (cardPrint.design) merged = { ...merged, ...cardPrint.design };
  }

  return normalizeCardDesign(merged);
}

/** @deprecated Use mergeCardPrintDesign with a card print entry. */
export function mergeCharacterDesign(
  characterId: string | null,
  frontFilename: string | null,
  repoDesigns?: Record<string, Partial<CardDesignConfig>>
): CardDesignConfig {
  const id = characterId ? normalizeCharacterId(characterId) : null;
  const repoPrint: CardPrintDefinition | null =
    id && repoDesigns?.[id]
      ? {
          id,
          rarity: "common",
          character: id,
          design: repoDesigns[id],
        }
      : id
        ? getCardPrintById(id) ?? null
        : null;

  if (repoPrint) {
    return mergeCardPrintDesign(repoPrint, id, frontFilename);
  }

  return mergeCardPrintDesign(null, id, frontFilename);
}

export function storageKeyForCharacter(characterId: string): string {
  return normalizeCharacterId(characterId);
}

export function buildRepoExportPayload(
  cardPrint: CardPrintDefinition,
  design: CardDesignConfig,
  options?: { frontFilename?: string | null; backFilename?: string | null }
) {
  const entry: CardPrintDefinition = {
    id: cardPrint.id,
    rarity: cardPrint.rarity,
    character: cardPrint.character,
    ...(cardPrint.frontImage ? { frontImage: cardPrint.frontImage } : {}),
    ...(cardPrint.backImage ? { backImage: cardPrint.backImage } : {}),
    design,
  };

  return {
    readme:
      "Merge this entry into data/card_editor_designs.json (cards array). Match by print id.",
    cardPrintId: cardPrint.id,
    characterId: normalizeCharacterId(cardPrint.character),
    frontFilename: options?.frontFilename ?? null,
    backFilename: options?.backFilename ?? null,
    design,
    repoFileSnippet: {
      cards: [entry],
    },
  };
}
