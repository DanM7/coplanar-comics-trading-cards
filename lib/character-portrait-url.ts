import fs from "fs";
import path from "path";
import { getDefaultCardPrintForCharacter } from "@/lib/card-editor-designs-loader";
import { resolveCardPrintFrontFilename } from "@/lib/card-print-assets";
import {
  buildRawAssetApiUrl,
  isRawImageFilename,
  parseRawFrontFilename,
} from "@/lib/raw-asset-names";

let frontAssetIndex: { filename: string; sortKey: string }[] | null = null;

function loadFrontAssetIndex(): { filename: string; sortKey: string }[] {
  if (frontAssetIndex) {
    return frontAssetIndex;
  }

  const dir = path.join(process.cwd(), "assets", "raw_front");
  try {
    frontAssetIndex = fs
      .readdirSync(dir)
      .filter((name) => isRawImageFilename(name))
      .map((filename) => ({
        filename,
        sortKey: parseRawFrontFilename(filename).sortKey,
      }));
  } catch {
    frontAssetIndex = [];
  }

  return frontAssetIndex;
}

/** Raw front portrait URL for CSS-composed cards (dev asset API). */
export function portraitUrlForCharacter(characterId: string): string | null {
  const print = getDefaultCardPrintForCharacter(characterId);
  const filename = resolveCardPrintFrontFilename(
    print ?? { frontImage: undefined },
    characterId,
    loadFrontAssetIndex()
  );

  if (!filename) {
    return null;
  }

  return buildRawAssetApiUrl("front", filename);
}
