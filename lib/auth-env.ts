/** Dev-only secret when NEXTAUTH_SECRET is not set (never used in production). */
const DEV_NEXTAUTH_SECRET = "coplanar-local-dev-nextauth-secret";

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
