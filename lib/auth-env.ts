/** Dev-only secret when NEXTAUTH_SECRET is not set (never used in production). */
const DEV_NEXTAUTH_SECRET = "coplanar-local-dev-nextauth-secret";

const LOCAL_AUTH_URL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i;

function trimUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/\/$/, "");
}

function isLocalAuthUrl(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return LOCAL_AUTH_URL.test(value);
}

/** Netlify sets URL to the site’s canonical production address. */
function netlifySiteUrl(): string | undefined {
  return trimUrl(process.env.URL ?? process.env.DEPLOY_PRIME_URL);
}

/**
 * Ensures NextAuth uses the live site URL in production when NEXTAUTH_URL
 * is missing or still points at localhost (common Netlify misconfiguration).
 */
export function ensureProductionAuthEnv(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const configured = trimUrl(process.env.NEXTAUTH_URL);
  const siteUrl = netlifySiteUrl();

  if (siteUrl && (!configured || isLocalAuthUrl(configured))) {
    process.env.NEXTAUTH_URL = siteUrl;
  }
}

export function resolveAuthUrl(): string | undefined {
  ensureProductionAuthEnv();
  return trimUrl(process.env.NEXTAUTH_URL);
}

export function resolveAuthSecret(): string | undefined {
  const configured = process.env.NEXTAUTH_SECRET?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  return DEV_NEXTAUTH_SECRET;
}
