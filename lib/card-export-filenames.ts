import { formatCardPrintId } from "@/lib/format-card-series-footer";

export const CARD_ASSETS_RELATIVE_DIR = "assets/cards";

const SAFE_CARD_PNG_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.png$/;

/** e.g. `010-front.png` for print id 10. */
export function cardPrintPngFilename(
  printId: string | number,
  side: "front" | "back"
): string {
  return `${formatCardPrintId(printId)}-${side}.png`;
}

export function cardAssetRelativePath(filename: string): string {
  return `${CARD_ASSETS_RELATIVE_DIR}/${filename}`;
}

/** Browser URL for a finished card face (served from public/assets/cards/). */
export function cardPrintPngPublicUrl(
  printId: string | number,
  side: "front" | "back"
): string {
  return `/assets/cards/${cardPrintPngFilename(printId, side)}`;
}

export function isSafeCardPngFilename(filename: string): boolean {
  return SAFE_CARD_PNG_FILENAME.test(filename) && !filename.includes("..");
}
