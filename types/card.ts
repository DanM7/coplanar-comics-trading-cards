import type { EditorCardMeta } from "@/components/editor/EditableCardFace";
import type { CardDesignConfig } from "./card-design";
import type { Alignment, HomeRegion } from "./character";
import type { MoveDisplay } from "./character-moves";

export type { MoveDisplay };

export interface CardStats {
  strength: number | null;
  speed: number | null;
  intelligence: number | null;
  durability: number | null;
  energy_projection: number | null;
  skill: number | null;
}

export const EMPTY_CARD_STATS: CardStats = {
  strength: null,
  speed: null,
  intelligence: null,
  durability: null,
  energy_projection: null,
  skill: null,
};

export interface GeneratedCardFront {
  portraitUrl: string;
  name: string;
  alignment: Alignment;
  tier: number;
  realm: HomeRegion;
  frameId: string;
  seriesId: string;
}

export interface GeneratedCardBack {
  cardNumber: string;
  description: string;
  /** `#004 • Alignment: Good` */
  idAlignmentLine: string;
  /** `Home: Human Plane › …` from character descriptions */
  homeLine: string;
  /** `Type: Creature • Species: …` from character descriptions */
  typeIdentityLine: string;
  /** `Affiliation: Realspace Reapers` when present on the character */
  affiliationLine?: string | null;
  tier: number;
  stats: CardStats;
  moves?: MoveDisplay[];
  /** Full footer line, e.g. `● 001 – Coplanar Comics Trading Cards – Series 1`. */
  seriesFooterLine: string;
  /** @deprecated Use seriesFooterLine */
  seriesTitle?: string;
  flavorText?: string;
}

/** Editor-accurate card face data for live CSS rendering in pack/binder. */
export interface CardDisplay {
  frontPortraitUrl: string;
  backPortraitUrl: string;
  design: CardDesignConfig;
  meta: EditorCardMeta;
}

export interface GeneratedCard {
  characterId: string;
  seriesId: string;
  /** Card print id when a print entry exists (e.g. `010`). */
  printId?: string;
  /** Full baked front PNG from assets/cards when exported. */
  finishedFrontUrl?: string;
  /** Full baked back PNG from assets/cards when exported. */
  finishedBackUrl?: string;
  /** Live compose data when a finished print is available. */
  display?: CardDisplay;
  front: GeneratedCardFront;
  back: GeneratedCardBack;
}
