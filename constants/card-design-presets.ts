import type { CSSProperties } from "react";

export interface BorderPreset {
  id: string;
  label: string;
  cssVars: Record<string, string>;
}

export interface BackgroundPreset {
  id: string;
  label: string;
  style: CSSProperties;
}

export interface FontPreset {
  id: string;
  label: string;
  family: string;
  nameTransform?: "uppercase" | "none";
  letterSpacing?: string;
}

export interface LayoutPreset {
  id: string;
  label: string;
  side: "front" | "back";
}

export const BORDER_PRESETS: BorderPreset[] = [
  {
    id: "classic-gold",
    label: "Classic Gold",
    cssVars: {
      "--border-width": "6px",
      "--border-color": "#f07830",
      "--border-radius": "10px",
      "--border-glow": "rgba(240, 120, 48, 0.35)",
      "--border-style": "double",
    },
  },
  {
    id: "rare-golden",
    label: "Rare Golden",
    cssVars: {
      "--border-width": "7px",
      "--border-color": "#ffd700",
      "--border-radius": "10px",
      "--border-glow": "rgba(255, 215, 0, 0.55)",
      "--border-style": "double",
    },
  },
  {
    id: "silver-90s",
    label: "90s Silver",
    cssVars: {
      "--border-width": "5px",
      "--border-color": "#b8b8c8",
      "--border-radius": "8px",
      "--border-glow": "rgba(200, 200, 220, 0.5)",
      "--border-style": "solid",
    },
  },
  {
    id: "neon-cyan",
    label: "Neon Cyan",
    cssVars: {
      "--border-width": "3px",
      "--border-color": "#00e5ff",
      "--border-radius": "12px",
      "--border-glow": "rgba(0, 229, 255, 0.6)",
      "--border-style": "solid",
    },
  },
  {
    id: "boss-crimson",
    label: "Boss Crimson",
    cssVars: {
      "--border-width": "6px",
      "--border-color": "#8b0000",
      "--border-radius": "6px",
      "--border-glow": "rgba(220, 20, 60, 0.45)",
      "--border-style": "double",
    },
  },
  {
    id: "hero-azure",
    label: "Hero Azure",
    cssVars: {
      "--border-width": "6px",
      "--border-color": "#7dd3fc",
      "--border-radius": "6px",
      "--border-glow": "rgba(125, 211, 252, 0.45)",
      "--border-style": "double",
    },
  },
  {
    id: "flatlands-violet",
    label: "Flatlands Violet",
    cssVars: {
      "--border-width": "4px",
      "--border-color": "#9b59b6",
      "--border-radius": "4px",
      "--border-glow": "rgba(155, 89, 182, 0.4)",
      "--border-style": "solid",
    },
  },
  {
    id: "geometry-blue",
    label: "Geometry Blue",
    cssVars: {
      "--border-width": "4px",
      "--border-color": "#6c9bcf",
      "--border-radius": "2px",
      "--border-glow": "rgba(108, 155, 207, 0.45)",
      "--border-style": "solid",
    },
  },
];

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "midnight-gradient",
    label: "Midnight",
    style: {
      background: "linear-gradient(160deg, #2a4a68 0%, #0d2848 100%)",
    },
  },
  {
    id: "slate-gradient",
    label: "Slate",
    style: {
      background: "linear-gradient(160deg, #1e2a3a 0%, #0f1419 100%)",
    },
  },
  {
    id: "human-warm",
    label: "Human Warm",
    style: {
      background: "linear-gradient(180deg, #3d2914 0%, #1a1208 100%)",
    },
  },
  {
    id: "geometry-grid",
    label: "Geometry Grid",
    style: {
      background:
        "linear-gradient(160deg, #1a2744 0%, #0d1520 100%), repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(108,155,207,0.08) 12px, rgba(108,155,207,0.08) 13px)",
    },
  },
  {
    id: "flatlands-paper",
    label: "Flatlands Paper",
    style: {
      background: "linear-gradient(180deg, #2a1f3d 0%, #120a1a 100%)",
    },
  },
  {
    id: "foil-shimmer",
    label: "Foil Shimmer",
    style: {
      background:
        "linear-gradient(135deg, #4a4a5a 0%, #8a8a9a 25%, #3a3a4a 50%, #9a9aaa 75%, #4a4a5a 100%)",
      backgroundSize: "200% 200%",
    },
  },
  {
    id: "comic-burst",
    label: "Comic Burst",
    style: {
      background:
        "radial-gradient(circle at 50% 30%, #4a3728 0%, #1a1410 70%), repeating-conic-gradient(from 0deg at 50% 50%, rgba(201,162,39,0.06) 0deg 10deg, transparent 10deg 20deg)",
    },
  },
];

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "serif-display",
    label: "Serif Display",
    family: '"Georgia", "Times New Roman", serif',
    nameTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  {
    id: "impact-hero",
    label: "Impact Hero",
    family: 'Impact, "Arial Black", sans-serif',
    nameTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  {
    id: "mono-tech",
    label: "Mono Tech",
    family: '"Courier New", Courier, monospace',
    nameTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  {
    id: "rounded-friendly",
    label: "Rounded Friendly",
    family: 'system-ui, "Segoe UI", Roboto, sans-serif',
    nameTransform: "none",
    letterSpacing: "0",
  },
  {
    id: "comic-bold",
    label: "Comic Bold",
    family: '"Comic Sans MS", "Chalkboard SE", cursive',
    nameTransform: "none",
    letterSpacing: "0",
  },
];

export const LAYOUT_PRESETS: LayoutPreset[] = [
  { id: "front-classic", label: "Classic (portrait top)", side: "front" },
  { id: "front-banner", label: "Banner overlay", side: "front" },
  { id: "front-minimal", label: "Minimal (large art, bottom banner)", side: "front" },
  { id: "back-classic", label: "Classic stats block", side: "back" },
  { id: "back-compact", label: "Compact two-column", side: "back" },
  { id: "back-lore", label: "Lore-focused", side: "back" },
];

export function getBorderPreset(id: string): BorderPreset {
  return BORDER_PRESETS.find((p) => p.id === id) ?? BORDER_PRESETS[0];
}

export function getBackgroundPreset(id: string): BackgroundPreset {
  return BACKGROUND_PRESETS.find((p) => p.id === id) ?? BACKGROUND_PRESETS[0];
}

export function getFontPreset(id: string): FontPreset {
  return FONT_PRESETS.find((p) => p.id === id) ?? FONT_PRESETS[0];
}
