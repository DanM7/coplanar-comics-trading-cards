import fs from "fs";
import path from "path";
import { getAllCharacters } from "@/lib/cards-loader";
import {
  getCardPrintById,
  getDefaultCardPrintForCharacter,
} from "@/lib/card-editor-designs-loader";
import { cardPrintPngFilename, cardPrintPngPublicUrl } from "@/lib/card-export-filenames";
import { normalizeCharacterId } from "@/lib/character-id";
import { formatCardPrintId } from "@/lib/format-card-series-footer";
import type { GeneratedCard } from "@/types/card";
import type { Character } from "@/types/character";

let cachedDisplayableCharacterIds: Set<string> | null = null;

export function finishedPngExists(
  printId: string | number,
  side: "front" | "back"
): boolean {
  const filename = cardPrintPngFilename(printId, side);
  const root = process.cwd();
  const candidates = [
    path.join(root, "public", "assets", "cards", filename),
    path.join(root, "assets", "cards", filename),
  ];
  return candidates.some((filePath) => fs.existsSync(filePath));
}

function readCardAssetFilenames(): string[] {
  const root = process.cwd();
  const dirs = [
    path.join(root, "assets", "cards"),
    path.join(root, "public", "assets", "cards"),
  ];
  const names = new Set<string>();

  for (const dir of dirs) {
    try {
      for (const name of fs.readdirSync(dir)) {
        if (/\.png$/i.test(name)) {
          names.add(name.toLowerCase());
        }
      }
    } catch {
      // Directory may not exist yet.
    }
  }

  return [...names];
}

function getPrintIdsWithFinishedArt(): Set<string> {
  const fronts = new Set<string>();
  const backs = new Set<string>();

  for (const filename of readCardAssetFilenames()) {
    const frontMatch = filename.match(/^(.+)-front\.png$/);
    const backMatch = filename.match(/^(.+)-back\.png$/);
    if (frontMatch) {
      fronts.add(formatCardPrintId(frontMatch[1]));
    }
    if (backMatch) {
      backs.add(formatCardPrintId(backMatch[1]));
    }
  }

  const complete = new Set<string>();
  for (const printId of fronts) {
    if (backs.has(printId)) {
      complete.add(printId);
    }
  }
  return complete;
}

function getDisplayableCharacterIdSet(): Set<string> {
  if (cachedDisplayableCharacterIds) {
    return cachedDisplayableCharacterIds;
  }

  const ids = new Set<string>();
  for (const printId of getPrintIdsWithFinishedArt()) {
    const print = getCardPrintById(printId);
    if (print) {
      ids.add(normalizeCharacterId(print.character));
    }
  }

  cachedDisplayableCharacterIds = ids;
  return ids;
}

export function characterHasFinishedCardArt(characterId: string): boolean {
  return getDisplayableCharacterIdSet().has(normalizeCharacterId(characterId));
}

/** Characters whose default print has both front and back PNGs in assets/cards/. */
export function getDisplayableCharacters(): Character[] {
  const allowed = getDisplayableCharacterIdSet();
  return getAllCharacters().filter((character) => allowed.has(character.id));
}

export function getDisplayableCharacterCount(): number {
  return getDisplayableCharacters().length;
}

export function clearDisplayableCardsCache(): void {
  cachedDisplayableCharacterIds = null;
}

/** Attach finished PNG URLs for displayable cards (both sides on disk). */
export function attachFinishedCardArt(card: GeneratedCard): GeneratedCard {
  if (!characterHasFinishedCardArt(card.characterId)) {
    return card;
  }

  const print = getDefaultCardPrintForCharacter(card.characterId);
  if (!print) {
    return card;
  }

  return {
    ...card,
    printId: String(print.id),
    finishedFrontUrl: cardPrintPngPublicUrl(print.id, "front"),
    finishedBackUrl: cardPrintPngPublicUrl(print.id, "back"),
  };
}
