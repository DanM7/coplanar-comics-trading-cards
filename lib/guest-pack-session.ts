const GUEST_PACK_COUNT_KEY = "coplanar:guest-packs-opened";
const SIGNIN_REMINDER_DISMISSED_KEY = "coplanar:signin-reminder-dismissed";

function readCount(key: string): number {
  if (typeof window === "undefined") {
    return 0;
  }
  const raw = window.sessionStorage.getItem(key);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function writeCount(key: string, value: number): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(key, String(value));
}

export function getGuestPackOpenCount(): number {
  return readCount(GUEST_PACK_COUNT_KEY);
}

export function incrementGuestPackOpenCount(): number {
  const next = getGuestPackOpenCount() + 1;
  writeCount(GUEST_PACK_COUNT_KEY, next);
  return next;
}

export function isSignInReminderDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.sessionStorage.getItem(SIGNIN_REMINDER_DISMISSED_KEY) === "1";
}

export function dismissSignInReminder(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(SIGNIN_REMINDER_DISMISSED_KEY, "1");
}
