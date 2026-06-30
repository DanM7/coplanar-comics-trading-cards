/** Dev credentials sign-in — not enabled on live production deploys. */
export function isDevAuthBypassEnabled(): boolean {
  if (process.env.DEV_AUTH_BYPASS === "false") return false;
  if (process.env.DEV_AUTH_BYPASS === "true") return true;
  if (process.env.VERCEL_ENV === "production") return false;
  if (process.env.NODE_ENV === "production") return false;
  // Local `next dev` without a .env file still needs at least one provider.
  return true;
}

/** Client-side check for showing the Dev Sign In button. */
export function isDevAuthBypassVisible(): boolean {
  if (process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true") return true;
  if (process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "false") return false;
  return process.env.NODE_ENV === "development";
}
