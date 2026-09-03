"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { CORE_STAT_BLOCK_DEFS } from "@/lib/card-stat-blocks";
import { primaryCharacterType } from "@/lib/format-character-home";
import {
  computeTeamPower,
  formatTeamPowerScore,
} from "@/services/game/team-power";
import {
  filterPlayRoster,
  findBestTeam,
  sortPlayRoster,
  type PlayRosterSortField,
} from "@/services/game/team-optimizer";
import {
  entriesFromTeamSlots,
  formatTeamSynergyBonuses,
  previewTeamBonuses,
  TEAM_SLOT_COUNT,
  type TeamSlots,
} from "@/services/game/team-slots";
import { TeamStatBonusBlocks } from "@/components/play/TeamStatBonusBlocks";
import { RosterPickCard } from "@/components/play/RosterPickCard";
import type { Alignment } from "@/types/character";
import type { PlayRosterEntry } from "@/types/game";
import styles from "./play.module.css";

interface TeamSelectProps {
  roster: PlayRosterEntry[];
  teamSlots: TeamSlots;
  onPick: (characterId: string) => void;
  onClearSlot: (slotIndex: number) => void;
  onSelectTeam: (characterIds: string[]) => void;
  onStart: () => void;
  canStart: boolean;
  startingBattle?: boolean;
}

const ALL_FILTER = "";

const STAT_SORT_FIELDS = [
  "intelligence",
  "strength",
  "durability",
  "skill",
  "energy_projection",
  "speed",
] as const satisfies readonly PlayRosterSortField[];

const SORT_FIELD_OPTIONS: {
  value: PlayRosterSortField;
  label: string;
  color?: string;
}[] = [
  { value: "num", label: "#" },
  { value: "power", label: "Power", color: "var(--brand-orange)" },
  ...STAT_SORT_FIELDS.map((key) => ({
    value: key,
    label: CORE_STAT_BLOCK_DEFS[key].label,
    color: CORE_STAT_BLOCK_DEFS[key].color,
  })),
];

function sortFieldStyle(field: PlayRosterSortField): CSSProperties | undefined {
  const option = SORT_FIELD_OPTIONS.find((item) => item.value === field);
  if (!option?.color) {
    return undefined;
  }

  return {
    color: option.color,
    ["--sort-stat-color" as string]: option.color,
  };
}

