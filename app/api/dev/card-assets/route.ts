import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  cardAssetRelativePath,
  cardPrintPngFilename,
  isSafeCardPngFilename,
} from "@/lib/card-export-filenames";
import { formatCardPrintId } from "@/lib/format-card-series-footer";
import { clearDisplayableCardsCache } from "@/lib/displayable-cards";
import { isDevToolsEnabled } from "@/lib/dev-only";
const root = process.cwd();

function cardAssetDirs(): { sourceDir: string; publicDir: string } {
  return {
    sourceDir: path.join(root, "assets", "cards"),
    publicDir: path.join(root, "public", "assets", "cards"),
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const printId = new URL(request.url).searchParams.get("printId")?.trim();
  if (!printId) {
    return NextResponse.json({ error: "printId is required" }, { status: 400 });
  }

  const formattedPrintId = formatCardPrintId(printId);
  const frontFilename = cardPrintPngFilename(formattedPrintId, "front");
  const backFilename = cardPrintPngFilename(formattedPrintId, "back");

  const { sourceDir } = cardAssetDirs();
  const [front, back] = await Promise.all([
    fileExists(path.join(sourceDir, frontFilename)),
    fileExists(path.join(sourceDir, backFilename)),
  ]);

  return NextResponse.json({
    printId: formattedPrintId,
    front,
    back,
    frontFilename,
    backFilename,
  });
}

export async function POST(request: Request) {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { filename?: string; dataUrl?: string };
  try {
    body = (await request.json()) as { filename?: string; dataUrl?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const filename = body.filename?.trim();
  const dataUrl = body.dataUrl?.trim();

  if (!filename || !isSafeCardPngFilename(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  if (!dataUrl?.startsWith("data:image/png;base64,")) {
    return NextResponse.json({ error: "Expected PNG data URL" }, { status: 400 });
  }

  const base64 = dataUrl.slice("data:image/png;base64,".length);
  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    return NextResponse.json({ error: "Invalid PNG data" }, { status: 400 });
  }

  if (buffer.length === 0) {
    return NextResponse.json({ error: "Empty PNG data" }, { status: 400 });
  }

  const { sourceDir, publicDir } = cardAssetDirs();
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(publicDir, { recursive: true });

  const sourcePath = path.join(sourceDir, filename);
  const publicPath = path.join(publicDir, filename);

  await fs.writeFile(sourcePath, buffer);
  await fs.writeFile(publicPath, buffer);
  clearDisplayableCardsCache();

  return NextResponse.json({
    ok: true,
    filename,
    relativePath: cardAssetRelativePath(filename),
    publicUrl: `/assets/cards/${filename}`,
  });
}
