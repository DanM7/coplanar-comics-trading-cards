import type { Alignment } from "@/types/character";

/** Matches editor/binder card border presets (hero-azure, boss-crimson, classic-gold). */
const ALIGNMENT_BORDER_COLORS: Record<Alignment, string> = {
  Good: "#7dd3fc",
  Evil: "#8b0000",
  Neutral: "#f07830",
  Team: "#f07830",
};

export function alignmentBorderColor(alignment: Alignment): string {
  return ALIGNMENT_BORDER_COLORS[alignment] ?? ALIGNMENT_BORDER_COLORS.Neutral;
}
