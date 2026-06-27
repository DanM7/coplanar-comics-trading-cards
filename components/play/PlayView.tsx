"use client";

import { useCallback, useMemo, useState } from "react";
import { createBattle } from "@/services/game/match";
import {
  clearTeamSlot,
  emptyTeamSlots,
  entriesFromTeamSlots,
  setTeamSlotsFromIds,
  toggleTeamSlot,
  type TeamSlots,
} from "@/services/game/team-slots";
import type { BattleState, PlayRosterEntry } from "@/types/game";
import { usePlayRoster } from "@/hooks/usePlayRoster";
import { BattleBoard } from "./BattleBoard";
import { TeamSelect } from "./TeamSelect";
import styles from "./play.module.css";

async function fetchCpuTeam(excludeIds: string[]): Promise<PlayRosterEntry[]> {
  const query =
    excludeIds.length > 0
      ? `?exclude=${encodeURIComponent(excludeIds.join(","))}`
      : "";
  const response = await fetch(`/api/play/cpu-team${query}`);
  if (!response.ok) {
    throw new Error("Failed to load CPU team");
  }
  const payload = (await response.json()) as { entries: PlayRosterEntry[] };
  return payload.entries;
}

export function PlayView() {
  const { data, isLoading, error } = usePlayRoster();
  const [teamSlots, setTeamSlots] = useState<TeamSlots>(emptyTeamSlots);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [startingBattle, setStartingBattle] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const roster = data?.roster ?? [];

  const pickCharacter = useCallback((characterId: string) => {
    setTeamSlots((current) => toggleTeamSlot(current, characterId));
  }, []);

  const clearSlot = useCallback((slotIndex: number) => {
    setTeamSlots((current) => clearTeamSlot(current, slotIndex));
  }, []);

  const selectTeam = useCallback((characterIds: string[]) => {
    setTeamSlots(setTeamSlotsFromIds(characterIds));
  }, []);

  const playerEntries = useMemo(
    () => entriesFromTeamSlots(teamSlots, roster),
    [roster, teamSlots]
  );

  const startBattle = useCallback(async () => {
    if (playerEntries.length !== 3 || startingBattle) {
      return;
    }

    setStartingBattle(true);
    setStartError(null);

    try {
      const excludeIds = teamSlots.filter((id): id is string => id !== null);
      const cpuEntries = await fetchCpuTeam(excludeIds);
      if (cpuEntries.length !== 3) {
        throw new Error("CPU team is incomplete");
      }
      setBattle(createBattle(playerEntries, cpuEntries));
    } catch (battleError) {
      setStartError(
        battleError instanceof Error
          ? battleError.message
          : "Could not start battle"
      );
    } finally {
      setStartingBattle(false);
    }
  }, [playerEntries, startingBattle, teamSlots]);

  const resetToTeamSelect = useCallback(() => {
    setBattle(null);
    setStartError(null);
  }, []);

  if (isLoading) {
    return <p className={styles.playIntro}>Loading play roster…</p>;
  }

  if (error) {
    return <p className={styles.playIntro}>Could not load roster: {error}</p>;
  }

  return (
    <>
      <h1>Play!</h1>
      <p className={styles.playIntro}>
        Field a team of three and battle the CPU using the Coplanar official
        stat, synergy, and combat rules.
      </p>

      {startError ? (
        <p className={styles.playIntro}>{startError}</p>
      ) : null}

      {!battle ? (
        <TeamSelect
          roster={roster}
          teamSlots={teamSlots}
          mode={data?.mode ?? "guest"}
          totalOwned={data?.totalOwned ?? 0}
          onPick={pickCharacter}
          onClearSlot={clearSlot}
          onSelectTeam={selectTeam}
          onStart={() => void startBattle()}
          canStart={playerEntries.length === 3 && !startingBattle}
          startingBattle={startingBattle}
        />
      ) : (
        <>
          <div className={styles.playActions} style={{ marginBottom: "1rem" }}>
            <button
              type="button"
              className={`${styles.playBtn} ${styles.playBtnSecondary}`}
              onClick={resetToTeamSelect}
            >
              Back to Team Select
            </button>
          </div>
          <BattleBoard
            battle={battle}
            onBattleChange={setBattle}
            onRematch={resetToTeamSelect}
          />
        </>
      )}
    </>
  );
}
