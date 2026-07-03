"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { RosterCardBackStats } from "@/components/play/RosterCardBackStats";
import { CharacterTypeIcon } from "@/components/play/CharacterTypeIcon";
import { playRosterCardFrontUrl } from "@/lib/play-roster-image";
import {
  rosterCardBackStyle,
  type RosterPortraitZoneLayout,
} from "@/lib/roster-card-back-style";
import type { PlayRosterEntry } from "@/types/game";
import styles from "./play.module.css";

const PORTRAIT_ZONE_CLASS: Record<RosterPortraitZoneLayout, string> = {
  classic: styles.rosterCardBackPortraitZoneClassic,
  banner: styles.rosterCardBackPortraitZoneBanner,
  minimal: styles.rosterCardBackPortraitZoneMinimal,
};

interface RosterPickCardProps {
  entry: PlayRosterEntry;
  isSelected: boolean;
  slotToggleDisabled: boolean;
  onToggleSlot: () => void;
}

export function RosterPickCard({
  entry,
  isSelected,
  slotToggleDisabled,
  onToggleSlot,
}: RosterPickCardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleToggleSlot = (event: MouseEvent) => {
    event.stopPropagation();
    if (slotToggleDisabled) {
      return;
    }
    onToggleSlot();
  };

  const handleFlip = () => {
    setFlipped((current) => !current);
  };

  const backStyle = useMemo(
    () => rosterCardBackStyle(entry.characterId, entry.alignment),
    [entry.characterId, entry.alignment]
  );

  const frontImageUrl = playRosterCardFrontUrl(entry);
  const ghostPortraitUrl = entry.portraitUrl ?? entry.frontImageUrl;

  return (
    <div
      className={[
        styles.rosterCard,
        isSelected ? styles.rosterCardSelected : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.rosterCardThumbWrap}>
        <button
          type="button"
          className={styles.rosterCardFlipBtn}
          aria-label={
            flipped
              ? `Show front of ${entry.name}`
              : `Show stats for ${entry.name}`
          }
          aria-pressed={flipped}
          onClick={handleFlip}
        >
          <div
            className={[
              styles.rosterCardFlipInner,
              flipped ? styles.rosterCardFlipInnerFlipped : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={styles.rosterCardFace}>
              {frontImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={frontImageUrl}
                  alt=""
                  className={styles.rosterCardThumb}
                />
              ) : (
                <div
                  className={styles.rosterCardThumbPlaceholder}
                  aria-hidden
                />
              )}
            </div>
            <div
              className={`${styles.rosterCardFace} ${styles.rosterCardFaceBack}`}
              style={backStyle.faceStyle}
            >
              {entry.frontImageUrl ? (
                <div
                  className={styles.rosterCardBackGhost}
                  style={backStyle.ghostLayerStyle}
                  aria-hidden
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.rosterCardBackGhostImage}
                    src={entry.frontImageUrl}
                    alt=""
                  />
                </div>
              ) : ghostPortraitUrl ? (
                <div
                  className={styles.rosterCardBackGhost}
                  style={backStyle.ghostLayerStyle}
                  aria-hidden
                >
                  <div
                    className={[
                      styles.rosterCardBackPortraitZone,
                      PORTRAIT_ZONE_CLASS[backStyle.portraitZoneLayout],
                    ].join(" ")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className={styles.rosterCardBackPortraitImage}
                      src={ghostPortraitUrl}
                      alt=""
                      style={backStyle.portraitImageStyle}
                    />
                  </div>
                </div>
              ) : null}
              <div className={styles.rosterCardBackPanel}>
                <RosterCardBackStats
                  stats={entry.stats}
                  moves={entry.moves}
                />
              </div>
              <div
                className={styles.rosterCardBorder}
                data-border-style={backStyle.borderStyleAttr}
                aria-hidden
              />
            </div>
          </div>
        </button>
      </div>

      <div className={styles.rosterCardFooter}>
        <span className={styles.rosterCardTier} aria-hidden>
          {entry.tier}
        </span>
        <CharacterTypeIcon
          type={entry.type}
          className={styles.rosterCardTypeIcon}
        />
        <button
          type="button"
          className={[
            styles.rosterCardSlotToggle,
            isSelected ? styles.rosterCardSlotToggleSelected : "",
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={slotToggleDisabled}
          aria-label={
            isSelected
              ? `Remove ${entry.name} from team`
              : `Add ${entry.name} to team`
          }
          onClick={handleToggleSlot}
        >
          {isSelected ? "✓" : "+"}
        </button>
      </div>
    </div>
  );
}
