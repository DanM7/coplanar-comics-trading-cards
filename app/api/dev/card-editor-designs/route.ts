import { NextResponse } from "next/server";
import { getFreshCardPrintDefinitions } from "@/lib/character-data-fresh.server";
import { isDevToolsEnabled } from "@/lib/dev-only";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    { cards: getFreshCardPrintDefinitions() },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
