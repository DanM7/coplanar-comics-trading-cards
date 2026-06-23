import characterMovesData from "@/data/character_moves.json";
import { normalizeCharacterId } from "@/lib/character-id";
import type {
  CharacterMoveRecord,
  CharacterMovesFile,
  MoveAttackType,
  MoveDisplay,
} from "@/types/character-moves";

let cachedById: Map<string, CharacterMoveRecord> | null = null;

export function normalizeMoveAttackType(
  value: unknown
): MoveAttackType {
  return value === "energy" ? "energy" : "physical";
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
  record: CharacterMoveRecord
): MoveDisplay[] {
  const moves: MoveDisplay[] = [];
  if (record.move1.trim()) {
    moves.push({
      name: record.move1,
      value: record.move1_value,
      attackType: normalizeMoveAttackType(record.move1_type),
    });
  }
  if (record.move2.trim()) {
    moves.push({
      name: record.move2,
      value: record.move2_value,
      attackType: normalizeMoveAttackType(record.move2_type),
    });
  }
  return moves;
}

export function movesForCharacterId(id: string): MoveDisplay[] {
  const record = getCharacterMoveById(id);
  if (!record) return [];
  return moveDisplaysFromRecord(record);
}
