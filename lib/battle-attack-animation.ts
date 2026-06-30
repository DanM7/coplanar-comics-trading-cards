import type { CombatLogEntry } from "@/types/game";

/** Most recent combat log row that carries attack animation (not always the last row). */
export function findLatestAnimatedLogEntry(
  log: CombatLogEntry[]
): CombatLogEntry | null {
  for (let index = log.length - 1; index >= 0; index -= 1) {
    const entry = log[index];
    if (entry.animation && entry.animation.effects.length > 0) {
      return entry;
    }
  }
  return null;
}
