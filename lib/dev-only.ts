/** Returns true when local dev tooling (editor, raw asset APIs) is allowed. */
export function isDevToolsEnabled(): boolean {
  if (process.env.ENABLE_CARD_EDITOR === "true") return true;
  if (process.env.NEXT_PUBLIC_ENABLE_CARD_EDITOR === "true") return true;
  return process.env.NODE_ENV !== "production";
}
