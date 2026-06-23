/**
 * Trash-Man reference @ 300×420 editor canvas with default design
 * (OG zoom 100%, meta/description/stats fonts 80%, default padding).
 * Tier line Y measured from card top; scales with card height.
 */
export const BACK_STATS_ANCHOR_TOP_AT_420 = 296;
export const BACK_STATS_ANCHOR_REFERENCE_HEIGHT = 420;

export function backStatsAnchorTopCssVar(
  heightVar = "var(--card-h, 420px)",
  offsetY = 0
): string {
  const offset =
    typeof offsetY === "number" && Number.isFinite(offsetY) ? offsetY : 0;
  const offsetTerm = offset === 0 ? "0px" : `${offset}px`;
  return `calc(${heightVar} * ${BACK_STATS_ANCHOR_TOP_AT_420} / ${BACK_STATS_ANCHOR_REFERENCE_HEIGHT} + ${offsetTerm})`;
}
