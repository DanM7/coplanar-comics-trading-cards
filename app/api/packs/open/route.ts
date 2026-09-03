import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { DEFAULT_SERIES_ID } from "@/constants/series";
import { buildPreparedPackPayload } from "@/lib/pack-open-payload";
import { authOptions } from "@/services/auth/config";
import {
  addCardsToCollection,
  getOwnedCharacterIds,
  recordPackOpened,
} from "@/services/collection/user-collection";
import type { PackOpenResult } from "@/types/collection";

interface OpenPackRequestBody {
  preparedPack?: PackOpenResult;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  let body: OpenPackRequestBody | null = null;
  try {
    body = (await request.json()) as OpenPackRequestBody;
  } catch {
    body = null;
  }

  try {
    if (body?.preparedPack?.cards?.length) {
      const prepared = body.preparedPack;
      let packId: string | undefined;

      if (userId) {
        await addCardsToCollection(userId, prepared.cardIds);
        packId = await recordPackOpened(
          userId,
          prepared.cardIds,
          DEFAULT_SERIES_ID
        );
      }

      return NextResponse.json({
        ...prepared,
        packId,
        savedToCollection: Boolean(userId),
      });
    }

    const ownedCharacterIds = userId
      ? await getOwnedCharacterIds(userId)
      : new Set<string>();

    const payload = buildPreparedPackPayload(
      ownedCharacterIds,
      userId ? "collector" : "guest"
    );

    if (payload.cards.length === 0) {
      return NextResponse.json(
        { error: "No cards with finished art are available yet." },
        { status: 503 }
      );
    }

    let packId: string | undefined;
    if (userId) {
      await addCardsToCollection(userId, payload.cardIds);
      packId = await recordPackOpened(userId, payload.cardIds, DEFAULT_SERIES_ID);
    }

    return NextResponse.json({
      ...payload,
      packId,
      savedToCollection: Boolean(userId),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to open pack";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
