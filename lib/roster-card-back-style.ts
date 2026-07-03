import type { CSSProperties } from "react";
import { getBackgroundPreset, getBorderPreset } from "@/constants/card-design-presets";
import { borderCssVarsWithGlow } from "@/lib/border-glow";
import { cardPrintHasCustomFrontBorder } from "@/lib/card-print-assets";
import { getDefaultCardPrintForCharacter } from "@/lib/card-editor-designs-loader";
import type { Alignment } from "@/types/character";
import {
  DEFAULT_CARD_DESIGN,
  normalizeCardDesign,
  type CardDesignConfig,
} from "@/types/card-design";

/** Roster flip cards render at roughly this fraction of editor card height (420px). */
export const ROSTER_CARD_LAYOUT_SCALE = 165 / 420;

export type RosterPortraitZoneLayout = "classic" | "banner" | "minimal";

function scalePxValue(value: string, scale: number): string {
  const match = value.match(/^([\d.]+)px$/);
  if (!match) {
    return value;
  }
  return `${parseFloat(match[1]) * scale}px`;
}

function scaleBorderCssVars(
  cssVars: Record<string, string>,
  scale: number
): Record<string, string> {
  const scaled: Record<string, string> = {};
  for (const [key, value] of Object.entries(cssVars)) {
    if (key === "--border-style" || key === "--border-color" || key === "--border-glow") {
      scaled[key] = value;
      continue;
    }
    scaled[key] = scalePxValue(value, scale);
  }
  return scaled;
}

function rosterPortraitZoneLayout(layoutId: string): RosterPortraitZoneLayout {
  if (layoutId === "front-banner") {
    return "banner";
  }
  if (layoutId === "front-minimal") {
    return "minimal";
  }
  return "classic";
}

function rosterDesignForCharacter(
  characterId: string,
  alignment: Alignment
): CardDesignConfig {
  const print = getDefaultCardPrintForCharacter(characterId);
  let design = normalizeCardDesign({
    ...DEFAULT_CARD_DESIGN,
    ...print?.design,
  });

  if (print && !cardPrintHasCustomFrontBorder(print)) {
    const borderId =
      alignment === "Evil"
        ? "boss-crimson"
        : alignment === "Good"
          ? "hero-azure"
          : null;
    if (borderId) {
      design = {
        ...design,
        front: { ...design.front, borderId },
        back: { ...design.back, borderId },
      };
    }
  }

  return design;
}

export function rosterCardBackStyle(
  characterId: string,
  alignment: Alignment
): {
  faceStyle: CSSProperties;
  borderStyleAttr: string;
  ghostLayerStyle: CSSProperties;
  /** Raw portrait fallback when no finished front PNG exists. */
  portraitZoneLayout: RosterPortraitZoneLayout;
  portraitImageStyle: CSSProperties;
} {
  const design = rosterDesignForCharacter(characterId, alignment);
  const scale = ROSTER_CARD_LAYOUT_SCALE;

  const border = getBorderPreset(design.front.borderId);
  const glowPercent = Number.isFinite(design.frontBorderGlow)
    ? design.frontBorderGlow
    : DEFAULT_CARD_DESIGN.frontBorderGlow;
  const scaledBorderVars = scaleBorderCssVars(border.cssVars, scale);
  const borderVars = borderCssVarsWithGlow(scaledBorderVars, glowPercent);

  const background = getBackgroundPreset(design.back.backgroundId);
  const portraitOffsetY = Number.isFinite(design.portraitOffsetY)
    ? design.portraitOffsetY
    : DEFAULT_CARD_DESIGN.portraitOffsetY;

  return {
    faceStyle: {
      ...borderVars,
      ["--border-line-gap" as string]: scalePxValue("2px", scale),
      ...background.style,
    },
    borderStyleAttr: border.cssVars["--border-style"] ?? "solid",
    ghostLayerStyle: {
      opacity: design.backGhostOpacity / 100,
    },
    portraitZoneLayout: rosterPortraitZoneLayout(design.front.layoutId),
    portraitImageStyle: {
      objectFit: design.portraitFit,
      objectPosition: `center calc(50% - ${portraitOffsetY * scale}px)`,
    },
  };
}
