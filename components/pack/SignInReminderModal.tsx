"use client";

import { SignInModal } from "@/components/auth/SignInModal";

interface SignInReminderModalProps {
  onDismiss: () => void;
}

export function SignInReminderModal({ onDismiss }: SignInReminderModalProps) {
  return (
    <SignInModal
      open
      onClose={onDismiss}
      title="Save your collection"
      dismissLabel="No Thanks"
    >
      <p>
        Sign in to keep the cards you open. Without an account, packs are fun to
        flip through but won&apos;t be saved to your binder.
      </p>
    </SignInModal>
  );
}
