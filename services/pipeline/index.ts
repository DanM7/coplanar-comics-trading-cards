import { getCharacterById } from "@/lib/cards-loader";
import { DEFAULT_SERIES_ID } from "@/constants/series";
import type { Character } from "@/types/character";
import type { GeneratedCard } from "@/types/card";
import { getDefaultSeries, getSeries } from "./registry";

/**
 * Card generation pipeline entry point.
 * Modular: swap seriesId for future Series 2, Boss Edition, Foil Variants.
 */
export function generateCardFromCharacter(
  character: Character,
  seriesId: string = DEFAULT_SERIES_ID
): GeneratedCard {
  const series = getSeries(seriesId) ?? getDefaultSeries();
  return series.generateCard(character);
}

export function generateCardById(
  characterId: string,
  seriesId?: string
): GeneratedCard | null {
  const character = getCharacterById(characterId);
  if (!character) return null;
  return generateCardFromCharacter(character, seriesId);
}

export function generateCardsForCharacters(
  characters: Character[],
  seriesId?: string
): GeneratedCard[] {
  return characters.map((c) => generateCardFromCharacter(c, seriesId));
}

export { getDefaultSeries, getSeries, registerSeries } from "./registry";
export type { CardSeries, SeriesConfig } from "./types";
