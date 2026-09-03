"use client";

import { useEffect, type ReactNode } from "react";
import { SignInOptions } from "./SignInOptions";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  dismissLabel?: string;
}

export function SignInModal({
  open,
  onClose,
  title = "Sign in",
  children,
  dismissLabel = "Cancel",
}: SignInModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="auth-modal-overlay"
      role="dialog"
      aria-modal
      aria-labelledby="auth-modal-title"
      onClick={onClose}
    >
      <div className="auth-modal-content" onClick={(event) => event.stopPropagation()}>
        <h2 id="auth-modal-title" className="auth-modal-title">
          {title}
        </h2>
        {children ? <div className="auth-modal-body">{children}</div> : null}
        <SignInOptions className="auth-modal-actions" />
        <button
          type="button"
          className="auth-btn auth-btn--ghost auth-modal-close"
          onClick={onClose}
        >
          {dismissLabel}
        </button>
      </div>
    </div>
  );
}
