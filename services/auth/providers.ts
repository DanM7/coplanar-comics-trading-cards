import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { isDevAuthBypassEnabled } from "./dev-bypass";

/**
 * OAuth providers for Google, Apple, and Facebook.
 * Credentials are read from environment variables; see .env.example.
 */
export function buildAuthProviders(): NextAuthOptions["providers"] {
  const providers: NonNullable<NextAuthOptions["providers"]> = [];

  if (isDevAuthBypassEnabled()) {
    providers.push(
      CredentialsProvider({
        id: "dev",
        name: "Dev Bypass",
        credentials: {},
        async authorize() {
          return {
            id: "dev-user",
            email: "dev@coplanar.local",
            name: "Dev Collector",
          };
        },
      })
    );
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
    providers.push(
      AppleProvider({
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
      })
    );
  }

  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    providers.push(
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      })
    );
  }

  return providers;
}
