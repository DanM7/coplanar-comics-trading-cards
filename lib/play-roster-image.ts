import type { PlayRosterEntry } from "@/types/game";

/** Best available front art for play roster cards (finished PNG, else raw portrait). */
export function playRosterCardFrontUrl(
  entry: Pick<PlayRosterEntry, "frontImageUrl" | "portraitUrl">
): string | undefined {
  return entry.frontImageUrl ?? entry.portraitUrl;
}
