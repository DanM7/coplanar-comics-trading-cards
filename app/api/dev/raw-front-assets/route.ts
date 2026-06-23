import { NextResponse } from "next/server";
import { isDevToolsEnabled } from "@/lib/dev-only";
import {
  buildRawAssetApiUrl,
  listRawAssetFilenames,
  parseRawFrontFilename,
} from "@/lib/raw-assets";

export async function GET() {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filenames = await listRawAssetFilenames("front");
  const assets = filenames.map((filename) => {
    const { sortKey, displayName } = parseRawFrontFilename(filename);
    return {
      filename,
      url: buildRawAssetApiUrl("front", filename),
      sortKey,
      displayName,
    };
  });

  return NextResponse.json({ assets });
}
