"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SignInModal } from "./SignInModal";

export function SignInButtons() {
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setSignInOpen(false);
    }
  }, [isAuthenticated]);

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
    <>
      <div className="auth-bar">
        <button
          type="button"
          className="auth-btn"
          aria-haspopup="dialog"
          aria-expanded={signInOpen}
          onClick={() => setSignInOpen(true)}
        >
          Sign In
        </button>
      </div>
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
