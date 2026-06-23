/** Read `?id=` from the editor page URL (card print id). */
export function readEditorCardPrintIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("id");
  return raw?.trim() || null;
}

/** Keep the editor URL in sync so refresh restores the current card print. */
export function writeEditorCardPrintIdToUrl(cardPrintId: string | null): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (cardPrintId) {
    url.searchParams.set("id", cardPrintId);
  } else {
    url.searchParams.delete("id");
  }

  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) {
    window.history.replaceState(null, "", next);
  }
}
