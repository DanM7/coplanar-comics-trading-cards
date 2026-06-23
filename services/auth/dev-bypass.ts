/** Dev credentials sign-in — not enabled on live production deploys. */
export function isDevAuthBypassEnabled(): boolean {
  if (process.env.DEV_AUTH_BYPASS !== "true") return false;
  // Block on Vercel production; allow local dev and `next build` with .env set.
  if (process.env.VERCEL_ENV === "production") return false;
  return true;
}
