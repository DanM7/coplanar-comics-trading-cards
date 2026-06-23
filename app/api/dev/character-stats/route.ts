import { NextResponse } from "next/server";
import { getFreshCharacterStatRecords } from "@/lib/character-data-fresh.server";
import { isDevToolsEnabled } from "@/lib/dev-only";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    { stats: getFreshCharacterStatRecords() },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
