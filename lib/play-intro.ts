export const PLAY_INTRO_MESSAGE =
  "Field a team of three and battle the CPU using the Coplanar official stat, synergy, and combat rules.";

const PLAY_INTRO_DISMISSED_KEY = "coplanar:play-intro-dismissed";

export function isPlayIntroDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(PLAY_INTRO_DISMISSED_KEY) === "1";
}

export function dismissPlayIntro(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PLAY_INTRO_DISMISSED_KEY, "1");
}
