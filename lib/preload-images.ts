const preloadedUrls = new Set<string>();

/** Warm the browser image cache for a URL (safe to call repeatedly). */
export function preloadImageUrl(url: string): void {
  const trimmed = url.trim();
  if (!trimmed || preloadedUrls.has(trimmed)) {
    return;
  }

  preloadedUrls.add(trimmed);
  const img = new Image();
  img.decoding = "async";
  img.src = trimmed;
}

export function preloadImageUrls(urls: Iterable<string>): void {
  for (const url of urls) {
    preloadImageUrl(url);
  }
}

/** Resolve when every URL has loaded (or failed). Safe to call repeatedly. */
export function waitForImageUrls(urls: Iterable<string>): Promise<void> {
  const unique = [...new Set([...urls].map((url) => url.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return Promise.resolve();
  }

  return Promise.all(
    unique.map(
      (url) =>
        new Promise<void>((resolve) => {
          preloadImageUrl(url);
          const img = new Image();
          img.decoding = "async";
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
      preloadImageUrl(urls[index]);
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
