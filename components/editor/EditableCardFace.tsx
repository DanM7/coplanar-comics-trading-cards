"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from "react";
import {
  getBackgroundPreset,
  getBorderPreset,
  getFontPreset,
} from "@/constants/card-design-presets";
import { CardPublisherLogo } from "@/components/cards/CardPublisherLogo";
import { formatTierPowerLine } from "@/lib/card-power-summary";
import { borderCssVarsWithGlow } from "@/lib/border-glow";
import { formatCharacterBackHeaderLines } from "@/lib/format-character-home";
import { CardStatBlocks } from "@/components/cards/CardStatBlocks";
import type { MoveDisplay } from "@/types/character-moves";
import type { CardStats } from "@/types/card";
import {
  DEFAULT_CARD_DESIGN,
  type CardDesignConfig,
  type CardSide,
} from "@/types/card-design";
import type { Alignment, HomePlane, HomeRegion } from "@/types/character";
import { backStatsAnchorTopCssVar } from "@/lib/back-card-layout";
import { usePreloadedImageSrc } from "@/hooks/usePreloadedImageSrc";
import { useOgBackdropColor } from "@/hooks/useOgBackdropColor";
import styles from "./editor.module.css";

export interface EditorCardMeta {
  displayName: string;
  cardId: string;
  alignment: string;
  tier: number;
  realm: HomeRegion;
  home_plane: HomePlane;
  home_location: string;
  home_district: string;
  type?: string;
  identity?: string;
  description: string;
  seriesFooterLine: string;
  flavorText?: string;
  stats: CardStats;
  moves?: MoveDisplay[];
}

interface EditableCardFaceProps {
  side: CardSide;
  portraitUrl: string;
  backPortraitUrl?: string;
  meta: EditorCardMeta;
  design: CardDesignConfig;
  canvasRef?: Ref<HTMLDivElement>;
}

