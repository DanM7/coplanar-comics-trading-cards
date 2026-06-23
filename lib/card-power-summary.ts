import {
  tierFromTotalPower,
} from "@/lib/character-stat-validation";
import { CORE_STAT_KEYS } from "@/types/character-stats";
import type { CardStats } from "@/types/card";
import type { MoveDisplay } from "@/types/character-moves";

export function sumCardStats(stats: CardStats): number | null {
  let sum = 0;
  for (const key of CORE_STAT_KEYS) {
    const value = stats[key];
    if (value === null || value === undefined) {
      return null;
    }
    sum += value;
  }
  return sum;
}

export function sumMovePower(moves?: MoveDisplay[]): number {
  if (!moves?.length) {
    return 0;
  }

  return moves.reduce((sum, move) => {
    if (!move.name.trim()) {
      return sum;
    }

    const value = move.value;
    if (typeof value === "number" && Number.isFinite(value)) {
      return sum + value;
    }

    return sum;
  }, 0);
}

export function formatTierPowerLine(
  stats: CardStats,
  fallbackTier?: number,
  moves?: MoveDisplay[]
): string {
  const statPower = sumCardStats(stats);
  const tier =
    statPower !== null
      ? (tierFromTotalPower(statPower) ?? fallbackTier ?? "—")
      : (fallbackTier ?? "—");
  const statPowerLabel = statPower !== null ? String(statPower) : "—";
  const movePower = sumMovePower(moves);
  return `Tier: ${tier} • Stat Power: ${statPowerLabel} • Move Power: ${movePower}`;
}
