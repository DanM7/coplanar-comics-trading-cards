export type CardSide = "front" | "back";

export interface SideDesign {
  borderId: string;
  backgroundId: string;
  fontId: string;
  layoutId: string;
}

export interface CardDesignConfig {
  front: SideDesign;
  back: SideDesign;
  portraitFit: "cover" | "contain";
  /** Front portrait position tweak (px). +Y moves up. */
  portraitOffsetY: number;
  /** Name banner position tweak (px). +X right, +Y up. */
  nameOffsetX: number;
  nameOffsetY: number;
  /** Publisher logo size (% of CSS base width). */
  logoScale: number;
  /** Publisher logo position tweak (px). +X right, +Y up. */
  logoOffsetX: number;
  logoOffsetY: number;
  /** Back OG art zoom (%). */
  backOgScale: number;
  /** Back OG frame backdrop (hex). Auto-sampled from OG art when omitted. */
  backOgBackdropColor?: string;
  /** Stats-section top border Y tweak (px). +Y moves divider/stats down. */
  backStatsBorderOffsetY: number;
  /** Back metadata (#, alignment, home) font size (% of base 0.75rem). */
  backMetaFontSize: number;
  /** Back description font size (% of base 0.75rem). */
  backDescriptionFontSize: number;
  /** Back tier line + stat grid font size (% of base 0.75rem). */
  backStatsFontSize: number;
  /** Front border inset glow strength (%). */
  frontBorderGlow: number;
  /** Back border inset glow strength (%). */
  backBorderGlow: number;
  /** Back ghost (front art) max opacity (%). */
  backGhostOpacity: number;
  /** Ghost position: +Y up (px). */
  backGhostOffsetY: number;
  /** Ghost fade center: +X right (px), relative to card center. */
  backGhostMaskOffsetX: number;
  /** Ghost fade center: +Y up (px), relative to card center. */
  backGhostMaskOffsetY: number;
}

export interface RawAssetEntry {
  filename: string;
  url: string;
  sortKey: string;
  displayName: string;
}

const DEFAULT_PORTRAIT_OFFSET_Y = 0;
const DEFAULT_NAME_OFFSET_X = 6;
const DEFAULT_NAME_OFFSET_Y = 6;
const DEFAULT_LOGO_SCALE = 270;
const DEFAULT_LOGO_OFFSET_X = 64;
const DEFAULT_LOGO_OFFSET_Y = -24;
const DEFAULT_BACK_OG_SCALE = 100;
const DEFAULT_BACK_STATS_BORDER_OFFSET_Y = 0;
const DEFAULT_BACK_FONT_SIZE = 85;
const DEFAULT_BACK_GHOST_OPACITY = 35;
const DEFAULT_BACK_GHOST_OFFSET_Y = 0;
const DEFAULT_BACK_GHOST_MASK_OFFSET_X = 0;
const DEFAULT_BACK_GHOST_MASK_OFFSET_Y = 0;
const DEFAULT_FRONT_BORDER_GLOW = 100;
const DEFAULT_BACK_BORDER_GLOW = 45;

function toOffset(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toScale(value: unknown, fallback: number): number {
  const n = toOffset(value, fallback);
  return Math.min(500, Math.max(25, n));
}

function toBackTextFontSize(value: unknown, fallback: number): number {
  const n = toOffset(value, fallback);
  return Math.min(150, Math.max(50, n));
}

function toBorderGlow(value: unknown, fallback: number): number {
  const n = toOffset(value, fallback);
  return Math.min(200, Math.max(0, n));
}

function toGhostOpacity(value: unknown, fallback: number): number {
  const n = toOffset(value, fallback);
  return Math.min(100, Math.max(0, n));
}

function toOptionalHexColor(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return (`#${r}${r}${g}${g}${b}${b}`).toLowerCase();
  }

  return undefined;
}

