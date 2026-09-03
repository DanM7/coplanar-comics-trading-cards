const preloadedUrls = new Set<string>();

export interface PreloadImageOptions {
  crossOrigin?: "" | "anonymous" | "use-credentials";
  fetchPriority?: "high" | "low" | "auto";
}

/** Warm the browser image cache for a URL (safe to call repeatedly). */
export function preloadImageUrl(
  url: string,
  options: PreloadImageOptions = {}
): void {
  const trimmed = url.trim();
  if (!trimmed || preloadedUrls.has(trimmed)) {
    return;
  }

  preloadedUrls.add(trimmed);
  const img = new Image();
  img.decoding = "async";
  if (options.crossOrigin) {
    img.crossOrigin = options.crossOrigin;
  }
  if (options.fetchPriority && "fetchPriority" in img) {
    img.fetchPriority = options.fetchPriority;
  }
  img.src = trimmed;
}

export function preloadImageUrls(
  urls: Iterable<string>,
  options?: PreloadImageOptions
): void {
  for (const url of urls) {
    preloadImageUrl(url, options);
  }
}

/** Match `<img crossOrigin="anonymous">` used on card faces so preloads hit the same cache entry. */
export const CARD_IMAGE_PRELOAD_OPTIONS: PreloadImageOptions = {
  crossOrigin: "anonymous",
};

/** Resolve when every URL has loaded (or failed). Safe to call repeatedly. */
export function waitForImageUrls(
  urls: Iterable<string>,
  options: PreloadImageOptions = CARD_IMAGE_PRELOAD_OPTIONS
): Promise<void> {
  const unique = [...new Set([...urls].map((url) => url.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return Promise.resolve();
  }

  return Promise.all(
    unique.map(
      (url) =>
        new Promise<void>((resolve) => {
          preloadImageUrl(url, options);
          const img = new Image();
          img.decoding = "async";
          if (options.crossOrigin) {
            img.crossOrigin = options.crossOrigin;
          }
          if (options.fetchPriority && "fetchPriority" in img) {
            img.fetchPriority = options.fetchPriority;
          }
          const finish = () => resolve();
          img.onload = finish;
          img.onerror = finish;
          img.src = url;
          if (img.complete) {
            finish();
          }
        })
    )
  ).then(() => undefined);
}

/** Preload URLs in small idle-time batches so the main thread stays responsive. */
export function preloadImageUrlsIdle(
  urls: string[],
  batchSize = 6
): () => void {
  let index = 0;
  let cancelled = false;

  const runBatch = (deadline?: IdleDeadline) => {
    if (cancelled) {
      return;
    }

    const budget = deadline?.timeRemaining() ?? 12;
    let processed = 0;

    while (
      index < urls.length &&
      processed < batchSize &&
      (deadline ? budget > 2 : true)
    ) {
      preloadImageUrl(urls[index], CARD_IMAGE_PRELOAD_OPTIONS);
      index += 1;
      processed += 1;
    }

    if (index < urls.length && !cancelled) {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(runBatch);
      } else {
        setTimeout(() => runBatch(), 32);
      }
    }
  };

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(runBatch);
  } else {
    setTimeout(() => runBatch(), 0);
  }

  return () => {
    cancelled = true;
  };
}
