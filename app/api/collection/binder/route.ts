import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getDisplayableCharacterCount } from "@/lib/displayable-cards";
import { authOptions } from "@/services/auth/config";
import { getBinderPagesForUser } from "@/services/collection/user-collection";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await getBinderPagesForUser(session.user.id);
  const owned = pages.reduce(
    (sum, page) => sum + page.slots.filter((s) => s.owned).length,
    0
  );
  const total = getDisplayableCharacterCount();

  return NextResponse.json({ pages, owned, total });
}