/** Ensures saved/partial designs always have valid numeric fields. */
export function normalizeCardDesign(
  input: Partial<CardDesignConfig> & {
    front?: Partial<SideDesign>;
    back?: Partial<SideDesign>;
  }
): CardDesignConfig {
  const d = input as CardDesignConfig & { backFontSize?: number };
  const legacyFontSize =
    typeof d.backFontSize === "number" && Number.isFinite(d.backFontSize)
      ? d.backFontSize
      : undefined;
  return {
    ...DEFAULT_CARD_DESIGN,
    ...d,
    front: { ...DEFAULT_CARD_DESIGN.front, ...d.front },
    back: { ...DEFAULT_CARD_DESIGN.back, ...d.back },
    portraitFit: d.portraitFit ?? DEFAULT_CARD_DESIGN.portraitFit,
    portraitOffsetY: toOffset(d.portraitOffsetY, DEFAULT_PORTRAIT_OFFSET_Y),
    nameOffsetX: toOffset(d.nameOffsetX, DEFAULT_NAME_OFFSET_X),
    nameOffsetY: toOffset(d.nameOffsetY, DEFAULT_NAME_OFFSET_Y),
    logoScale: toScale(d.logoScale, DEFAULT_LOGO_SCALE),
    logoOffsetX: toOffset(d.logoOffsetX, DEFAULT_LOGO_OFFSET_X),
    logoOffsetY: toOffset(d.logoOffsetY, DEFAULT_LOGO_OFFSET_Y),
    backOgScale: toScale(d.backOgScale, DEFAULT_BACK_OG_SCALE),
    backOgBackdropColor: toOptionalHexColor(d.backOgBackdropColor),
    backStatsBorderOffsetY: toOffset(
      d.backStatsBorderOffsetY,
      DEFAULT_BACK_STATS_BORDER_OFFSET_Y
    ),
    backMetaFontSize: toBackTextFontSize(
      d.backMetaFontSize ?? legacyFontSize,
      DEFAULT_BACK_FONT_SIZE
    ),
    backDescriptionFontSize: toBackTextFontSize(
      d.backDescriptionFontSize ?? legacyFontSize,
      DEFAULT_BACK_FONT_SIZE
    ),
    backStatsFontSize: toBackTextFontSize(
      d.backStatsFontSize ?? legacyFontSize,
      DEFAULT_BACK_FONT_SIZE
    ),
    frontBorderGlow: toBorderGlow(
      d.frontBorderGlow,
      DEFAULT_FRONT_BORDER_GLOW
    ),
    backBorderGlow: toBorderGlow(d.backBorderGlow, DEFAULT_BACK_BORDER_GLOW),
    backGhostOpacity: toGhostOpacity(
      d.backGhostOpacity,
      DEFAULT_BACK_GHOST_OPACITY
    ),
    backGhostOffsetY: toOffset(d.backGhostOffsetY, DEFAULT_BACK_GHOST_OFFSET_Y),
    backGhostMaskOffsetX: toOffset(
      d.backGhostMaskOffsetX,
      DEFAULT_BACK_GHOST_MASK_OFFSET_X
    ),
    backGhostMaskOffsetY: toOffset(
      d.backGhostMaskOffsetY,
      DEFAULT_BACK_GHOST_MASK_OFFSET_Y
    ),
  };
}

export const DEFAULT_CARD_DESIGN: CardDesignConfig = {
  front: {
    borderId: "classic-gold",
    backgroundId: "midnight-gradient",
    fontId: "rounded-friendly",
    layoutId: "front-minimal",
  },
  back: {
    borderId: "classic-gold",
    backgroundId: "slate-gradient",
    fontId: "rounded-friendly",
    layoutId: "back-classic",
  },
  portraitFit: "cover",
  portraitOffsetY: DEFAULT_PORTRAIT_OFFSET_Y,
  nameOffsetX: DEFAULT_NAME_OFFSET_X,
  nameOffsetY: DEFAULT_NAME_OFFSET_Y,
  logoScale: DEFAULT_LOGO_SCALE,
  logoOffsetX: DEFAULT_LOGO_OFFSET_X,
  logoOffsetY: DEFAULT_LOGO_OFFSET_Y,
  backOgScale: DEFAULT_BACK_OG_SCALE,
  backStatsBorderOffsetY: DEFAULT_BACK_STATS_BORDER_OFFSET_Y,
  backMetaFontSize: DEFAULT_BACK_FONT_SIZE,
  backDescriptionFontSize: DEFAULT_BACK_FONT_SIZE,
  backStatsFontSize: DEFAULT_BACK_FONT_SIZE,
  frontBorderGlow: DEFAULT_FRONT_BORDER_GLOW,
  backBorderGlow: DEFAULT_BACK_BORDER_GLOW,
  backGhostOpacity: DEFAULT_BACK_GHOST_OPACITY,
  backGhostOffsetY: DEFAULT_BACK_GHOST_OFFSET_Y,
  backGhostMaskOffsetX: DEFAULT_BACK_GHOST_MASK_OFFSET_X,
  backGhostMaskOffsetY: DEFAULT_BACK_GHOST_MASK_OFFSET_Y,
};
