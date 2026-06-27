import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/services/auth/config";
import { attachRosterFrontImages } from "@/services/game/roster-images";
import { buildPlayRoster } from "@/services/game/roster";
import { getUserCollection } from "@/services/collection/user-collection";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const collection = await getUserCollection(session.user.id);
    const owned = new Map<string, number>();
    for (const entry of collection.cards) {
      owned.set(entry.cardId, entry.quantity);
    }

    const roster = attachRosterFrontImages(buildPlayRoster(owned));

    return NextResponse.json({
      mode: "collection" as const,
      roster,
      totalOwned: collection.totalUnique,
    });
  }

  const roster = attachRosterFrontImages(buildPlayRoster());

  return NextResponse.json({
    mode: "guest" as const,
    roster,
    totalOwned: 0,
  });
}
