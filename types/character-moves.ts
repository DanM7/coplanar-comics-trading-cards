export const MAX_CORE_STAT_BLOCKS = 5;
export const MAX_MOVE_STAT_BLOCKS = 5;

export type MoveAttackType = "physical" | "energy";

export interface CharacterMoveRecord {
  id: string | number;
  name: string;
  move1: string;
  move1_value: number;
  /** Scales off Strength when physical (default). */
  move1_type?: MoveAttackType;
  move2: string;
  move2_value: number;
  /** Scales off Energy Projection when energy. */
  move2_type?: MoveAttackType;
}

export interface CharacterMovesFile {
  moves: CharacterMoveRecord[];
}

export interface MoveDisplay {
  name: string;
  value: number;
  attackType: MoveAttackType;
}
