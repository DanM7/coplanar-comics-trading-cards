import { NextResponse } from "next/server";
import { getFreshCharacters } from "@/lib/character-data-fresh.server";
import { isDevToolsEnabled } from "@/lib/dev-only";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    return NextResponse.json(
      { descriptions: getFreshCharacters() },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("character-descriptions API failed:", error);
    return NextResponse.json(
      { error: "Failed to load character_descriptions.json" },
      { status: 500 }
    );
  }
}
