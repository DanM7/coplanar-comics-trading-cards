"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCardRaritySymbol } from "@/constants/card-rarity";
import {
  BACKGROUND_PRESETS,
  BORDER_PRESETS,
  FONT_PRESETS,
  LAYOUT_PRESETS,
} from "@/constants/card-design-presets";
import { SERIES_TITLES, DEFAULT_SERIES_ID } from "@/constants/series";
import { characterIdsMatch } from "@/lib/character-id";
import { formatCardPrintId } from "@/lib/format-card-series-footer";
import { cardPrintPngFilename } from "@/lib/card-export-filenames";
import { fetchCardAssetStatus, type CardAssetStatus } from "@/lib/card-asset-status";
import {
  CARD_EDITOR_HEIGHT,
  CARD_EDITOR_WIDTH,
  PNG_EXPORT_SCALE_DEFAULT,
  PNG_EXPORT_SCALE_MAX,
  PNG_EXPORT_SCALE_MIN,
  saveCardElementPng,
} from "@/lib/export-card-png";
import { moveDisplaysFromRecord } from "@/lib/character-moves-loader";
import { useCardDesignEditor } from "@/hooks/useCardDesignEditor";
import { useOgBackdropColor } from "@/hooks/useOgBackdropColor";
import { CharacterStatsPanel } from "./CharacterStatsPanel";
import { CollapsibleSection } from "./CollapsibleSection";
import type { CardStats } from "@/types/card";
import { DEFAULT_CARD_DESIGN } from "@/types/card-design";
import { EditableCardFace } from "./EditableCardFace";
import { TextOffsetControl } from "./TextOffsetControl";
import styles from "./editor.module.css";

type PngExportTarget = "front" | "back" | "both";

