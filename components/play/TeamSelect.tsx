"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { primaryCharacterType } from "@/lib/format-character-home";
import {
  computeTeamPower,
  formatTeamPowerScore,
} from "@/services/game/team-power";
import {
  filterPlayRoster,
  findBestTeam,
  sortPlayRoster,
  type PlayRosterSort,
} from "@/services/game/team-optimizer";
import {
  entriesFromTeamSlots,
  formatTeamSynergyBonuses,
  previewTeamBonuses,
  TEAM_SLOT_COUNT,
  type TeamSlots,
} from "@/services/game/team-slots";
import { TeamStatBonusBlocks } from "@/components/play/TeamStatBonusBlocks";
import type { Alignment } from "@/types/character";
import type { PlayRosterEntry } from "@/types/game";
import styles from "./play.module.css";

interface TeamSelectProps {
  roster: PlayRosterEntry[];
  teamSlots: TeamSlots;
  mode: "collection" | "guest";
  totalOwned: number;
  onPick: (characterId: string) => void;
  onClearSlot: (slotIndex: number) => void;
  onSelectTeam: (characterIds: string[]) => void;
  onStart: () => void;
  canStart: boolean;
  startingBattle?: boolean;
}

const ALL_FILTER = "";

const SORT_OPTIONS: { value: PlayRosterSort; label: string }[] = [
  { value: "num-asc", label: "# Asc" },
  { value: "num-desc", label: "# Desc" },
  { value: "tier-asc", label: "Tier Asc" },
  { value: "tier-desc", label: "Tier Desc" },
];

