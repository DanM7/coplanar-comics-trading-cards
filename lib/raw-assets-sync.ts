import fs from "fs";
import path from "path";
import {
  isRawImageFilename,
  parseRawAssetFilename,
  type RawAssetVariant,
} from "@/lib/raw-asset-names";

const RAW_DIRS: Record<RawAssetVariant, string> = {
  front: path.join(process.cwd(), "assets", "raw_front"),
  back: path.join(process.cwd(), "assets", "raw_back"),
};

const cache: Partial<Record<RawAssetVariant, string[]>> = {};

/** Sync raw asset listing for server-side card display resolution. */
export function listRawAssetFilenamesSync(
  variant: RawAssetVariant
): string[] {
  const cached = cache[variant];
  if (cached) {
    return cached;
  }

  const dir = RAW_DIRS[variant];
  try {
    const entries = fs.readdirSync(dir);
    const filenames = entries
      .filter((name) => isRawImageFilename(name))
      .sort((a, b) => {
        const ka = parseRawAssetFilename(variant, a).sortKey;
        const kb = parseRawAssetFilename(variant, b).sortKey;
        return ka.localeCompare(kb) || a.localeCompare(b);
      });
    cache[variant] = filenames;
    return filenames;
  } catch {
    cache[variant] = [];
    return [];
  }
}

export function clearRawAssetFilenameCache(): void {
  for (const key of Object.keys(cache) as RawAssetVariant[]) {
    delete cache[key];
  }
}
