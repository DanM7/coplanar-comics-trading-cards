import fs from "fs/promises";
import { NextResponse } from "next/server";
import { portraitUrlForCharacter } from "@/lib/character-portrait-url";
import { getRawAssetMime, getRawAssetPath } from "@/lib/raw-assets";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const { characterId } = await params;
  const devUrl = portraitUrlForCharacter(characterId);
  if (!devUrl) {
    return NextResponse.json({ error: "Portrait not found" }, { status: 404 });
  }

  const filename = decodeURIComponent(
    devUrl.replace(/^.*\/raw-front-assets\//, "")
  );
  const filePath = getRawAssetPath("front", filename);
  if (!filePath) {
    return NextResponse.json({ error: "Invalid portrait" }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": getRawAssetMime(filename),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Portrait not found" }, { status: 404 });
  }
}
