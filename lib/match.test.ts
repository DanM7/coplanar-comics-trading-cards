import { describe, expect, it } from "vitest";
import {
  createBattle,
  executeCpuTurn,
  executePlayerAction,
  getActiveFighter,
} from "@/services/game/match";
import { rosterEntryFromCharacterId } from "@/services/game/roster";
import type { BattleState } from "@/types/game";

function rosterFromIds(ids: string[]) {
  return ids
    .map((id) => rosterEntryFromCharacterId(id))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

function battleFingerprint(state: BattleState): string {
  return [
    state.phase,
    state.round,
    state.turnIndex,
    state.awaitingPlayerAction,
    state.log.length,
    state.turnOrder.join(","),
  ].join("|");
}

describe("match turn advancement", () => {
  it("skips knocked-out fighters instead of stalling the CPU", () => {
    const player = rosterFromIds(["004", "038", "050"]);
    const cpu = rosterFromIds(["007", "019", "004"]);
    let state = createBattle(player, cpu);

    const rng = () => 0.99;
    let stagnantTurns = 0;
    let previousFingerprint = battleFingerprint(state);

    for (let step = 0; step < 120 && state.phase === "battle"; step += 1) {
      if (state.awaitingPlayerAction) {
        const active = getActiveFighter(state);
        expect(active).toBeTruthy();
        expect(active?.isKO).toBe(false);

        const target = state.cpuTeam.fighters.find((fighter) => !fighter.isKO);
        expect(target).toBeTruthy();

        state = executePlayerAction(
          state,
          { moveIndex: 0, targetFighterId: target!.id },
          rng
        );
      } else {
        state = executeCpuTurn(state, rng);
      }

      const fingerprint = battleFingerprint(state);
      if (fingerprint === previousFingerprint) {
        stagnantTurns += 1;
      } else {
        stagnantTurns = 0;
      }

      expect(stagnantTurns).toBeLessThan(2);
      previousFingerprint = fingerprint;
    }

    expect(state.round).toBeGreaterThanOrEqual(3);
  });
});
