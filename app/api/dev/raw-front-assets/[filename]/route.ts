import fs from "fs/promises";
import { NextResponse } from "next/server";
import { isDevToolsEnabled } from "@/lib/dev-only";
import { getRawAssetMime, getRawAssetPath } from "@/lib/raw-assets";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { filename: encoded } = await params;
  const filename = decodeURIComponent(encoded);
  const filePath = getRawAssetPath("front", filename);

  if (!filePath) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": getRawAssetMime(filename),
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
