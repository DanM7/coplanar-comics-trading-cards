import { characterToCardStats } from "@/lib/cards-loader";
import { getDefaultCardPrintForCharacter } from "@/lib/card-editor-designs-loader";
import { movesForCharacterId } from "@/lib/character-moves-loader";
import { formatCharacterBackHeaderLines } from "@/lib/format-character-home";
import { formatCardSeriesFooter } from "@/lib/format-card-series-footer";
import type { Character } from "@/types/character";
import type { GeneratedCardBack } from "@/types/card";
import type { CardPrintDefinition } from "@/types/card-editor-designs";
import type { SeriesConfig } from "../types";

export function renderCardBack(
  character: Character,
  series: SeriesConfig,
  cardPrint?: CardPrintDefinition | null
): GeneratedCardBack {
  const flavorText = series.buildFlavorText?.(character);
  const stats = series.buildStats?.(character) ?? characterToCardStats(character);

  const print =
    cardPrint ?? getDefaultCardPrintForCharacter(character.id) ?? null;

  const seriesFooterLine = print
    ? formatCardSeriesFooter(print.id, print.rarity, series.title)
    : formatCardSeriesFooter(character.id, "common", series.title);

  return {
    cardNumber: character.id,
    description: character.description,
    ...formatCharacterBackHeaderLines({
      cardId: character.id,
      alignment: character.alignment,
      home_plane: character.home_plane,
      home_location: character.home_location,
      home_district: character.home_district,
      type: character.type,
      identity: character.identity,
    }),
    tier: character.tier,
    stats,
    moves: movesForCharacterId(character.id),
    seriesFooterLine,
    seriesTitle: series.title,
    flavorText,
  };
}