export function TeamSelect({
  roster,
  teamSlots,
  onPick,
  onClearSlot,
  onSelectTeam,
  onStart,
  canStart,
  startingBattle = false,
}: TeamSelectProps) {
  const [sortField, setSortField] = useState<PlayRosterSortField>("power");
  const [sortDesc, setSortDesc] = useState(true);
  const [alignmentFilter, setAlignmentFilter] = useState<Alignment | "">(
    ALL_FILTER
  );
  const [homeFilter, setHomeFilter] = useState(ALL_FILTER);
  const [typeFilter, setTypeFilter] = useState(ALL_FILTER);
  const [bonusesOpen, setBonusesOpen] = useState(true);

  const selectedIds = useMemo(
    () => teamSlots.filter((id): id is string => id !== null),
    [teamSlots]
  );

  const selectedEntries = useMemo(
    () => entriesFromTeamSlots(teamSlots, roster),
    [roster, teamSlots]
  );

  const slotEntries = useMemo(
    () =>
      teamSlots.map((characterId) =>
        characterId
          ? roster.find((entry) => entry.characterId === characterId) ?? null
          : null
      ),
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
    () =>
      sortPlayRoster(filteredRoster, sortField, sortDesc ? "desc" : "asc"),
    [filteredRoster, sortDesc, sortField]
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
    ? formatTeamSynergyBonuses(selectedEntries, bonusPreview.synergy)
    : [];

  return (
    <section className={`${styles.playPanel} ${styles.teamSelectPanel}`}>
      <div className={styles.teamSelectLayout}>
        <div className={styles.teamSelectLeft}>
          <div className={styles.teamBuildColumn}>
            <div className={styles.teamSlots}>
              {teamSlots.map((characterId, slotIndex) => {
                const entry = characterId
                  ? roster.find((item) => item.characterId === characterId)
                  : undefined;

                return (
                  <div key={slotIndex} className={styles.teamSlot}>
                    {entry ? (
                      <RosterPickCard
                        entry={entry}
                        isSelected
                        slotToggleDisabled={false}
                        onToggleSlot={() => onClearSlot(slotIndex)}
                      />
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

            <aside
              className={[
                styles.teamBonusPanel,
                bonusesOpen ? "" : styles.teamBonusPanelCollapsed,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className={styles.teamBonusToggle}
                aria-expanded={bonusesOpen}
                onClick={() => setBonusesOpen((open) => !open)}
              >
                <span className={styles.teamBonusTitle}>Team Bonuses</span>
                <span className={styles.teamBonusChevron} aria-hidden>
                  {bonusesOpen ? "▾" : "▸"}
                </span>
              </button>
              {bonusesOpen ? (
                <>
                  {teamPower ? (
                    <p className={styles.teamPowerScore}>
                      Team power:{" "}
                      <strong>{formatTeamPowerScore(teamPower.totalScore)}</strong>
                    </p>
                  ) : null}
                  {bonusPreview || slotEntries.some((entry) => entry !== null) ? (
                    <>
                      <div className={styles.teamBonusSection}>
                        <p className={styles.teamBonusSectionLabel}>Stat boosts</p>
                        <TeamStatBonusBlocks slotEntries={slotEntries} />
                      </div>
                      {bonusPreview ? (
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
                      ) : null}
                    </>
                  ) : (
                    <p className={styles.teamBonusEmpty}>
                      Select fighters to preview bonuses.
                    </p>
                  )}
                </>
              ) : null}
            </aside>

            <div className={styles.teamBuildActions}>
              <button
                type="button"
                className={`${styles.playBtn} ${styles.playBtnSecondary} ${styles.teamBuildActionsFindBest}`}
                disabled={!canFindBest}
                onClick={handleFindBest}
              >
                Find Best
              </button>
              <button
                type="button"
                className={`${styles.playBtn} ${styles.teamBuildActionsStart}`}
                disabled={!canStart}
                onClick={onStart}
              >
                {startingBattle ? "Starting…" : "Start Battle"}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.teamSelectRight}>
          {roster.length > 0 ? (
            <div className={styles.filterBar}>
              <div className={styles.sortControls}>
                <label className={styles.filterField}>
                  <span className={styles.filterLabel}>Sort</span>
                  <select
                    className={`${styles.filterSelect} ${styles.sortFieldSelect}`}
                    style={sortFieldStyle(sortField)}
                    value={sortField}
                    onChange={(event) =>
                      setSortField(event.target.value as PlayRosterSortField)
                    }
                  >
                    {SORT_FIELD_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        style={option.color ? { color: option.color } : undefined}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={styles.filterField}>
                  <span className={styles.filterLabel}>Dir</span>
                  <button
                    type="button"
                    className={styles.sortDirBtn}
                    aria-label={
                      sortDesc ? "Sort descending" : "Sort ascending"
                    }
                    title={sortDesc ? "Descending" : "Ascending"}
                    onClick={() => setSortDesc((current) => !current)}
                  >
                    {sortDesc ? "↓" : "↑"}
                  </button>
                </div>
              </div>

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
            </div>
          ) : null}

          <div className={styles.rosterScroll}>
            {roster.length === 0 ? (
              <p className={styles.playIntro}>
                No playable cards found. Open packs or sign in to build a team
                from your collection.
              </p>
            ) : displayedRoster.length === 0 ? (
              <p className={styles.playIntro}>
                No fighters match the current filters. Try broadening Alignment,
                Home, or Type.
              </p>
            ) : (
              <div className={styles.rosterGrid}>
                {displayedRoster.map((entry) => {
                  const isSelected = selectedIds.includes(entry.characterId);

                  return (
                    <RosterPickCard
                      key={entry.characterId}
                      entry={entry}
                      isSelected={isSelected}
                      slotToggleDisabled={!isSelected && atMax}
                      onToggleSlot={() => onPick(entry.characterId)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
