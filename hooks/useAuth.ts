"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signInWithGoogle: () => signIn("google"),
    signInWithApple: () => signIn("apple"),
    signInWithFacebook: () => signIn("facebook"),
    signInDev: () => signIn("dev"),
    signOut: () => signOut(),
  };
}
