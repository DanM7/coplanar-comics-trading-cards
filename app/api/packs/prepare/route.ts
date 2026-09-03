import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { buildPreparedPackPayload } from "@/lib/pack-open-payload";
import { authOptions } from "@/services/auth/config";
import { getOwnedCharacterIds } from "@/services/collection/user-collection";

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
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

    return NextResponse.json({
      ...payload,
      savedToCollection: false,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to prepare pack";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
