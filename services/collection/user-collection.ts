import { normalizeCharacterId } from "@/lib/character-id";
import { BINDER_SLOTS_PER_PAGE } from "@/constants/series";
import { getCharacterById } from "@/lib/cards-loader";
import { getBinderCatalog } from "@/lib/binder-catalog";
import {
  characterHasFinishedCardArt,
  getDisplayableCharacters,
} from "@/lib/displayable-cards";
import { getDefaultCardPrintForCharacter } from "@/lib/card-editor-designs-loader";
import { cardPrintPngPublicUrl } from "@/lib/card-export-filenames";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/services/auth/ensure-user";
import { generateCardById } from "@/services/pipeline";
import type { BinderPage, BinderSlot, UserCollection } from "@/types/collection";
import type { GeneratedCard } from "@/types/card";

export async function getOwnedCharacterIds(userId: string): Promise<Set<string>> {
  await ensureUserExists(userId);

  const rows = await prisma.userCard.findMany({
    where: { userId },
    select: { cardId: true },
  });

  return new Set(rows.map((row) => normalizeCharacterId(row.cardId)));
}

export async function syncCatalogToDatabase(): Promise<void> {
  const characters = getDisplayableCharacters();
  await prisma.$transaction(
    characters.map((character) => {
      const print = getDefaultCardPrintForCharacter(character.id);
      const frontImagePath = print
        ? cardPrintPngPublicUrl(print.id, "front")
        : null;
      const backImagePath = print
        ? cardPrintPngPublicUrl(print.id, "back")
        : null;

      return prisma.card.upsert({
        where: { id: character.id },
        create: {
          id: character.id,
          name: character.name,
          alignment: character.alignment,
          tier: character.tier,
          homeRegion: character.home_region,
          frontImagePath,
          backImagePath,
        },
        update: {
          name: character.name,
          alignment: character.alignment,
          tier: character.tier,
          homeRegion: character.home_region,
          frontImagePath,
          backImagePath,
        },
      });
    })
  );
}

export async function addCardsToCollection(
  userId: string,
  cardIds: string[]
): Promise<void> {
  await ensureUserExists(userId);

  const counts = new Map<string, number>();
  for (const cardId of cardIds) {
    const id = normalizeCharacterId(cardId);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  await syncCatalogToDatabase();

  await prisma.$transaction(
    Array.from(counts.entries()).map(([cardId, delta]) =>
      prisma.userCard.upsert({
        where: { userId_cardId: { userId, cardId } },
        create: { userId, cardId, quantity: delta },
        update: { quantity: { increment: delta } },
      })
    )
  );
}

export async function recordPackOpened(
  userId: string,
  cardIds: string[],
  seriesId: string
): Promise<string> {
  const pack = await prisma.packOpened.create({
    data: {
      userId,
      cardIds: JSON.stringify(cardIds),
      seriesId,
    },
  });
  return pack.id;
}

export async function getUserCollection(userId: string): Promise<UserCollection> {
  await ensureUserExists(userId);

  const rows = await prisma.userCard.findMany({
    where: { userId },
    include: { card: true },
  });

  const cards = rows
    .filter((row) => characterHasFinishedCardArt(row.cardId))
    .map((row) => {
      const generated = generateCardById(row.cardId);
      return {
        cardId: row.cardId,
        quantity: row.quantity,
        card: generated ?? undefined,
      };
    });

  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);

  return {
    userId,
    cards,
    totalUnique: cards.length,
    totalCards,
  };
}

export function buildBinderPages(
  ownedByCardId: Map<string, number>,
  cardsPerPage: number = BINDER_SLOTS_PER_PAGE
): BinderPage[] {
  const catalog = getBinderCatalog();
  const slots: BinderSlot[] = catalog.map(({ printId, characterId, isCollectible }) => {
    const quantity = isCollectible ? (ownedByCardId.get(characterId) ?? 0) : 0;
    const owned = isCollectible && quantity > 0;
    const card = owned ? generateCardById(characterId) ?? undefined : undefined;
    return {
      printId,
      cardId: characterId,
      isCollectible,
      owned,
      quantity: owned ? quantity : 0,
      card,
    };
  });

  const pages: BinderPage[] = [];
  for (let i = 0; i < slots.length; i += cardsPerPage) {
    pages.push({
      pageIndex: pages.length,
      slots: slots.slice(i, i + cardsPerPage),
    });
  }
  return pages;
}

export async function getBinderPagesForUser(userId: string): Promise<BinderPage[]> {
  const collection = await getUserCollection(userId);
  const owned = new Map(collection.cards.map((c) => [c.cardId, c.quantity]));
  return buildBinderPages(owned);
}

export function enrichPackCards(cardIds: string[]): GeneratedCard[] {
  return cardIds
    .filter((id) => characterHasFinishedCardArt(id))
    .map((id) => generateCardById(id))
    .filter((c): c is GeneratedCard => Boolean(c));
}

export function getCharacterName(cardId: string): string {
  return getCharacterById(cardId)?.name ?? cardId;
}
