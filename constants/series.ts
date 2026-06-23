import { SERIES_TITLE } from "./project";

export const DEFAULT_SERIES_ID = "coplanar-comics-series-1";

export const SERIES_TITLES: Record<string, string> = {
  "coplanar-comics-series-1": SERIES_TITLE,
};

export const CARDS_PER_PACK = 10;

export const BINDER_SLOTS_PER_PAGE = 9;

/** Print numbers 001–N shown in the binder (9 per page). */
export const BINDER_TOTAL_PRINT_SLOTS = 27;
