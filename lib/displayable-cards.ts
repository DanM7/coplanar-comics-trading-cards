import fs from "fs";
import path from "path";
import { getAllCharacters } from "@/lib/cards-loader";
import {
  getCardPrintById,
  getCardPrintDefinitions,
  getDefaultCardPrintForCharacter,
} from "@/lib/card-editor-designs-loader";
import { cardPrintPngFilename, cardPrintPngPublicUrl } from "@/lib/card-export-filenames";
import { normalizeCharacterId } from "@/lib/character-id";
import { formatCardPrintId } from "@/lib/format-card-series-footer";
import type { GeneratedCard } from "@/types/card";
import type { Character } from "@/types/character";

let cachedDisplayableCharacterIds: Set<string> | null = null;

function isDoneCardPrint(status: string | undefined): boolean {
  return String(status ?? "").trim().toLowerCase() === "done";
}

export function isCollectibleCardPrint(
  print: { status?: string } | undefined
): boolean {
  return print ? isDoneCardPrint(print.status) : false;
}

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

function getPrintIdsWithFinishedArt(): Set<string> {
  const complete = new Set<string>();
  for (const print of getCardPrintDefinitions()) {
    if (isDoneCardPrint(print.status)) {
      complete.add(formatCardPrintId(print.id));
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

/** Characters whose default print is marked done in card_editor_designs.json. */
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

/** Attach finished PNG URLs for displayable cards. */
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
