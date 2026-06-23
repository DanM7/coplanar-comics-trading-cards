import cardEditorDesignsData from "@/data/card_editor_designs.json";
import { characterIdsMatch, normalizeCharacterId } from "@/lib/character-id";
import { formatCardPrintId } from "@/lib/format-card-series-footer";
import type {
  CardEditorDesignsFile,
  CardPrintDefinition,
} from "@/types/card-editor-designs";

let cachedCards: CardPrintDefinition[] | null = null;
let cachedByPrintId: Map<string, CardPrintDefinition> | null = null;

function loadCards(): CardPrintDefinition[] {
  if (!cachedCards) {
    const file = cardEditorDesignsData as CardEditorDesignsFile;
    cachedCards = [...(file.cards ?? [])].sort((a, b) =>
      formatCardPrintId(a.id).localeCompare(formatCardPrintId(b.id), undefined, {
        numeric: true,
      })
    );
    cachedByPrintId = new Map(
      cachedCards.map((card) => [formatCardPrintId(card.id), card])
    );
  }
  return cachedCards;
}

export function getCardPrintDefinitions(): CardPrintDefinition[] {
  return loadCards();
}

export function getCardPrintById(
  cardPrintId: number | string
): CardPrintDefinition | undefined {
  loadCards();
  return cachedByPrintId?.get(formatCardPrintId(cardPrintId));
}

export function getCardPrintsForCharacter(
  characterId: string | number
): CardPrintDefinition[] {
  return loadCards().filter((card) =>
    characterIdsMatch(card.character, characterId)
  );
}

/** First print entry for a character (lowest product id). */
export function getDefaultCardPrintForCharacter(
  characterId: string | number
): CardPrintDefinition | undefined {
  const matches = getCardPrintsForCharacter(characterId);
  return matches[0];
}

export function storageKeyForCardPrint(cardPrintId: number | string): string {
  return `print:${formatCardPrintId(cardPrintId)}`;
}
