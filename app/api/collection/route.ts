import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/services/auth/config";
import { getUserCollection } from "@/services/collection/user-collection";
import { generateCardById } from "@/services/pipeline";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collection = await getUserCollection(session.user.id);

  const cards = collection.cards.map((entry) => ({
    ...entry,
    card: generateCardById(entry.cardId) ?? undefined,
  }));

  return NextResponse.json({ ...collection, cards });
}
