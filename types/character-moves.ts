import type { CoreStatKey } from "@/types/character-stats";

export const MAX_CORE_STAT_BLOCKS = 5;
export const MAX_MOVE_STAT_BLOCKS = 5;

export type MoveAttackType = "physical" | "energy";

export type MoveScope = "range" | "self" | "team" | "opponent";

export interface MoveStatBoostEffect {
  stat: CoreStatKey;
  amount: number;
}

export interface MoveStatReductionEffect {
  stat: CoreStatKey;
  amount: number;
}

export interface MoveHpBoostEffect {
  percent: number;
}

export type AttackAnimationEffect =
  | "shake"
  | "spin"
  | "flash"
  | "pulse"
  | "spray"
  | "lunge"
  | "smoke"
  | "laserBolts"
  | "flames";

export type EnergyColorSource = "character" | "weapon";

export interface MoveNameAnimationRule {
  contains: string;
  effects: AttackAnimationEffect[];
}

export interface WeaponColorRule {
  contains: string;
  color: string;
}

export interface MoveAnimationsConfig {
  nameRules: MoveNameAnimationRule[];
  energyDefaults: {
    colorSource: EnergyColorSource;
  };
  weaponColorRules?: WeaponColorRule[];
  /** Used when no name rule matches. */
  fallbacks?: Partial<Record<MoveAttackType, AttackAnimationEffect[]>>;
}

export interface MoveAnimationOverrides {
  effects?: AttackAnimationEffect[];
  energyColor?: string;
  energyColorSource?: EnergyColorSource;
}

export interface MoveAnimationConfig {
  effects: AttackAnimationEffect[];
  energyColor?: string;
  energyColorSource: EnergyColorSource;
}

export interface CharacterMoveRecord {
  id: string | number;
  name: string;
  move1: string;
  move1_value: number;
  /** Scales off Strength when physical (default). */
  move1_type?: MoveAttackType;
  move1_effects?: AttackAnimationEffect[];
  move1_energy_color?: string;
  move1_energy_color_source?: EnergyColorSource;
  move1_scope?: MoveScope;
  move1_effect1?: string;
  move1_effect2?: string;
  move2: string;
  move2_value: number;
  /** Scales off Energy Projection when energy. */
  move2_type?: MoveAttackType;
  move2_effects?: AttackAnimationEffect[];
  move2_energy_color?: string;
  move2_energy_color_source?: EnergyColorSource;
  move2_scope?: MoveScope;
  move2_effect1?: string;
  move2_effect2?: string;
}

export interface CharacterMovesFile {
  animations?: MoveAnimationsConfig;
  moves: CharacterMoveRecord[];
}

export interface MoveDisplay {
  name: string;
  value: number;
  attackType: MoveAttackType;
  scope?: MoveScope;
  statBoosts?: MoveStatBoostEffect[];
  statReductions?: MoveStatReductionEffect[];
  hpBoost?: MoveHpBoostEffect;
  animation?: MoveAnimationConfig;
}
