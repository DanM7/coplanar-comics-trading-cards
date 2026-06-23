import { findRawBackFilenameForCharacter } from "@/lib/raw-asset-names";
import { characterIdsMatch } from "@/lib/character-id";
import type { CardPrintDefinition } from "@/types/card-editor-designs";
import type { RawAssetEntry } from "@/types/card-design";
import type { Character } from "@/types/character";

interface RawAssetRef {
  filename: string;
  sortKey: string;
}

export function resolveCardPrintFrontFilename(
  cardPrint: Pick<CardPrintDefinition, "frontImage">,
  characterId: string | number,
  frontAssets: RawAssetRef[]
): string | null {
  const override = cardPrint.frontImage?.trim();
  if (override) return override;

  return (
    frontAssets.find((asset) => characterIdsMatch(asset.sortKey, characterId))
      ?.filename ?? null
  );
}

export function resolveCardPrintBackFilename(
  cardPrint: Pick<CardPrintDefinition, "backImage">,
  character: Pick<Character, "id" | "name">,
  backAssetFilenames: string[]
): string | null {
  const override = cardPrint.backImage?.trim();
  if (override) return override;

  return findRawBackFilenameForCharacter(character, backAssetFilenames);
}

export function cardPrintHasCustomFrontBorder(
  cardPrint: CardPrintDefinition
): boolean {
  return Boolean(cardPrint.design?.front?.borderId);
}

/** Front + back image API URLs for a card print (for preloading). */
export function imageUrlsForCardPrint(
  cardPrint: CardPrintDefinition,
  characters: Character[],
  frontAssets: RawAssetEntry[],
  backAssets: RawAssetEntry[]
): string[] {
  const character = characters.find((c) =>
    characterIdsMatch(c.id, cardPrint.character)
  );
  if (!character) {
    return [];
  }

  const urls: string[] = [];
  const frontFilename = resolveCardPrintFrontFilename(
    cardPrint,
    character.id,
    frontAssets
  );
  const backFilename = resolveCardPrintBackFilename(
    cardPrint,
    character,
    backAssets.map((asset) => asset.filename)
  );

  if (frontFilename) {
    const front = frontAssets.find((asset) => asset.filename === frontFilename);
    if (front?.url) {
      urls.push(front.url);
    }
  }

  if (backFilename) {
    const back = backAssets.find((asset) => asset.filename === backFilename);
    if (back?.url) {
      urls.push(back.url);
    }
  }

  return urls;
}
