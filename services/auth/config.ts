import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import { isDevAuthBypassEnabled } from "./dev-bypass";
import { buildAuthProviders } from "./providers";
import { ensureUserExists } from "./ensure-user";

const providers = buildAuthProviders();

/** Credentials-only sign-in requires JWT sessions (NextAuth limitation). */
const useJwtSessions = isDevAuthBypassEnabled();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: useJwtSessions ? undefined : PrismaAdapter(prisma),
  providers,
  session: {
    strategy: useJwtSessions ? "jwt" : "database",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user }) {
      if (user?.id) {
        await ensureUserExists(user.id, {
          email: user.email,
          name: user.name,
        });
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token, user }) {
      if (session.user) {
        session.user.id = user?.id ?? token?.sub ?? "";
      }
      return session;
    },
  },
};
