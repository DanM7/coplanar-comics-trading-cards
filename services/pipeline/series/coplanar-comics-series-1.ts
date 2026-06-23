import { SERIES_TITLES, DEFAULT_SERIES_ID } from "@/constants/series";
import { attachFinishedCardArt } from "@/lib/finished-card-art";
import type { Character } from "@/types/character";
import type { GeneratedCard } from "@/types/card";
import { renderCardFront } from "../renderers/card-front";
import { renderCardBack } from "../renderers/card-back";
import type { CardSeries, SeriesConfig } from "../types";

const config: SeriesConfig = {
  id: DEFAULT_SERIES_ID,
  title: SERIES_TITLES[DEFAULT_SERIES_ID],
  frameId: "frame-series-1-classic",
  placeholderPortraitPath: (characterId) =>
    `/assets/cards/${characterId}.png`,
  buildFlavorText: (character) => {
    if (character.is_boss) {
      return "Boss Edition — Handle with dimensional caution.";
    }
    if (character.first_appearance) {
      return "First appearance in the Coplanar Plains chronicles.";
    }
    return undefined;
  },
};

function generateCard(character: Character): GeneratedCard {
  return attachFinishedCardArt({
    characterId: character.id,
    seriesId: config.id,
    front: renderCardFront(character, config),
    back: renderCardBack(character, config),
  });
}

export const coplanarComicsSeries1: CardSeries = {
  config,
  generateCard,
};
