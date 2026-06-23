import type { Character } from "@/types/character";
import type { GeneratedCardFront } from "@/types/card";
import { portraitUrlForCharacter } from "@/lib/character-portrait-url";
import type { SeriesConfig } from "../types";

export function renderCardFront(
  character: Character,
  series: SeriesConfig
): GeneratedCardFront {
  return {
    portraitUrl:
      portraitUrlForCharacter(character.id) ??
      series.placeholderPortraitPath(character.id),
    name: character.name,
    alignment: character.alignment,
    tier: character.tier,
    realm: character.home_region,
    frameId: series.frameId,
    seriesId: series.id,
  };
}
