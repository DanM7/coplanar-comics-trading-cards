import { toPng } from "html-to-image";

/** Editor preview canvas size (matches `.cardCanvas` in editor.module.css). */
export const CARD_EDITOR_WIDTH = 300;
export const CARD_EDITOR_HEIGHT = 420;

export const PNG_EXPORT_SCALE_MIN = 1;
export const PNG_EXPORT_SCALE_MAX = 10;
export const PNG_EXPORT_SCALE_DEFAULT = 4;

function triggerBrowserDownload(dataUrl: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

/**
 * Rasterize a card canvas element to PNG at the given scale (1× = 300×420).
 */
export async function exportCardElementToPng(
  element: HTMLElement,
  scale: number
): Promise<string> {
  const pixelRatio = Math.min(
    PNG_EXPORT_SCALE_MAX,
    Math.max(PNG_EXPORT_SCALE_MIN, Math.round(scale))
  );

  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  return toPng(element, {
    width: CARD_EDITOR_WIDTH,
    height: CARD_EDITOR_HEIGHT,
    pixelRatio,
    cacheBust: true,
    skipAutoScale: true,
  });
}

export async function downloadCardElementPng(
  element: HTMLElement,
  filename: string,
  scale: number
): Promise<void> {
  try {
    const dataUrl = await exportCardElementToPng(element, scale);
    triggerBrowserDownload(dataUrl, filename);
  } catch (error) {
    console.error("Card PNG export failed:", error);
    throw new Error(
      "Could not export PNG. Try refreshing the page so images reload, then export again."
    );
  }
}

export interface SaveCardPngResult {
  filename: string;
  relativePath: string;
  publicUrl: string;
}

/** Writes finished card art to assets/cards/ (and public mirror). */
export async function saveCardElementPng(
  element: HTMLElement,
  filename: string,
  scale: number
): Promise<SaveCardPngResult> {
  const dataUrl = await exportCardElementToPng(element, scale);

  const response = await fetch("/api/dev/card-assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, dataUrl }),
  });

  if (!response.ok) {
    let message = "Could not save PNG to assets/cards/.";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) message = payload.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return (await response.json()) as SaveCardPngResult;
}
