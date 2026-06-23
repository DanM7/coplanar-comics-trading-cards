import type { Character } from "@/types/character";
import type { GeneratedCard, GeneratedCardBack, GeneratedCardFront } from "@/types/card";

export interface SeriesConfig {
  id: string;
  title: string;
  frameId: string;
  placeholderPortraitPath: (characterId: string) => string;
  buildFlavorText?: (character: Character) => string | undefined;
  buildStats?: (character: Character) => GeneratedCardBack["stats"];
}

export interface CardSeries {
  config: SeriesConfig;
  generateCard(character: Character): GeneratedCard;
}

export type SeriesRegistry = Map<string, CardSeries>;
