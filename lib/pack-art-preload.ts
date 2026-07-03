import { CARD_PUBLISHER_LOGO_URL } from "@/constants/project";
import {
  CARD_IMAGE_PRELOAD_OPTIONS,
  preloadImageUrls,
  preloadImageUrlsIdle,
  waitForImageUrls,
} from "@/lib/preload-images";
import { OG_FRAME_HEIGHT_WIDTH_RATIO } from "@/lib/back-card-layout";
import { sampleImageBackdropColor } from "@/lib/sample-image-backdrop-color";
import type { GeneratedCard } from "@/types/card";

export { OG_FRAME_HEIGHT_WIDTH_RATIO };

export function collectCardImageUrls(card: GeneratedCard): string[] {
  const urls: string[] = [];

  if (card.display?.frontPortraitUrl) {
    urls.push(card.display.frontPortraitUrl);
  }
  if (card.display?.backPortraitUrl) {
    urls.push(card.display.backPortraitUrl);
  }
  if (card.finishedFrontUrl) {
    urls.push(card.finishedFrontUrl);
  }
  if (card.finishedBackUrl) {
    urls.push(card.finishedBackUrl);
  }

  return urls;
}

export function collectPackImageUrls(cards: GeneratedCard[]): string[] {
  const urls = new Set<string>();

  for (const card of cards) {
    for (const url of collectCardImageUrls(card)) {
      urls.add(url);
    }
  }

  return [...urls];
}

function warmOgBackdropSamples(urls: Iterable<string>): void {
  for (const url of urls) {
    if (url.trim()) {
      void sampleImageBackdropColor(url);
    }
  }
}

/** Eagerly warm one card's art (front, back OG, PNGs). */
export function preloadCardArtEager(card: GeneratedCard): void {
  const urls = collectCardImageUrls(card);
  preloadImageUrls([CARD_PUBLISHER_LOGO_URL, ...urls], CARD_IMAGE_PRELOAD_OPTIONS);
  if (card.display?.backPortraitUrl) {
    warmOgBackdropSamples([card.display.backPortraitUrl]);
  }
}

/** Wait until a card's OG back portrait is decoded (for first flip / view back). */
export function waitForCardBackPortrait(card: GeneratedCard): Promise<void> {
  const url = card.display?.backPortraitUrl?.trim();
  if (!url) {
    return Promise.resolve();
  }

  return waitForImageUrls([url], {
    ...CARD_IMAGE_PRELOAD_OPTIONS,
    fetchPriority: "high",
  });
}

/**
 * Priority indices load immediately; remaining pack art loads in idle batches.
 * Always includes card 0 so the first back flip is ready.
 */
export function preloadPackArt(
  cards: GeneratedCard[],
  priorityIndices: number[] = [0]
): () => void {
  const priorityUrls = new Set<string>([CARD_PUBLISHER_LOGO_URL]);
  const priorityBackPortraits: string[] = [];
  const normalizedPriority = new Set<number>();

  for (const index of [0, ...priorityIndices]) {
    if (index < 0 || index >= cards.length || normalizedPriority.has(index)) {
      continue;
    }
    normalizedPriority.add(index);

    const card = cards[index];
    for (const url of collectCardImageUrls(card)) {
      priorityUrls.add(url);
    }
    if (card.display?.backPortraitUrl) {
      priorityBackPortraits.push(card.display.backPortraitUrl);
    }
  }

  preloadImageUrls(priorityUrls, CARD_IMAGE_PRELOAD_OPTIONS);
  warmOgBackdropSamples(priorityBackPortraits);

  const rest = collectPackImageUrls(cards).filter((url) => !priorityUrls.has(url));
  return preloadImageUrlsIdle(rest);
}

/** Priority pack indices — await back OG portraits before the user flips. */
export function waitForPackBackPortraits(
  cards: GeneratedCard[],
  priorityIndices: number[] = [0]
): Promise<void> {
  const urls = new Set<string>();

  for (const index of [0, ...priorityIndices]) {
    if (index < 0 || index >= cards.length) {
      continue;
    }
    const url = cards[index]?.display?.backPortraitUrl?.trim();
    if (url) {
      urls.add(url);
    }
  }

  return waitForImageUrls(urls, {
    ...CARD_IMAGE_PRELOAD_OPTIONS,
    fetchPriority: "high",
  });
}