export function EditableCardFace({
  side,
  portraitUrl,
  backPortraitUrl,
  meta,
  design,
  canvasRef,
}: EditableCardFaceProps) {
  const displayPortraitUrl = usePreloadedImageSrc(portraitUrl);
  const displayBackPortraitUrl = usePreloadedImageSrc(backPortraitUrl ?? "");
  const { effectiveColor: ogBackdropColor } = useOgBackdropColor(
    displayBackPortraitUrl,
    design.backOgBackdropColor
  );

  const sideDesign = side === "front" ? design.front : design.back;
  const border = getBorderPreset(sideDesign.borderId);
  const background = getBackgroundPreset(sideDesign.backgroundId);
  const font = getFontPreset(sideDesign.fontId);
  const isFoil = sideDesign.backgroundId === "foil-shimmer";

  const borderGlowPercent =
    side === "front"
      ? Number.isFinite(design.frontBorderGlow)
        ? design.frontBorderGlow
        : 100
      : Number.isFinite(design.backBorderGlow)
        ? design.backBorderGlow
        : 45;

  const borderStyle = {
    ...borderCssVarsWithGlow(border.cssVars, borderGlowPercent),
    fontFamily: font.family,
    textTransform: side === "back" ? "none" : font.nameTransform,
    letterSpacing: font.letterSpacing,
  } as CSSProperties;

  const isClassicBackLayout =
    side === "back" &&
    sideDesign.layoutId !== "back-compact" &&
    sideDesign.layoutId !== "back-lore";
  const backOgScale = Number.isFinite(design.backOgScale)
    ? design.backOgScale
    : DEFAULT_CARD_DESIGN.backOgScale;
  const ogFrameRef = useRef<HTMLDivElement>(null);
  const [ogFrameHeight, setOgFrameHeight] = useState(0);

  useLayoutEffect(() => {
    if (side !== "back") {
      setOgFrameHeight(0);
      return;
    }

    const frame = ogFrameRef.current;
    if (!frame) {
      setOgFrameHeight(0);
      return;
    }

    const measure = () => {
      setOgFrameHeight(frame.getBoundingClientRect().height);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [side, backPortraitUrl, backOgScale, isClassicBackLayout]);

  if (side === "front") {
    const layoutClass =
      sideDesign.layoutId === "front-banner"
        ? styles.layoutFrontBanner
        : sideDesign.layoutId === "front-minimal"
          ? styles.layoutFrontMinimal
          : styles.layoutFrontClassic;

    return (
      <div
        ref={canvasRef}
        className={`${styles.cardCanvas} ${layoutClass}`}
        style={borderStyle}
      >
        <div
          className={`${styles.cardFace} ${isFoil ? styles.foilAnim : ""}`}
          style={background.style}
        >
          <div className={styles.portraitZone}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPortraitUrl}
              alt=""
              crossOrigin="anonymous"
              style={{
                objectFit: design.portraitFit,
                objectPosition: `center calc(50% - ${Number.isFinite(design.portraitOffsetY) ? design.portraitOffsetY : DEFAULT_CARD_DESIGN.portraitOffsetY}px)`,
              }}
            />
          </div>
          <div
            className={styles.nameplate}
            style={{
              right: `calc(var(--border-width, 4px) + ${Number.isFinite(design.nameOffsetX) ? design.nameOffsetX : 6}px)`,
              transform: `translate(${Number.isFinite(design.nameOffsetX) ? design.nameOffsetX : 6}px, ${-(Number.isFinite(design.nameOffsetY) ? design.nameOffsetY : 6)}px)`,
            }}
          >
            <h3 className={styles.characterName}>{meta.displayName}</h3>
          </div>
        </div>
        <div
          className={styles.cardBorder}
          data-border-style={border.cssVars["--border-style"] ?? "solid"}
          aria-hidden
        />
        <CardPublisherLogo
          className={styles.editorPublisherLogo}
          scale={design.logoScale}
          offsetX={design.logoOffsetX}
          offsetY={design.logoOffsetY}
        />
      </div>
    );
  }

  const backLayoutClass =
    sideDesign.layoutId === "back-compact"
      ? styles.layoutBackCompact
      : sideDesign.layoutId === "back-lore"
        ? styles.layoutBackLore
        : "";

  const backStatsBorderOffsetY = Number.isFinite(design.backStatsBorderOffsetY)
    ? design.backStatsBorderOffsetY
    : DEFAULT_CARD_DESIGN.backStatsBorderOffsetY;
  const backMetaFontSize = Number.isFinite(design.backMetaFontSize)
    ? design.backMetaFontSize
    : DEFAULT_CARD_DESIGN.backMetaFontSize;
  const backDescriptionFontSize = Number.isFinite(design.backDescriptionFontSize)
    ? design.backDescriptionFontSize
    : DEFAULT_CARD_DESIGN.backDescriptionFontSize;
  const backStatsFontSize = Number.isFinite(design.backStatsFontSize)
    ? design.backStatsFontSize
    : DEFAULT_CARD_DESIGN.backStatsFontSize;
  const backGhostOpacity = Number.isFinite(design.backGhostOpacity)
    ? design.backGhostOpacity
    : DEFAULT_CARD_DESIGN.backGhostOpacity;
  const backGhostOffsetY = Number.isFinite(design.backGhostOffsetY)
    ? design.backGhostOffsetY
    : DEFAULT_CARD_DESIGN.backGhostOffsetY;
  const backGhostMaskOffsetX = Number.isFinite(design.backGhostMaskOffsetX)
    ? design.backGhostMaskOffsetX
    : DEFAULT_CARD_DESIGN.backGhostMaskOffsetX;
  const backGhostMaskOffsetY = Number.isFinite(design.backGhostMaskOffsetY)
    ? design.backGhostMaskOffsetY
    : DEFAULT_CARD_DESIGN.backGhostMaskOffsetY;

  const ghostLayerStyle = {
    opacity: backGhostOpacity / 100,
    "--og-frame-height": `${ogFrameHeight}px`,
    "--ghost-offset-y": `${backGhostOffsetY}px`,
    "--ghost-mask-offset-x": `${backGhostMaskOffsetX}px`,
    "--ghost-mask-offset-y": `${backGhostMaskOffsetY}px`,
  } as CSSProperties;

  const sectionFontStyle = (percent: number): CSSProperties => ({
    fontSize: `calc(0.75rem * ${percent / 100})`,
  });

  const { idAlignmentLine, homeLine, typeIdentityLine } =
    formatCharacterBackHeaderLines({
      cardId: meta.cardId,
      alignment: meta.alignment as Alignment,
      home_plane: meta.home_plane,
      home_location: meta.home_location,
      home_district: meta.home_district,
      type: meta.type,
      identity: meta.identity,
    });

  const backStatsSectionStyle: CSSProperties = sectionFontStyle(
    backStatsFontSize
  );

  const backCanvasStyle = isClassicBackLayout
    ? ({
        "--back-stats-top": backStatsAnchorTopCssVar(
          "var(--card-h, 420px)",
          backStatsBorderOffsetY
        ),
      } as CSSProperties)
    : undefined;

  const ogFrameStyle = {
    "--og-scale": backOgScale / 100,
    "--og-frame-backdrop": ogBackdropColor,
  } as CSSProperties;

  return (
    <div
      ref={canvasRef}
      className={`${styles.cardCanvas} ${backLayoutClass}`}
      style={{ ...borderStyle, ...backCanvasStyle }}
    >
      <div
        className={`${styles.cardFace} ${styles.cardFaceBack} ${styles.cardFaceBackSentence} ${isFoil ? styles.foilAnim : ""}`}
        style={background.style}
      >
        {portraitUrl ? (
          <div
            className={styles.backGhostLayer}
            style={ghostLayerStyle}
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.backGhostImage}
              src={displayPortraitUrl}
              alt=""
              crossOrigin="anonymous"
              style={{ objectFit: design.portraitFit }}
            />
          </div>
        ) : null}
        {isClassicBackLayout ? (
          <>
            <div className={styles.backTopStack}>
              {backPortraitUrl ? (
                <div
                  ref={ogFrameRef}
                  className={styles.backOgFrame}
                  style={ogFrameStyle}
                >
                  <div className={styles.backOgScaler}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={displayBackPortraitUrl} alt="" crossOrigin="anonymous" />
                  </div>
                </div>
              ) : null}
              <div className={styles.backBody}>
                <header
                  className={styles.backHeader}
                  style={sectionFontStyle(backMetaFontSize)}
                >
                  <p className={styles.backText}>{idAlignmentLine}</p>
                  <p className={styles.backText}>{homeLine}</p>
                  <p className={styles.backText}>{typeIdentityLine}</p>
                </header>
                <div
                  className={styles.backSectionDivider}
                  style={sectionFontStyle(backDescriptionFontSize)}
                >
                  <p className={styles.backText}>{meta.description}</p>
                </div>
              </div>
            </div>
            <div
              className={styles.backStatsSection}
              style={backStatsSectionStyle}
            >
              <div className={styles.backStatsMain}>
                <p className={`${styles.backText} ${styles.tierPowerLine}`}>
                  {formatTierPowerLine(meta.stats, meta.tier, meta.moves)}
                </p>
                <CardStatBlocks
                  className={styles.backText}
                  stats={meta.stats}
                  moves={meta.moves}
                />
                {meta.flavorText ? (
                  <p className={styles.flavorText}>{meta.flavorText}</p>
                ) : null}
              </div>
              <p className={styles.seriesTitle}>{meta.seriesFooterLine}</p>
            </div>
          </>
        ) : (
          <>
            {backPortraitUrl ? (
              <div
                ref={ogFrameRef}
                className={styles.backOgFrame}
                style={ogFrameStyle}
              >
                <div className={styles.backOgScaler}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={displayBackPortraitUrl} alt="" crossOrigin="anonymous" />
                </div>
              </div>
            ) : null}
            <div className={styles.backBody}>
              <div className={styles.backMain}>
                <header
                  className={styles.backHeader}
                  style={sectionFontStyle(backMetaFontSize)}
                >
                  <p className={styles.backText}>{idAlignmentLine}</p>
                  <p className={styles.backText}>{homeLine}</p>
                  <p className={styles.backText}>{typeIdentityLine}</p>
                </header>
                <div
                  className={styles.backSectionDivider}
                  style={sectionFontStyle(backDescriptionFontSize)}
                >
                  <p className={styles.backText}>{meta.description}</p>
                </div>
                <div
                  className={styles.backStatsSection}
                  style={sectionFontStyle(backStatsFontSize)}
                >
                  <div className={styles.backStatsMain}>
                    <p className={`${styles.backText} ${styles.tierPowerLine}`}>
                      {formatTierPowerLine(meta.stats, meta.tier, meta.moves)}
                    </p>
                    <CardStatBlocks
                      className={styles.backText}
                      stats={meta.stats}
                      moves={meta.moves}
                    />
                    {meta.flavorText ? (
                      <p className={styles.flavorText}>{meta.flavorText}</p>
                    ) : null}
                  </div>
                  <p className={styles.seriesTitle}>{meta.seriesFooterLine}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div
        className={styles.cardBorder}
        data-border-style={border.cssVars["--border-style"] ?? "solid"}
        aria-hidden
      />
    </div>
  );
}
