import type { Alignment } from "@/types/character";
import type { CoreStats } from "@/types/character-stats";
import type { MoveDisplay } from "@/types/character-moves";
import type { AttackAnimationEffect, EnergyColorSource } from "@/types/character-moves";

export type BattleTeamId = "player" | "cpu";

export interface PlayRosterEntry {
  characterId: string;
  name: string;
  alignment: Alignment;
  type?: string;
  homeDistrict: string;
  tier: number;
  stats: CoreStats;
  moves: MoveDisplay[];
  ownedQuantity?: number;
  /** Finished card front PNG when exported to assets/cards/. */
  frontImageUrl?: string;
}

export interface TeamSynergyBonuses {
  /** +0 / +0.05 / +0.10 damage multiplier component */
  typeDamage: number;
  /** +0 / +0.15 incoming damage reduction (all Good, Evil, or Neutral) */
  alignmentDefense: number;
  /** +0 / +0.10 hit chance */
  homeAccuracy: number;
}

export interface BattleFighter {
  id: string;
  characterId: string;
  name: string;
  team: BattleTeamId;
  slot: number;
  alignment: Alignment;
  type?: string;
  homeDistrict: string;
  baseStats: CoreStats;
  effectiveStats: CoreStats;
  moves: MoveDisplay[];
  maxHp: number;
  currentHp: number;
  isKO: boolean;
  frontImageUrl?: string;
}

export interface BattleTeam {
  id: BattleTeamId;
  fighters: BattleFighter[];
  synergy: TeamSynergyBonuses;
  statBonuses: CoreStats;
}

export type BattlePhase =
  | "team_select"
  | "battle"
  | "victory"
  | "defeat";

export interface CombatLogAnimation {
  attackerId: string;
  defenderId: string;
  moveName: string;
  attackType: "physical" | "energy";
  effects: AttackAnimationEffect[];
  energyColor?: string;
  energyColorSource: EnergyColorSource;
}

export interface CombatLogEntry {
  id: string;
  round: number;
  message: string;
  kind: "info" | "attack" | "miss" | "ko" | "round";
  animation?: CombatLogAnimation;
}

export interface PendingPlayerAction {
  fighterId: string;
  moveIndex: number;
  targetFighterId: string;
}

export interface BattleState {
  phase: BattlePhase;
  round: number;
  playerTeam: BattleTeam;
  cpuTeam: BattleTeam;
  turnOrder: string[];
  turnIndex: number;
  log: CombatLogEntry[];
  winner: BattleTeamId | null;
  awaitingPlayerAction: boolean;
}

export interface AttackResult {
  hit: boolean;
  damage: number;
  hitChance: number;
  basePower: number;
  damageMultiplier: number;
  defenseFactor: number;
  defenderHpAfter: number;
  defenderKO: boolean;
}
