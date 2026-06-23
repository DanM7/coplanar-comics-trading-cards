import fs from "fs/promises";
import path from "path";
import {
  isRawImageFilename,
  parseRawAssetFilename,
  type RawAssetVariant,
} from "@/lib/raw-asset-names";

export type { RawAssetVariant } from "@/lib/raw-asset-names";
export {
  buildRawAssetApiUrl,
  characterNameToFileSlug,
  expectedRawBackBasename,
  findRawBackFilenameForCharacter,
  parseRawAssetFilename,
  parseRawBackFilename,
  parseRawFilename,
  parseRawFrontFilename,
} from "@/lib/raw-asset-names";

const RAW_DIRS: Record<RawAssetVariant, string> = {
  front: path.join(process.cwd(), "assets", "raw_front"),
  back: path.join(process.cwd(), "assets", "raw_back"),
};

export async function listRawAssetFilenames(
  variant: RawAssetVariant
): Promise<string[]> {
  const dir = RAW_DIRS[variant];
  try {
    const entries = await fs.readdir(dir);
    return entries
      .filter((name) => isRawImageFilename(name))
      .sort((a, b) => {
        const ka = parseRawAssetFilename(variant, a).sortKey;
        const kb = parseRawAssetFilename(variant, b).sortKey;
        return ka.localeCompare(kb) || a.localeCompare(b);
      });
  } catch {
    return [];
  }
}

export function getRawAssetPath(
  variant: RawAssetVariant,
  filename: string
): string | null {
  const safe = path.basename(filename);
  if (safe !== filename || !isRawImageFilename(safe)) {
    return null;
  }
  return path.join(RAW_DIRS[variant], safe);
}

export function getRawAssetMime(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return map[ext] ?? "application/octet-stream";
}
