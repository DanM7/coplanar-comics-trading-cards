"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  invalidPlayTeamQueryMessage,
  parsePlayTeamQuery,
  PLAY_TEAM_QUERY_KEY,
  playPathWithTeam,
} from "@/lib/play-team-query";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamParam = searchParams.get(PLAY_TEAM_QUERY_KEY);

  const { data, isLoading, error } = usePlayRoster();
  const [teamSlots, setTeamSlots] = useState<TeamSlots>(emptyTeamSlots);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [startingBattle, setStartingBattle] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const autoStartAttemptedRef = useRef(false);

  const roster = useMemo(() => data?.roster ?? [], [data?.roster]);
  const parsedTeamIds = useMemo(
    () => parsePlayTeamQuery(teamParam),
    [teamParam]
  );
  const teamParamError = useMemo(
    () => invalidPlayTeamQueryMessage(teamParam),
    [teamParam]
  );

  const syncTeamQuery = useCallback(
    (characterIds: string[]) => {
      router.replace(playPathWithTeam(characterIds), { scroll: false });
    },
    [router]
  );

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

  const launchBattle = useCallback(
    async (entries: PlayRosterEntry[], slots: TeamSlots) => {
      if (entries.length !== 3 || startingBattle) {
        return false;
      }

      setStartingBattle(true);
      setStartError(null);

      try {
        const excludeIds = slots.filter((id): id is string => id !== null);
        syncTeamQuery(excludeIds);
        const cpuEntries = await fetchCpuTeam(excludeIds);
        if (cpuEntries.length !== 3) {
          throw new Error("CPU team is incomplete");
        }
        setBattle(createBattle(entries, cpuEntries));
        return true;
      } catch (battleError) {
        setStartError(
          battleError instanceof Error
            ? battleError.message
            : "Could not start battle"
        );
        setBattle(null);
        return false;
      } finally {
        setStartingBattle(false);
      }
    },
    [startingBattle, syncTeamQuery]
  );

  const startBattle = useCallback(async () => {
    await launchBattle(playerEntries, teamSlots);
  }, [launchBattle, playerEntries, teamSlots]);

  const resetToTeamSelect = useCallback(() => {
    setBattle(null);
    setStartError(null);
    autoStartAttemptedRef.current = false;
  }, []);

  const rematch = useCallback(() => {
    resetToTeamSelect();
    if (parsedTeamIds) {
      const slots = setTeamSlotsFromIds(parsedTeamIds);
      const entries = entriesFromTeamSlots(slots, roster);
      if (entries.length === 3) {
        void launchBattle(entries, slots);
      }
    }
  }, [launchBattle, parsedTeamIds, resetToTeamSelect, roster]);

  useEffect(() => {
    if (!parsedTeamIds) {
      return;
    }
    setTeamSlots(setTeamSlotsFromIds(parsedTeamIds));
  }, [parsedTeamIds]);

  useEffect(() => {
    if (isLoading || error || battle || startingBattle) {
      return;
    }

    if (!parsedTeamIds) {
      if (teamParamError) {
        setStartError(teamParamError);
      }
      return;
    }

    if (autoStartAttemptedRef.current) {
      return;
    }

    const slots = setTeamSlotsFromIds(parsedTeamIds);
    const entries = entriesFromTeamSlots(slots, roster);
    if (entries.length !== 3) {
      autoStartAttemptedRef.current = true;
      setStartError(
        "One or more fighters in ?team= are not available on this roster."
      );
      return;
    }

    autoStartAttemptedRef.current = true;
    void launchBattle(entries, slots);
  }, [
    battle,
    error,
    isLoading,
    launchBattle,
    parsedTeamIds,
    roster,
    startingBattle,
    teamParamError,
  ]);

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
        startingBattle && parsedTeamIds ? (
          <p className={styles.playIntro}>Starting battle…</p>
        ) : (
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
        )
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
            onRematch={rematch}
          />
        </>
      )}
    </>
  );
}
