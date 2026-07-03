import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ensureProductionAuthEnv,
  resolveAuthSecret,
  resolveAuthUrl,
} from "@/lib/auth-env";

describe("ensureProductionAuthEnv", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllEnvs();
  });

  it("replaces localhost NEXTAUTH_URL with Netlify URL in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.URL = "https://coplanar-cards.netlify.app";

    ensureProductionAuthEnv();

    expect(process.env.NEXTAUTH_URL).toBe("https://coplanar-cards.netlify.app");
    expect(resolveAuthUrl()).toBe("https://coplanar-cards.netlify.app");
  });

  it("keeps an explicit production NEXTAUTH_URL", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXTAUTH_URL = "https://cards.example.com";
    process.env.URL = "https://coplanar-cards.netlify.app";

    ensureProductionAuthEnv();

    expect(process.env.NEXTAUTH_URL).toBe("https://cards.example.com");
  });

  it("does not override localhost NEXTAUTH_URL in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.URL = "https://coplanar-cards.netlify.app";

    ensureProductionAuthEnv();

    expect(process.env.NEXTAUTH_URL).toBe("http://localhost:3000");
  });
});

describe("resolveAuthSecret", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns undefined in production when unset", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.NEXTAUTH_SECRET;
    expect(resolveAuthSecret()).toBeUndefined();
  });
});
