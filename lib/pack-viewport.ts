/** Minimum viewport width for the wide side-by-side pack layout. */
export const PACK_WIDE_MIN_WIDTH = 900;

/** Minimum viewport height for reveal sidebar (strip | hero | controls). */
export const PACK_REVEAL_SIDEBAR_MIN_HEIGHT = 520;

/** Max viewport height for compact horizontal layout when landscape. */
export const PACK_SHORT_MAX_HEIGHT = 520;

/** Wide viewport — strip, hero card, and controls share one row. */
export const PACK_WIDE_VIEWPORT_MQ = `(min-width: ${PACK_WIDE_MIN_WIDTH}px)`;

/**
 * Tall + wide enough for reveal sidebar: strip grid | hero | controls.
 * Split-screen panes that are wide but short stay stacked (hero first).
 */
export const PACK_REVEAL_SIDEBAR_MQ = `(min-width: ${PACK_WIDE_MIN_WIDTH}px) and (min-height: ${PACK_REVEAL_SIDEBAR_MIN_HEIGHT}px)`;

/**
 * Short or narrow landscape viewports: horizontal layout with tighter spacing
 * (not "mobile"; purely dimension-based).
 */
export const PACK_COMPACT_HORIZONTAL_MQ =
  `(orientation: landscape) and (max-height: ${PACK_SHORT_MAX_HEIGHT}px), (max-width: ${PACK_WIDE_MIN_WIDTH - 1}px) and (orientation: landscape)`;

/** 3×4 thumb grid only in the reveal sidebar; otherwise one scroll row. */
export const PACK_STRIP_GRID_MQ = PACK_REVEAL_SIDEBAR_MQ;

/** Narrow portrait-like viewports: hero stacked above strip and controls. */
export const PACK_STACKED_MQ = `(max-width: ${PACK_WIDE_MIN_WIDTH - 1}px) and (orientation: portrait)`;
