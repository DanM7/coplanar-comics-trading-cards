/**
 * Re-export front/back PNGs for all card prints with status "done".
 * Requires the Next.js dev server to be running.
 *
 * Usage: npm run dev   (in another terminal)
 *        npm run cards:export-done
 */

const BASE_URL = process.env.CARD_EXPORT_BASE_URL ?? "http://localhost:3001";
const QUERY = process.env.CARD_EXPORT_QUERY ?? "status=done";
const TIMEOUT_MS = 15 * 60 * 1000;

async function waitForServer(url) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${url}/api/dev/batch-export?${QUERY}`);
      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(
    `Dev server not reachable at ${url}. Start it with npm run dev first.`
  );
}

async function main() {
  await waitForServer(BASE_URL);

  let playwright;
  try {
    playwright = await import("playwright");
  } catch {
    console.error(
      "Playwright is required. Install it with: npm install -D playwright"
    );
    process.exit(1);
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Opening ${BASE_URL}/editor/batch-export?autostart=1&${QUERY}`);

  await page.goto(`${BASE_URL}/editor/batch-export?autostart=1&${QUERY}`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });

  await page.waitForSelector('[data-batch-complete="true"]', {
    timeout: TIMEOUT_MS,
  });

  const summary = await page.locator('[data-batch-complete="true"]').textContent();
  console.log(summary?.trim() ?? "Batch export finished.");

  const failures = await page.locator('[data-batch-status="true"]').allTextContents();
  const lastStatus = failures.at(-1);
  if (lastStatus) {
    console.log(lastStatus.trim());
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
