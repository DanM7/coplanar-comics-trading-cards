import characterMovesData from "@/data/character_moves.json";
import { normalizeCharacterId } from "@/lib/character-id";
import {
  DEFAULT_MOVE_ANIMATIONS,
  overridesFromMoveSlot,
  resolveMoveAnimation,
} from "@/lib/move-animations";
import type {
  CharacterMoveRecord,
  CharacterMovesFile,
  MoveAnimationsConfig,
  MoveAttackType,
  MoveDisplay,
} from "@/types/character-moves";

let cachedById: Map<string, CharacterMoveRecord> | null = null;
let cachedAnimations: MoveAnimationsConfig | null = null;

export function normalizeMoveAttackType(value: unknown): MoveAttackType {
  return value === "energy" ? "energy" : "physical";
}

export function getMoveAnimationsConfig(): MoveAnimationsConfig {
  if (!cachedAnimations) {
    const file = characterMovesData as CharacterMovesFile;
    cachedAnimations = file.animations ?? DEFAULT_MOVE_ANIMATIONS;
  }
  return cachedAnimations;
}

export function buildMoveMapFromFile(
  file: CharacterMovesFile
): Map<string, CharacterMoveRecord> {
  const map = new Map<string, CharacterMoveRecord>();
  for (const row of file.moves ?? []) {
    map.set(normalizeCharacterId(row.id), {
      ...row,
      id: normalizeCharacterId(row.id),
    });
  }
  return map;
}

function loadMoveMap(): Map<string, CharacterMoveRecord> {
  if (!cachedById) {
    cachedById = buildMoveMapFromFile(
      characterMovesData as CharacterMovesFile
    );
  }
  return cachedById;
}

export function getAllCharacterMoveRecords(): CharacterMoveRecord[] {
  return Array.from(loadMoveMap().values());
}

export function getCharacterMoveById(
  id: string
): CharacterMoveRecord | undefined {
  return loadMoveMap().get(normalizeCharacterId(id));
}

export function moveDisplaysFromRecord(
  record: CharacterMoveRecord,
  config: MoveAnimationsConfig = getMoveAnimationsConfig()
): MoveDisplay[] {
  const moves: MoveDisplay[] = [];

  if (record.move1.trim()) {
    const attackType = normalizeMoveAttackType(record.move1_type);
    moves.push({
      name: record.move1,
      value: record.move1_value,
      attackType,
      animation: resolveMoveAnimation({
        moveName: record.move1,
        attackType,
        overrides: overridesFromMoveSlot(record, 1),
        config,
      }),
    });
  }

  if (record.move2.trim()) {
    const attackType = normalizeMoveAttackType(record.move2_type);
    moves.push({
      name: record.move2,
      value: record.move2_value,
      attackType,
      animation: resolveMoveAnimation({
        moveName: record.move2,
        attackType,
        overrides: overridesFromMoveSlot(record, 2),
        config,
      }),
    });
  }

  return moves;
}

export function movesForCharacterId(id: string): MoveDisplay[] {
  const record = getCharacterMoveById(id);
  if (!record) return [];
  return moveDisplaysFromRecord(record);
}