function ExportPngButton({
  label,
  exportingLabel,
  saved,
  savedTitle,
  isExporting,
  disabled,
  onClick,
  fullWidth,
}: {
  label: string;
  exportingLabel: string;
  saved: boolean;
  savedTitle: string;
  isExporting: boolean;
  disabled: boolean;
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={[
        styles.previewExportButtonWrap,
        fullWidth ? styles.previewExportButtonWrapFull : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {saved ? (
        <span
          className={styles.previewExportSaved}
          title={savedTitle}
          aria-label={savedTitle}
        >
          ✓
        </span>
      ) : null}
      <button
        type="button"
        className={[
          styles.previewExportBtn,
          fullWidth ? styles.previewExportBtnBoth : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={onClick}
        disabled={disabled}
      >
        {isExporting ? exportingLabel : label}
      </button>
    </div>
  );
}

export function CardDesignEditor() {
  const {
    frontAssets,
    backAssets,
    characters,
    selectedFrontFilename,
    selectRawFrontAsset,
    selectedBackFilename,
    selectRawBackAsset,
    selectedCharacterId,
    cardPrints,
    selectedCardPrintId,
    selectedCardPrint,
    selectCardPrint,
    selectCharacter,
    selectAdjacentCharacter,
    selectAdjacentCardPrint,
    selectedCharacter,
    selectedStatRecord,
    selectedMoveRecord,
    selectedFrontAsset,
    selectedBackAsset,
    metaLocked,
    activeSide,
    setActiveSide,
    design,
    meta,
    loading,
    loadError,
    updateSideDesign,
    updateDesign,
    updateMeta,
    saveToLocalStorage,
    exportJson,
    resetDesign,
  } = useCardDesignEditor();

  const frontCanvasRef = useRef<HTMLDivElement>(null);
  const backCanvasRef = useRef<HTMLDivElement>(null);
  const [pngExportScale, setPngExportScale] = useState(PNG_EXPORT_SCALE_DEFAULT);
  const [pngExporting, setPngExporting] = useState<PngExportTarget | null>(null);
  const [cardAssetStatus, setCardAssetStatus] = useState<CardAssetStatus | null>(
    null
  );

  const activePrintId = selectedCardPrintId ?? meta.cardId;

  const refreshCardAssetStatus = useCallback(async () => {
    if (!activePrintId) {
      setCardAssetStatus(null);
      return;
    }

    const status = await fetchCardAssetStatus(activePrintId);
    setCardAssetStatus(status);
  }, [activePrintId]);

  useEffect(() => {
    void refreshCardAssetStatus();
  }, [refreshCardAssetStatus]);

  const sideDesign = activeSide === "front" ? design.front : design.back;
  const layoutOptions = LAYOUT_PRESETS.filter((l) => l.side === activeSide);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (cardPrints.length <= 1) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      selectAdjacentCardPrint(event.key === "ArrowLeft" ? -1 : 1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cardPrints.length, selectAdjacentCardPrint]);

  const saveSidePng = useCallback(
    async (side: "front" | "back") => {
      const element =
        side === "front" ? frontCanvasRef.current : backCanvasRef.current;

      if (!element) {
        throw new Error(`Could not find ${side} card preview.`);
      }

      const filename = cardPrintPngFilename(activePrintId, side);
      return saveCardElementPng(element, filename, pngExportScale);
    },
    [activePrintId, pngExportScale]
  );

  const downloadSidePng = useCallback(
    async (side: "front" | "back") => {
      setPngExporting(side);
      try {
        const result = await saveSidePng(side);
        window.alert(`Saved ${result.relativePath}`);
        await refreshCardAssetStatus();
      } catch (error) {
        window.alert(
          error instanceof Error ? error.message : "PNG export failed."
        );
      } finally {
        setPngExporting(null);
      }
    },
    [refreshCardAssetStatus, saveSidePng]
  );

  const downloadBothPng = useCallback(async () => {
    setPngExporting("both");
    try {
      const front = await saveSidePng("front");
      const back = await saveSidePng("back");
      window.alert(`Saved ${front.relativePath}\nSaved ${back.relativePath}`);
      await refreshCardAssetStatus();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "PNG export failed."
      );
    } finally {
      setPngExporting(null);
    }
  }, [refreshCardAssetStatus, saveSidePng]);

  const portraitUrl = selectedFrontAsset?.url ?? "";
  const backPortraitUrl = selectedBackAsset?.url ?? "";
  const { effectiveColor: ogBackdropColor, sampledColor: ogSampledBackdrop } =
    useOgBackdropColor(backPortraitUrl, design.backOgBackdropColor);

  if (loading) {
    return <p className={styles.hint}>Loading characters and raw assets…</p>;
  }

  if (characters.length === 0) {
    return (
      <p className={styles.hint}>
        {loadError ?? (
          <>
            No characters in <code>data/character_descriptions.json</code>.
          </>
        )}
      </p>
    );
  }

  const cardBackStats: CardStats = selectedStatRecord
    ? {
        strength: selectedStatRecord.stats.strength,
        speed: selectedStatRecord.stats.speed,
        intelligence: selectedStatRecord.stats.intelligence,
        durability: selectedStatRecord.stats.durability,
        energy_projection: selectedStatRecord.stats.energy_projection,
        skill: selectedStatRecord.stats.skill,
      }
    : selectedCharacter?.stats ?? meta.stats;

  const cardBackTier =
    selectedStatRecord?.tier ?? selectedCharacter?.tier ?? meta.tier;

  const cardBackMoves = selectedMoveRecord
    ? moveDisplaysFromRecord(selectedMoveRecord)
    : [];

  const cardPreviewMeta = {
    displayName: meta.displayName,
    cardId: meta.cardId,
    alignment: meta.alignment,
    tier: cardBackTier,
    realm: meta.realm,
    home_plane: selectedCharacter?.home_plane ?? meta.home_plane,
    home_location: selectedCharacter?.home_location ?? meta.home_location,
    home_district: selectedCharacter?.home_district ?? meta.home_district,
    type: selectedCharacter?.type ?? meta.type,
    identity: selectedCharacter?.identity ?? meta.identity,
    description: meta.description,
    seriesFooterLine:
      meta.seriesFooterLine ||
      `${getCardRaritySymbol(selectedCardPrint?.rarity ?? "common")} ${formatCardPrintId(selectedCardPrintId ?? "")} – ${SERIES_TITLES[DEFAULT_SERIES_ID]}`,
    flavorText: meta.flavorText || undefined,
    stats: cardBackStats,
    moves: cardBackMoves,
  };

  return (
    <div className={styles.editor}>
      <aside className={styles.panel}>
        <CollapsibleSection title="Card print">
          <div className={styles.field}>
            <label htmlFor="card-print-select">Print</label>
            <div className={styles.characterNav}>
              <button
                type="button"
                className={styles.characterNavBtn}
                onClick={() => selectAdjacentCardPrint(-1)}
                disabled={cardPrints.length <= 1}
                aria-label="Previous card print"
              >
                ←
              </button>
              <select
                id="card-print-select"
                value={selectedCardPrintId ?? ""}
                onChange={(e) => selectCardPrint(e.target.value)}
              >
                {cardPrints.map((p) => {
                  const ch = characters.find((c) =>
                    characterIdsMatch(c.id, p.character)
                  );
                  const chName = ch?.name ?? `Character ${p.character}`;
                  const printId = formatCardPrintId(p.id);
                  return (
                    <option key={p.id} value={p.id}>
                      {getCardRaritySymbol(p.rarity)} {printId} — {chName}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                className={styles.characterNavBtn}
                onClick={() => selectAdjacentCardPrint(1)}
                disabled={cardPrints.length <= 1}
                aria-label="Next card print"
              >
                →
              </button>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="character-name-select">Character</label>
            <select
              id="character-name-select"
              value={selectedCharacterId ?? ""}
              onChange={(e) => selectCharacter(e.target.value)}
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.name}
                </option>
              ))}
            </select>
          </div>
          {frontAssets.length > 0 && (
            <div className={styles.field}>
              <label htmlFor="asset-front-select">Raw front image</label>
              <select
                id="asset-front-select"
                value={selectedFrontFilename ?? ""}
                onChange={(e) => selectRawFrontAsset(e.target.value)}
              >
                {frontAssets.map((a) => (
                  <option key={a.filename} value={a.filename}>
                    {a.filename}
                  </option>
                ))}
              </select>
            </div>
          )}
          {backAssets.length > 0 && (
            <div className={styles.field}>
              <label htmlFor="asset-back-select">Raw back image</label>
              <select
                id="asset-back-select"
                value={selectedBackFilename ?? ""}
                onChange={(e) => selectRawBackAsset(e.target.value)}
              >
                <option value="">— None —</option>
                {backAssets.map((a) => (
                  <option key={a.filename} value={a.filename}>
                    {a.filename}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Character stats (character_stats.json)">
          <CharacterStatsPanel
            characterId={selectedCharacterId}
            statRecord={selectedStatRecord}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Master data (character_descriptions.json)"
          defaultOpen={false}
        >
          <div className={styles.metaFields}>
          {metaLocked && (
            <p className={styles.hint}>
              Lore from <code>data/character_descriptions.json</code>.
            </p>
          )}
          <div className={styles.field}>
            <label htmlFor="meta-name">Name</label>
            <input
              id="meta-name"
              value={meta.displayName}
              readOnly={metaLocked}
              className={metaLocked ? styles.readOnly : undefined}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="meta-id">Card #</label>
            <input
              id="meta-id"
              value={meta.cardId}
              readOnly={metaLocked}
              className={metaLocked ? styles.readOnly : undefined}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="meta-alignment">Alignment</label>
            <input
              id="meta-alignment"
              value={meta.alignment}
              readOnly={metaLocked}
              className={metaLocked ? styles.readOnly : undefined}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="meta-realm">Realm</label>
            <input
              id="meta-realm"
              value={meta.realm}
              readOnly={metaLocked}
              className={metaLocked ? styles.readOnly : undefined}
            />
          </div>
          {selectedCharacter && (
            <>
              <div className={styles.field}>
                <label htmlFor="meta-plane">Home plane</label>
                <input
                  id="meta-plane"
                  value={selectedCharacter.home_plane}
                  readOnly
                  className={styles.readOnly}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="meta-location">Location</label>
                <input
                  id="meta-location"
                  value={selectedCharacter.home_location}
                  readOnly
                  className={styles.readOnly}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="meta-district">District</label>
                <input
                  id="meta-district"
                  value={selectedCharacter.home_district}
                  readOnly
                  className={styles.readOnly}
                />
              </div>
            </>
          )}
          <div className={styles.field}>
            <label htmlFor="meta-desc">Description (back)</label>
            <textarea
              id="meta-desc"
              value={meta.description}
              readOnly={metaLocked}
              className={metaLocked ? styles.readOnly : undefined}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="meta-flavor">Flavor text (design only)</label>
            <input
              id="meta-flavor"
              value={meta.flavorText}
              onChange={(e) => updateMeta({ flavorText: e.target.value })}
            />
          </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Card styling" defaultOpen>
          <div className={styles.sideToggle}>
            <button
              type="button"
              className={activeSide === "front" ? styles.active : ""}
              onClick={() => setActiveSide("front")}
            >
              Front
            </button>
            <button
              type="button"
              className={activeSide === "back" ? styles.active : ""}
              onClick={() => setActiveSide("back")}
            >
              Back
            </button>
          </div>

        {activeSide === "back" && (
          <>
            <div className={styles.field}>
              <label>OG Image</label>
              <TextOffsetControl
                label="Zoom"
                value={design.backOgScale ?? DEFAULT_CARD_DESIGN.backOgScale}
                onChange={(backOgScale) => updateDesign({ backOgScale })}
                min={50}
                max={300}
                step={5}
                valueSuffix="%"
              />
              <div className={styles.ogBackdropRow}>
                <span className={styles.ogBackdropLabel}>Frame backdrop</span>
                <span
                  className={styles.ogBackdropSwatch}
                  style={{ background: ogBackdropColor }}
                  title={ogBackdropColor}
                  aria-hidden
                />
                <code className={styles.ogBackdropHex}>{ogBackdropColor}</code>
                <button
                  type="button"
                  className={styles.ogBackdropSaveBtn}
                  disabled={!ogSampledBackdrop}
                  onClick={() =>
                    updateDesign({
                      backOgBackdropColor: ogSampledBackdrop ?? undefined,
                    })
                  }
                >
                  Save sampled
                </button>
                {design.backOgBackdropColor ? (
                  <button
                    type="button"
                    className={styles.ogBackdropSaveBtn}
                    onClick={() =>
                      updateDesign({ backOgBackdropColor: undefined })
                    }
                  >
                    Clear saved
                  </button>
                ) : null}
              </div>
            </div>
            <div className={styles.field}>
              <label>Front image ghost (background)</label>
              <TextOffsetControl
                label="Opacity"
                value={design.backGhostOpacity ?? DEFAULT_CARD_DESIGN.backGhostOpacity}
                onChange={(backGhostOpacity) =>
                  updateDesign({ backGhostOpacity })
                }
                min={0}
                max={100}
                step={5}
                valueSuffix="%"
              />
              <TextOffsetControl
                label="Opacity Left / Right"
                value={
                  design.backGhostMaskOffsetX ??
                  DEFAULT_CARD_DESIGN.backGhostMaskOffsetX
                }
                onChange={(backGhostMaskOffsetX) =>
                  updateDesign({ backGhostMaskOffsetX })
                }
                min={-120}
                max={120}
              />
              <TextOffsetControl
                label="Opacity Down / Up"
                value={
                  design.backGhostMaskOffsetY ??
                  DEFAULT_CARD_DESIGN.backGhostMaskOffsetY
                }
                onChange={(backGhostMaskOffsetY) =>
                  updateDesign({ backGhostMaskOffsetY })
                }
                min={-120}
                max={120}
              />
              <TextOffsetControl
                label="Down / Up"
                value={design.backGhostOffsetY ?? DEFAULT_CARD_DESIGN.backGhostOffsetY}
                onChange={(backGhostOffsetY) =>
                  updateDesign({ backGhostOffsetY })
                }
                min={-120}
                max={120}
              />
            </div>
            <div className={styles.field}>
              <label>Metadata font size</label>
              <TextOffsetControl
                label="Metadata"
                value={design.backMetaFontSize ?? DEFAULT_CARD_DESIGN.backMetaFontSize}
                onChange={(backMetaFontSize) =>
                  updateDesign({ backMetaFontSize })
                }
                min={50}
                max={150}
                step={5}
                valueSuffix="%"
              />
            </div>
            <div className={styles.field}>
              <label>Description font size</label>
              <TextOffsetControl
                label="Description"
                value={
                  design.backDescriptionFontSize ??
                  DEFAULT_CARD_DESIGN.backDescriptionFontSize
                }
                onChange={(backDescriptionFontSize) =>
                  updateDesign({ backDescriptionFontSize })
                }
                min={50}
                max={150}
                step={5}
                valueSuffix="%"
              />
            </div>
            <div className={styles.field}>
              <label>Stats font size</label>
              <TextOffsetControl
                label="Stats"
                value={design.backStatsFontSize ?? DEFAULT_CARD_DESIGN.backStatsFontSize}
                onChange={(backStatsFontSize) =>
                  updateDesign({ backStatsFontSize })
                }
                min={50}
                max={150}
                step={5}
                valueSuffix="%"
              />
            </div>
          </>
        )}

        <div className={styles.field}>
          <label>Border glow</label>
          <TextOffsetControl
            label="Glow"
            value={
              activeSide === "front"
                ? (design.frontBorderGlow ?? 100)
                : (design.backBorderGlow ?? 45)
            }
            onChange={(value) =>
              updateDesign(
                activeSide === "front"
                  ? { frontBorderGlow: value }
                  : { backBorderGlow: value }
              )
            }
            min={0}
            max={200}
            step={5}
            valueSuffix="%"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="bg-select">Background</label>
          <select
            id="bg-select"
            value={sideDesign.backgroundId}
            onChange={(e) =>
              updateSideDesign(activeSide, { backgroundId: e.target.value })
            }
          >
            {BACKGROUND_PRESETS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="font-select">Font</label>
          <select
            id="font-select"
            value={sideDesign.fontId}
            onChange={(e) =>
              updateSideDesign(activeSide, { fontId: e.target.value })
            }
          >
            {FONT_PRESETS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="layout-select">Layout</label>
          <select
            id="layout-select"
            value={sideDesign.layoutId}
            onChange={(e) =>
              updateSideDesign(activeSide, { layoutId: e.target.value })
            }
          >
            {layoutOptions.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="border-select">Border</label>
          <select
            id="border-select"
            value={sideDesign.borderId}
            onChange={(e) =>
              updateSideDesign(activeSide, { borderId: e.target.value })
            }
          >
            {BORDER_PRESETS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {activeSide === "back" && (
          <div className={styles.field}>
            <label>Stats section border</label>
            <TextOffsetControl
              label="Down / Up"
              value={
                design.backStatsBorderOffsetY ??
                DEFAULT_CARD_DESIGN.backStatsBorderOffsetY
              }
              onChange={(backStatsBorderOffsetY) =>
                updateDesign({ backStatsBorderOffsetY })
              }
              min={-120}
              max={120}
            />
          </div>
        )}
        </CollapsibleSection>

        {activeSide === "front" && (
          <CollapsibleSection title="Front tuning">
            <div className={styles.field}>
              <label htmlFor="portrait-fit">Portrait fit</label>
              <select
                id="portrait-fit"
                value={design.portraitFit}
                onChange={(e) =>
                  updateDesign({
                    portraitFit: e.target.value as "cover" | "contain",
                  })
                }
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
              </select>
            </div>
            <div className={styles.field}>
              <TextOffsetControl
                label="Portrait Down / Up"
                value={
                  design.portraitOffsetY ?? DEFAULT_CARD_DESIGN.portraitOffsetY
                }
                onChange={(portraitOffsetY) => updateDesign({ portraitOffsetY })}
                min={-120}
                max={120}
              />
            </div>
            <div className={styles.field}>
              <label>Text position</label>
              <TextOffsetControl
                label="Left / Right"
                value={design.nameOffsetX ?? 6}
                onChange={(nameOffsetX) => updateDesign({ nameOffsetX })}
              />
              <TextOffsetControl
                label="Down / Up"
                value={design.nameOffsetY ?? 6}
                onChange={(nameOffsetY) => updateDesign({ nameOffsetY })}
              />
            </div>
            <div className={styles.field}>
              <label>Publisher logo</label>
              <TextOffsetControl
                label="Size"
                value={design.logoScale ?? 270}
                onChange={(logoScale) => updateDesign({ logoScale })}
                min={50}
                max={500}
                step={5}
                valueSuffix="%"
              />
              <TextOffsetControl
                label="Left / Right"
                value={design.logoOffsetX ?? 64}
                onChange={(logoOffsetX) => updateDesign({ logoOffsetX })}
              />
              <TextOffsetControl
                label="Down / Up"
                value={design.logoOffsetY ?? -24}
                onChange={(logoOffsetY) => updateDesign({ logoOffsetY })}
              />
            </div>
          </CollapsibleSection>
        )}

        <p className={styles.hint}>
          Layout saves per card print in browser localStorage. Committed entries
          live in <code>data/card_editor_designs.json</code> (<code>cards</code>{" "}
          array: print id, rarity, character). Export JSON includes a{" "}
          <code>repoFileSnippet</code> to merge into that file.
        </p>
      </aside>

      <section className={styles.previewArea}>
        <div className={styles.previewToolbar}>
          <button type="button" onClick={saveToLocalStorage}>
            Save layout locally
          </button>
          <button type="button" onClick={exportJson}>
            Export JSON
          </button>
          <button type="button" onClick={resetDesign}>
            Reset layout
          </button>
        </div>

        <div className={styles.previewDual}>
          <div className={styles.previewDualCards}>
            <EditableCardFace
              side="front"
              canvasRef={frontCanvasRef}
              portraitUrl={portraitUrl}
              backPortraitUrl={backPortraitUrl}
              meta={cardPreviewMeta}
              design={design}
            />
            <EditableCardFace
              side="back"
              canvasRef={backCanvasRef}
              portraitUrl={portraitUrl}
              backPortraitUrl={backPortraitUrl}
              meta={cardPreviewMeta}
              design={design}
            />
          </div>
          <div className={styles.previewCharNav}>
            <button
              type="button"
              className={`${styles.characterNavBtn} ${styles.characterNavBtnPreview}`}
              onClick={() => selectAdjacentCharacter(-1)}
              disabled={characters.length <= 1}
              aria-label="Previous character"
            >
              ←
            </button>
            <button
              type="button"
              className={`${styles.characterNavBtn} ${styles.characterNavBtnPreview}`}
              onClick={() => selectAdjacentCharacter(1)}
              disabled={characters.length <= 1}
              aria-label="Next character"
            >
              →
            </button>
          </div>

          <div className={styles.previewExport}>
            <TextOffsetControl
              label="Export scale"
              value={pngExportScale}
              onChange={setPngExportScale}
              min={PNG_EXPORT_SCALE_MIN}
              max={PNG_EXPORT_SCALE_MAX}
              step={1}
              valueSuffix="×"
            />
            <div className={styles.previewExportButtons}>
              <ExportPngButton
                label="Download front PNG"
                exportingLabel="Exporting front…"
                saved={cardAssetStatus?.front ?? false}
                savedTitle="Front PNG saved in assets/cards/"
                isExporting={pngExporting === "front"}
                disabled={pngExporting !== null}
                onClick={() => void downloadSidePng("front")}
              />
              <ExportPngButton
                label="Download back PNG"
                exportingLabel="Exporting back…"
                saved={cardAssetStatus?.back ?? false}
                savedTitle="Back PNG saved in assets/cards/"
                isExporting={pngExporting === "back"}
                disabled={pngExporting !== null}
                onClick={() => void downloadSidePng("back")}
              />
            </div>
            <ExportPngButton
              label="Download front & back PNG"
              exportingLabel="Exporting both…"
              saved={Boolean(cardAssetStatus?.front && cardAssetStatus?.back)}
              savedTitle="Front and back PNGs saved in assets/cards/"
              isExporting={pngExporting === "both"}
              disabled={pngExporting !== null}
              onClick={() => void downloadBothPng()}
              fullWidth
            />
            <p className={styles.previewExportHint}>
              {CARD_EDITOR_WIDTH * pngExportScale}×
              {CARD_EDITOR_HEIGHT * pngExportScale}px per side at{" "}
              {pngExportScale}× scale. Saves to{" "}
              <code>assets/cards/</code> (mirrored to{" "}
              <code>public/assets/cards/</code>).
            </p>
          </div>
        </div>

        <p className={styles.hint}>
          Preview at 300×420px. Use Export JSON to update the repo record for
          this card print.
        </p>
      </section>
    </div>
  );
}
