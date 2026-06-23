"use client";

import { useAuth } from "@/hooks/useAuth";

export function SignInButtons() {
  const {
    isAuthenticated,
    isLoading,
    user,
    signInWithGoogle,
    signInWithApple,
    signInWithFacebook,
    signInDev,
    signOut,
  } = useAuth();

  const devBypassEnabled =
    process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";

  if (isLoading) {
    return <p className="auth-status">Loading session…</p>;
  }

  if (isAuthenticated && user) {
    return (
      <div className="auth-bar">
        <span className="auth-user">
          {user.name ?? user.email ?? "Collector"}
        </span>
        <button type="button" className="auth-btn auth-btn--ghost" onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="auth-bar">
      <button type="button" className="auth-btn" onClick={signInWithGoogle}>
        Google
      </button>
      <button type="button" className="auth-btn" onClick={signInWithApple}>
        Apple
      </button>
      <button type="button" className="auth-btn" onClick={signInWithFacebook}>
        Facebook
      </button>
      {devBypassEnabled && (
        <button type="button" className="auth-btn auth-btn--ghost" onClick={signInDev}>
          Dev Sign In
        </button>
      )}
    </div>
  );
}
