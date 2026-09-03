"use client";

import { useAuth } from "@/hooks/useAuth";
import { isDevAuthBypassVisible } from "@/services/auth/dev-bypass";

interface SignInOptionsProps {
  className?: string;
}

/** Sign-in provider buttons only (no session / sign-out UI). */
export function SignInOptions({ className }: SignInOptionsProps) {
  const { signInWithGoogle, signInWithFacebook, signInDev } = useAuth();
  const devBypassEnabled = isDevAuthBypassVisible();

  return (
    <div className={["auth-bar", "auth-bar--stack", className].filter(Boolean).join(" ")}>
      <button type="button" className="auth-btn" onClick={signInWithGoogle}>
        Google
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
