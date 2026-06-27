import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { CoreStats } from "@/types/character-stats";
import { buildPlayRoster } from "@/services/game/roster";
import { computeTeamPower } from "@/services/game/team-power";
import type { PlayRosterEntry } from "@/types/game";

const OUTPUT_PATH = path.join(process.cwd(), "data", "team_rankings.json");

function compareTeams(
  a: { characterIds: string[]; totalScore: number },
  b: { characterIds: string[]; totalScore: number }
): number {
  if (b.totalScore !== a.totalScore) {
    return b.totalScore - a.totalScore;
  }

  for (let index = 0; index < 3; index++) {
    const idA = a.characterIds[index] ?? "";
    const idB = b.characterIds[index] ?? "";
    const numericDiff =
      Number.parseInt(idA, 10) - Number.parseInt(idB, 10);
    if (Number.isFinite(numericDiff) && numericDiff !== 0) {
      return numericDiff;
    }
    const textDiff = idA.localeCompare(idB, undefined, { numeric: true });
    if (textDiff !== 0) {
      return textDiff;
    }
  }

  return 0;
}

function roundStatBonuses(statBonuses: CoreStats): CoreStats {
  const rounded = {} as CoreStats;
  for (const key of Object.keys(statBonuses) as (keyof CoreStats)[]) {
    rounded[key] = Math.round(statBonuses[key] * 10) / 10;
  }
  return rounded;
}

export function generateTeamRankings(): void {
  const roster = buildPlayRoster();
  const teams: ReturnType<typeof computeTeamPower>[] = [];

  for (let i = 0; i < roster.length; i++) {
    for (let j = i + 1; j < roster.length; j++) {
      for (let k = j + 1; k < roster.length; k++) {
        const trio: PlayRosterEntry[] = [roster[i], roster[j], roster[k]];
        const power = computeTeamPower(trio);
        if (power) {
          teams.push(power);
        }
      }
    }
  }

  teams.sort(compareTeams);

  const rankedTeams = teams.map((team, index) => ({
    rank: index + 1,
    characterIds: team!.characterIds,
    names: team!.names,
    totalScore: Math.round(team!.totalScore * 10) / 10,
    statBonuses: roundStatBonuses(team!.statBonuses),
    synergy: team!.synergy,
    totalHp: team!.totalHp,
    totalPhysicalPower: team!.totalPhysicalPower,
    totalEnergyPower: team!.totalEnergyPower,
    moveScore: Math.round(team!.moveScore * 10) / 10,
    synergyScore: Math.round(team!.synergyScore * 10) / 10,
  }));

  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      characterCount: roster.length,
      teamCombinationCount: rankedTeams.length,
      scoring:
        "Team power v1 — HP + physical + energy + move average×15 + synergy weights (type 280, alignment 450, home 250)",
    },
    characters: roster.map((entry) => ({
      id: entry.characterId,
      name: entry.name,
    })),
    teams: rankedTeams,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload), "utf8");
}

describe("generate team rankings", () => {
  it("writes data/team_rankings.json for all roster trios", () => {
    generateTeamRankings();

    expect(fs.existsSync(OUTPUT_PATH)).toBe(true);
    const payload = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8")) as {
      meta: { characterCount: number; teamCombinationCount: number };
      teams: { rank: number; totalScore: number }[];
    };

    expect(payload.meta.characterCount).toBeGreaterThan(0);
    expect(payload.meta.teamCombinationCount).toBe(
      (payload.meta.characterCount * (payload.meta.characterCount - 1) *
        (payload.meta.characterCount - 2)) /
        6
    );
    expect(payload.teams[0]?.rank).toBe(1);
    expect(payload.teams.at(-1)?.rank).toBe(payload.teams.length);

    for (let index = 1; index < payload.teams.length; index++) {
      expect(payload.teams[index].totalScore).toBeLessThanOrEqual(
        payload.teams[index - 1].totalScore
      );
    }
  });
});
