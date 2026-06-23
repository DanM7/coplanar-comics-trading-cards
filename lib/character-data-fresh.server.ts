import { buildMoveMapFromFile } from "@/lib/character-moves-loader";
import { buildCharactersFromDescriptions } from "@/lib/cards-loader";
import { buildStatMapFromFile } from "@/lib/character-stats-loader";
import { readDataJsonFile } from "@/lib/read-data-json.server";
import type { Character } from "@/types/character";
import type { CharacterDescriptionsFile } from "@/types/character";
import type { CharacterMovesFile } from "@/types/character-moves";
import type {
  CharacterStatRecord,
  CharacterStatsFile,
} from "@/types/character-stats";
import type {
  CardEditorDesignsFile,
  CardPrintDefinition,
} from "@/types/card-editor-designs";

/** Stats rows from the current `data/character_stats.json` on disk. */
export function getFreshCharacterStatRecords(): CharacterStatRecord[] {
  const file = readDataJsonFile<CharacterStatsFile>("character_stats.json");
  return Array.from(buildStatMapFromFile(file).values());
}

/** Merged characters from current description + stats JSON on disk. */
export function getFreshCharacters(): Character[] {
  const descriptions = readDataJsonFile<CharacterDescriptionsFile>(
    "character_descriptions.json"
  );
  const statsFile = readDataJsonFile<CharacterStatsFile>("character_stats.json");
  const statsById = buildStatMapFromFile(statsFile);
  return buildCharactersFromDescriptions(descriptions, statsById);
}

/** Move rows from the current `data/character_moves.json` on disk. */
export function getFreshCharacterMoveRecords() {
  const file = readDataJsonFile<CharacterMovesFile>("character_moves.json");
  return Array.from(buildMoveMapFromFile(file).values());
}

/** Trading card print definitions from `data/card_editor_designs.json`. */
export function getFreshCardPrintDefinitions(): CardPrintDefinition[] {
  const file = readDataJsonFile<CardEditorDesignsFile>("card_editor_designs.json");
  return [...(file.cards ?? [])].sort((a, b) => Number(a.id) - Number(b.id));
}
