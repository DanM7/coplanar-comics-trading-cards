import { resolveAttack } from "@/services/game/combat";
import { buildBattleTeam } from "@/services/game/battle-team";
import type {
  BattleFighter,
  BattleState,
  BattleTeam,
  BattleTeamId,
  CombatLogEntry,
  PlayRosterEntry,
} from "@/types/game";

let logCounter = 0;

function nextLogId(): string {
  logCounter += 1;
  return `log-${logCounter}`;
}

function createLogEntry(
  round: number,
  message: string,
  kind: CombatLogEntry["kind"],
  animation?: CombatLogEntry["animation"]
): CombatLogEntry {
  return { id: nextLogId(), round, message, kind, animation };
}

function allFighters(state: BattleState): BattleFighter[] {
  return [...state.playerTeam.fighters, ...state.cpuTeam.fighters];
}

function teamForFighter(
  state: BattleState,
  fighter: BattleFighter
): BattleTeam {
  return fighter.team === "player" ? state.playerTeam : state.cpuTeam;
}

function opponentTeam(state: BattleState, teamId: BattleTeamId): BattleTeam {
  return teamId === "player" ? state.cpuTeam : state.playerTeam;
}

function livingFighters(team: BattleTeam): BattleFighter[] {
  return team.fighters.filter((fighter) => !fighter.isKO);
}

function checkVictory(state: BattleState): BattleState {
  const playerAlive = livingFighters(state.playerTeam).length;
  const cpuAlive = livingFighters(state.cpuTeam).length;

  if (playerAlive === 0) {
    return {
      ...state,
      phase: "defeat",
      winner: "cpu",
      awaitingPlayerAction: false,
      log: [
        ...state.log,
        createLogEntry(state.round, "Your team was defeated!", "ko"),
      ],
    };
  }

  if (cpuAlive === 0) {
    return {
      ...state,
      phase: "victory",
      winner: "player",
      awaitingPlayerAction: false,
      log: [
        ...state.log,
        createLogEntry(state.round, "Victory! All opponents defeated!", "ko"),
      ],
    };
  }

  return state;
}

export function computeTurnOrder(
  playerTeam: BattleTeam,
  cpuTeam: BattleTeam,
  rng: () => number = Math.random
): string[] {
  const fighters = [...playerTeam.fighters, ...cpuTeam.fighters].filter(
    (fighter) => !fighter.isKO
  );

  return fighters
    .slice()
    .sort((a, b) => {
      const speedDiff = b.effectiveStats.speed - a.effectiveStats.speed;
      if (speedDiff !== 0) {
        return speedDiff;
      }
      const skillDiff = b.effectiveStats.skill - a.effectiveStats.skill;
      if (skillDiff !== 0) {
        return skillDiff;
      }
      return rng() < 0.5 ? -1 : 1;
    })
    .map((fighter) => fighter.id);
}

export function createBattle(
  playerEntries: PlayRosterEntry[],
  cpuEntries: PlayRosterEntry[]
): BattleState {
  logCounter = 0;
  const playerTeam = buildBattleTeam("player", playerEntries);
  const cpuTeam = buildBattleTeam("cpu", cpuEntries);
  const turnOrder = computeTurnOrder(playerTeam, cpuTeam);

  const activeFighterId = turnOrder[0];
  const activeFighter = [...playerTeam.fighters, ...cpuTeam.fighters].find(
    (fighter) => fighter.id === activeFighterId
  );

  return {
    phase: "battle",
    round: 1,
    playerTeam,
    cpuTeam,
    turnOrder,
    turnIndex: 0,
    log: [
      createLogEntry(1, "Battle start! Turn order set by Speed.", "round"),
      createLogEntry(
        1,
        activeFighter
          ? `${activeFighter.name} acts first (SPD ${activeFighter.effectiveStats.speed.toFixed(1)}).`
          : "Round 1 begins.",
        "info"
      ),
    ],
    winner: null,
    awaitingPlayerAction: activeFighter?.team === "player",
  };
}

function findFighter(state: BattleState, fighterId: string): BattleFighter | undefined {
  return allFighters(state).find((fighter) => fighter.id === fighterId);
}

function updateFighterHp(
  state: BattleState,
  fighterId: string,
  hp: number,
  isKO: boolean
): BattleState {
  const updateTeam = (team: BattleTeam): BattleTeam => ({
    ...team,
    fighters: team.fighters.map((fighter) =>
      fighter.id === fighterId
        ? { ...fighter, currentHp: hp, isKO }
        : fighter
    ),
  });

  return {
    ...state,
    playerTeam: updateTeam(state.playerTeam),
    cpuTeam: updateTeam(state.cpuTeam),
  };
}

function isFighterReady(
  state: BattleState,
  fighterId: string | undefined
): boolean {
  if (!fighterId) {
    return false;
  }

  const fighter = findFighter(state, fighterId);
  return Boolean(fighter && !fighter.isKO);
}