export function TeamSelect({
  roster,
  teamSlots,
  mode,
  totalOwned,
  onPick,
  onClearSlot,
  onSelectTeam,
  onStart,
  canStart,
  startingBattle = false,
}: TeamSelectProps) {
  const [sort, setSort] = useState<PlayRosterSort>("num-asc");
  const [alignmentFilter, setAlignmentFilter] = useState<Alignment | "">(
    ALL_FILTER
  );
  const [homeFilter, setHomeFilter] = useState(ALL_FILTER);
  const [typeFilter, setTypeFilter] = useState(ALL_FILTER);

  const selectedIds = useMemo(
    () => teamSlots.filter((id): id is string => id !== null),
    [teamSlots]
  );

  const selectedEntries = useMemo(
    () => entriesFromTeamSlots(teamSlots, roster),
    [roster, teamSlots]
  );

  const bonusPreview = useMemo(
    () => previewTeamBonuses(selectedEntries),
    [selectedEntries]
  );

  const teamPower = useMemo(
    () => computeTeamPower(selectedEntries),
    [selectedEntries]
  );

  const alignmentOptions = useMemo(() => {
    const values = new Set<Alignment>();
    for (const entry of roster) {
      values.add(entry.alignment);
    }
    return [...values].sort();
  }, [roster]);

  const homeOptions = useMemo(() => {
    const values = new Set<string>();
    for (const entry of roster) {
      const home = entry.homeDistrict.trim();
      if (home) {
        values.add(home);
      }
    }
    return [...values].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [roster]);

  const typeOptions = useMemo(() => {
    const values = new Set<string>();
    for (const entry of roster) {
      const primary = primaryCharacterType(entry.type);
      if (primary) {
        values.add(primary);
      }
    }
    return [...values].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [roster]);

  const filteredRoster = useMemo(
    () =>
      filterPlayRoster(roster, {
        alignment: alignmentFilter,
        homeDistrict: homeFilter,
        type: typeFilter,
      }),
    [alignmentFilter, homeFilter, roster, typeFilter]
  );

  const displayedRoster = useMemo(
    () => sortPlayRoster(filteredRoster, sort),
    [filteredRoster, sort]
  );

  const atMax = selectedIds.length >= TEAM_SLOT_COUNT;
  const canFindBest = filteredRoster.length >= TEAM_SLOT_COUNT;

  const handleFindBest = () => {
    if (!canFindBest) {
      return;
    }
    onSelectTeam(findBestTeam(filteredRoster));
  };

  const synergyLines = bonusPreview
    ? formatTeamSynergyBonuses(bonusPreview.synergy)
    : [];

  return (
    <section className={styles.playPanel}>
      <span className={styles.modeBadge}>
        {mode === "collection"
          ? `Your Collection (${totalOwned} UNIQUE)`
          : "Guest Mode — full roster"}
      </span>
      <div className={styles.teamSelectHeader}>
        <h2>Build Your Team</h2>
        <p className={styles.selectionCount}>
          Selected {selectedIds.length} / {TEAM_SLOT_COUNT}
        </p>
      </div>
      <p className={styles.playIntro}>
        Pick three fighters. Team stat bonuses and synergy (Type, Alignment,
        Home) apply automatically using the official combat rules.
      </p>

      <div className={styles.teamBuildRow}>
        <div className={styles.teamSlots}>
          {teamSlots.map((characterId, slotIndex) => {
            const entry = characterId
              ? roster.find((item) => item.characterId === characterId)
              : undefined;

            return (
              <div key={slotIndex} className={styles.teamSlot}>
                {entry ? (
                  <button
                    type="button"
                    className={styles.teamSlotFilled}
                    onClick={() => onClearSlot(slotIndex)}
                    title={`Remove ${entry.name}`}
                  >
                    {entry.frontImageUrl ? (
                      <Image
                        src={entry.frontImageUrl}
                        alt=""
                        width={90}
                        height={126}
                        className={styles.teamSlotThumb}
                        unoptimized
                      />
                    ) : (
                      <div
                        className={styles.teamSlotThumbPlaceholder}
                        aria-hidden
                      />
                    )}
                    <span className={styles.teamSlotName}>{entry.name}</span>
                  </button>
                ) : (
                  <div className={styles.teamSlotEmpty}>
                    <span className={styles.teamSlotLabel}>
                      Slot {slotIndex + 1}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <aside className={styles.teamBonusPanel}>
          <h3 className={styles.teamBonusTitle}>Team Bonuses</h3>
          {teamPower ? (
            <p className={styles.teamPowerScore}>
              Team power:{" "}
              <strong>{formatTeamPowerScore(teamPower.totalScore)}</strong>
            </p>
          ) : null}
          {bonusPreview ? (
            <>
              <div className={styles.teamBonusSection}>
                <p className={styles.teamBonusSectionLabel}>Stat boosts</p>
                <TeamStatBonusBlocks bonuses={bonusPreview.statBonuses} />
              </div>
              <div className={styles.teamBonusSection}>
                <p className={styles.teamBonusSectionLabel}>Synergy</p>
                {synergyLines.length > 0 ? (
                  <ul className={styles.teamBonusList}>
                    {synergyLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.teamBonusEmpty}>No synergy yet</p>
                )}
              </div>
            </>
          ) : (
            <p className={styles.teamBonusEmpty}>
              Select fighters to preview bonuses.
            </p>
          )}
        </aside>
      </div>

      {roster.length > 0 ? (
        <div className={styles.filterBar}>
          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Sort</span>
            <select
              className={styles.filterSelect}
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as PlayRosterSort)
              }
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Alignment</span>
            <select
              className={styles.filterSelect}
              value={alignmentFilter}
              onChange={(event) =>
                setAlignmentFilter(event.target.value as Alignment | "")
              }
            >
              <option value={ALL_FILTER}>All alignments</option>
              {alignmentOptions.map((alignment) => (
                <option key={alignment} value={alignment}>
                  {alignment}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Home</span>
            <select
              className={styles.filterSelect}
              value={homeFilter}
              onChange={(event) => setHomeFilter(event.target.value)}
            >
              <option value={ALL_FILTER}>All homes</option>
              {homeOptions.map((home) => (
                <option key={home} value={home}>
                  {home}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Type</span>
            <select
              className={styles.filterSelect}
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value={ALL_FILTER}>All types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className={`${styles.playBtn} ${styles.playBtnSecondary}`}
            disabled={!canFindBest}
            onClick={handleFindBest}
          >
            Find Best
          </button>
        </div>
      ) : null}

      {roster.length === 0 ? (
        <p className={styles.playIntro}>
          No playable cards found. Open packs or sign in to build a team from
          your collection.
        </p>
      ) : displayedRoster.length === 0 ? (
        <p className={styles.playIntro}>
          No fighters match the current filters. Try broadening Alignment, Home,
          or Type.
        </p>
      ) : (
        <div className={styles.rosterGrid}>
          {displayedRoster.map((entry) => {
            const isSelected = selectedIds.includes(entry.characterId);
            const disabled = !isSelected && atMax;

            return (
              <button
                key={entry.characterId}
                type="button"
                className={[
                  styles.rosterCard,
                  isSelected ? styles.rosterCardSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={disabled}
                onClick={() => onPick(entry.characterId)}
              >
                {entry.frontImageUrl ? (
                  <Image
                    src={entry.frontImageUrl}
                    alt=""
                    width={150}
                    height={210}
                    className={styles.rosterCardThumb}
                    unoptimized
                  />
                ) : (
                  <div
                    className={styles.rosterCardThumbPlaceholder}
                    aria-hidden
                  />
                )}
                <p className={styles.rosterCardName}>{entry.name}</p>
                <p className={styles.rosterCardMeta}>
                  Tier {entry.tier} • {entry.alignment}
                  <br />
                  {entry.type ?? "Unknown type"}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.playActions}>
        <button
          type="button"
          className={styles.playBtn}
          disabled={!canStart}
          onClick={onStart}
        >
          {startingBattle ? "Starting…" : "Start Battle"}
        </button>
      </div>
    </section>
  );
}
