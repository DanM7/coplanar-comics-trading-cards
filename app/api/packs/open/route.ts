import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { DEFAULT_SERIES_ID } from "@/constants/series";
import { authOptions } from "@/services/auth/config";
import { openPack } from "@/services/collection/pack-opener";
import {
  addCardsToCollection,
  getOwnedCharacterIds,
  recordPackOpened,
} from "@/services/collection/user-collection";

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
    const ownedCharacterIds = userId
      ? await getOwnedCharacterIds(userId)
      : new Set<string>();

    const { cardIds, cards } = openPack(ownedCharacterIds);
    if (cards.length === 0) {
      return NextResponse.json(
        { error: "No cards with finished art are available yet." },
        { status: 503 }
      );
    }

    let packId: string | undefined;
    if (userId) {
      await addCardsToCollection(userId, cardIds);
      packId = await recordPackOpened(userId, cardIds, DEFAULT_SERIES_ID);
    }

    return NextResponse.json({
      packId,
      cardIds,
      cards,
      openedAt: new Date().toISOString(),
      savedToCollection: Boolean(userId),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to open pack";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