function advanceTurn(state: BattleState, rng: () => number = Math.random): BattleState {
  let turnOrder = state.turnOrder;
  let turnIndex = state.turnIndex + 1;
  let round = state.round;
  let log = state.log;
  let workingState = state;

  const maxSteps = Math.max(turnOrder.length, 1) * 2 + 6;

  for (let step = 0; step < maxSteps; step += 1) {
    if (turnIndex >= turnOrder.length) {
      round += 1;
      turnOrder = computeTurnOrder(
        workingState.playerTeam,
        workingState.cpuTeam,
        rng
      );
      turnIndex = 0;
      log = [...log, createLogEntry(round, `— Round ${round} —`, "round")];

      workingState = {
        ...workingState,
        round,
        turnOrder,
        turnIndex,
        log,
      };

      const victoryState = checkVictory(workingState);
      if (victoryState.phase !== "battle") {
        return { ...victoryState, awaitingPlayerAction: false };
      }

      workingState = victoryState;

      if (turnOrder.length === 0) {
        return { ...workingState, awaitingPlayerAction: false };
      }

      continue;
    }

    const nextFighterId = turnOrder[turnIndex];
    if (!isFighterReady(workingState, nextFighterId)) {
      turnIndex += 1;
      continue;
    }

    const nextFighter = findFighter(workingState, nextFighterId)!;
    return checkVictory({
      ...workingState,
      turnOrder,
      turnIndex,
      round,
      log,
      awaitingPlayerAction: nextFighter.team === "player",
    });
  }

  return checkVictory({ ...workingState, awaitingPlayerAction: false });
}

export function executePlayerAction(
  state: BattleState,
  input: { moveIndex: number; targetFighterId: string },
  rng: () => number = Math.random
): BattleState {
  if (state.phase !== "battle" || !state.awaitingPlayerAction) {
    return state;
  }

  const activeFighterId = state.turnOrder[state.turnIndex];
  const attacker = findFighter(state, activeFighterId);
  if (!attacker || attacker.isKO) {
    return advanceTurn(state, rng);
  }

  const move = attacker.moves[input.moveIndex];
  if (!move) {
    return state;
  }

  const defender = findFighter(state, input.targetFighterId);
  if (!defender || defender.isKO) {
    return state;
  }

  return resolveAndAdvance(state, attacker, defender, input.moveIndex, rng);
}

export function executeCpuTurn(
  state: BattleState,
  rng: () => number = Math.random
): BattleState {
  if (state.phase !== "battle" || state.awaitingPlayerAction) {
    return state;
  }

  const activeFighterId = state.turnOrder[state.turnIndex];
  const attacker = findFighter(state, activeFighterId);
  if (!attacker || attacker.isKO) {
    return advanceTurn(state, rng);
  }

  if (attacker.team !== "cpu") {
    return advanceTurn(state, rng);
  }

  const targets = livingFighters(opponentTeam(state, "cpu"));
  if (targets.length === 0) {
    return checkVictory(state);
  }

  const moveIndex = Math.floor(rng() * attacker.moves.length);
  const target = targets[Math.floor(rng() * targets.length)]!;

  return resolveAndAdvance(state, attacker, target, moveIndex, rng);
}

function resolveAndAdvance(
  state: BattleState,
  attacker: BattleFighter,
  defender: BattleFighter,
  moveIndex: number,
  rng: () => number
): BattleState {
  if (defender.isKO || defender.team === attacker.team) {
    return state;
  }

  const attackerTeam = teamForFighter(state, attacker);
  const defenderTeam = teamForFighter(state, defender);

  const move = attacker.moves[moveIndex]!;
  const result = resolveAttack({
    attacker,
    defender,
    move,
    attackerTeam,
    defenderTeam,
    rng,
  });

  const hitPct = Math.round(result.hitChance * 100);
  const attackLabel = move.attackType === "energy" ? "Energy" : "Physical";
  const animation = {
    attackerId: attacker.id,
    defenderId: defender.id,
    moveName: move.name,
    attackType: move.attackType,
    effects: move.animation?.effects ?? ["lunge"],
    energyColor: move.animation?.energyColor,
    energyColorSource: move.animation?.energyColorSource ?? "character",
  };

  let message: string;
  let kind: CombatLogEntry["kind"] = "attack";

  if (!result.hit) {
    kind = "miss";
    message = `${attacker.name}'s ${move.name} (${attackLabel}) missed ${defender.name}! (${hitPct}% hit)`;
  } else if (result.defenderKO) {
    kind = "ko";
    message = `${attacker.name}'s ${move.name} KO'd ${defender.name} for ${result.damage} damage!`;
  } else {
    message = `${attacker.name}'s ${move.name} hit ${defender.name} for ${result.damage} damage. (${defender.name}: ${result.defenderHpAfter}/${defender.maxHp} HP)`;
  }

  let nextState = updateFighterHp(
    state,
    defender.id,
    result.defenderHpAfter,
    result.defenderKO
  );

  nextState = {
    ...nextState,
    log: [
      ...nextState.log,
      createLogEntry(nextState.round, message, kind, animation),
    ],
  };

  nextState = checkVictory(nextState);
  if (nextState.phase !== "battle") {
    return { ...nextState, awaitingPlayerAction: false };
  }

  return advanceTurn(nextState, rng);
}

export function getActiveFighter(state: BattleState): BattleFighter | undefined {
  const id = state.turnOrder[state.turnIndex];
  return id ? findFighter(state, id) : undefined;
}

export function formatSynergySummary(team: BattleTeam): string {
  const parts: string[] = [];
  if (team.synergy.typeDamage > 0) {
    parts.push(`+${Math.round(team.synergy.typeDamage * 100)}% damage`);
  }
  if (team.synergy.alignmentDefense > 0) {
    parts.push(`+${Math.round(team.synergy.alignmentDefense * 100)}% defense`);
  }
  if (team.synergy.homeAccuracy > 0) {
    parts.push(`+${Math.round(team.synergy.homeAccuracy * 100)}% accuracy`);
  }
  return parts.length > 0 ? parts.join(" • ") : "No synergy bonuses";
}
