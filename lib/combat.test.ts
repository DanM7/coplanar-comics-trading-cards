import { describe, expect, it } from "vitest";
import { projectAttackDamage } from "@/services/game/combat";
import { buildBattleTeam } from "@/services/game/battle-team";
import { rosterEntryFromCharacterId } from "@/services/game/roster";

describe("projectAttackDamage", () => {
  it("returns positive damage and hit chance for a valid matchup", () => {
    const playerEntries = ["004", "038", "050"]
      .map((id) => rosterEntryFromCharacterId(id))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    const cpuEntries = ["007", "019", "004"]
      .map((id) => rosterEntryFromCharacterId(id))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    const playerTeam = buildBattleTeam("player", playerEntries);
    const cpuTeam = buildBattleTeam("cpu", cpuEntries);
    const attacker = playerTeam.fighters[0]!;
    const defender = cpuTeam.fighters[0]!;
    const move = attacker.moves[0]!;

    const projection = projectAttackDamage({
      attacker,
      defender,
      move,
      attackerTeam: playerTeam,
      defenderTeam: cpuTeam,
    });

    expect(projection.damage).toBeGreaterThan(0);
    expect(projection.hitChance).toBeGreaterThan(0);
    expect(projection.hitChance).toBeLessThanOrEqual(1);
  });
});
