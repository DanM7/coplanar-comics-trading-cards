import { describe, expect, it } from "vitest";
import { findLatestAnimatedLogEntry } from "@/lib/battle-attack-animation";
import type { CombatLogEntry } from "@/types/game";
import { createBattle, executePlayerAction } from "@/services/game/match";
import { rosterEntryFromCharacterId } from "@/services/game/roster";

function entry(
  id: string,
  kind: CombatLogEntry["kind"],
  animation?: CombatLogEntry["animation"]
): CombatLogEntry {
  return { id, round: 1, message: id, kind, animation };
}

describe("findLatestAnimatedLogEntry", () => {
  it("returns the newest attack even when a round line was appended after it", () => {
    const attack = entry("attack-1", "attack", {
      attackerId: "player-0-004",
      defenderId: "cpu-0-007",
      moveName: "Slam",
      attackType: "physical",
      effects: ["shake"],
      energyColorSource: "character",
    });

    const log = [
      entry("info-1", "info"),
      attack,
      entry("round-2", "round"),
    ];

    expect(findLatestAnimatedLogEntry(log)?.id).toBe("attack-1");
  });

  it("returns the newest attack even when a victory line was appended after it", () => {
    const attack = entry("attack-2", "ko", {
      attackerId: "player-0-004",
      defenderId: "cpu-0-007",
      moveName: "Bolt",
      attackType: "energy",
      effects: ["pulse", "flash"],
      energyColorSource: "character",
    });

    const log = [attack, entry("victory", "ko")];

    expect(findLatestAnimatedLogEntry(log)?.id).toBe("attack-2");
  });
});

describe("match attack logs", () => {
  it("attaches animation data to attack log entries", () => {
    const player = ["004", "038", "050"]
      .map((id) => rosterEntryFromCharacterId(id))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    const cpu = ["007", "019", "004"]
      .map((id) => rosterEntryFromCharacterId(id))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    let battle = createBattle(player, cpu);
    const cpuTarget = battle.cpuTeam.fighters[0]!.id;

    battle = executePlayerAction(battle, {
      moveIndex: 0,
      targetFighterId: cpuTarget,
    });

    const animated = findLatestAnimatedLogEntry(battle.log);
    expect(animated).not.toBeNull();
    expect(animated?.animation?.attackerId).toBeTruthy();
    expect(animated?.animation?.defenderId).toBe(cpuTarget);
    expect(animated?.animation?.effects.length).toBeGreaterThan(0);
  });
});
