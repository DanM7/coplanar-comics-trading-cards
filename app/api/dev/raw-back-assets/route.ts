import { NextResponse } from "next/server";
import { isDevToolsEnabled } from "@/lib/dev-only";
import {
  buildRawAssetApiUrl,
  listRawAssetFilenames,
  parseRawBackFilename,
} from "@/lib/raw-assets";

export async function GET() {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filenames = await listRawAssetFilenames("back");
  const assets = filenames.map((filename) => {
    const { sortKey, displayName } = parseRawBackFilename(filename);
    return {
      filename,
      url: buildRawAssetApiUrl("back", filename),
      sortKey,
      displayName,
    };
  });

  return NextResponse.json({ assets });
}
