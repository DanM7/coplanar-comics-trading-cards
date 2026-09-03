import { getAllCharacters } from "@/lib/cards-loader";
import {
  getCardPrintById,
  getDefaultCardPrintForCharacter,
} from "@/lib/card-editor-designs-loader";
import { listRawAssetFilenamesSync } from "@/lib/raw-assets-sync";
import { resolveCardExportJob } from "@/lib/resolve-card-print-editor";
import { SERIES_TITLES, DEFAULT_SERIES_ID } from "@/constants/series";
import type { Character } from "@/types/character";
import type { CardDisplay } from "@/types/card";

let cachedExportContext: {
  characters: Character[];
  frontFilenames: string[];
  backFilenames: string[];
} | null = null;

function getCardExportContext() {
  if (!cachedExportContext) {
    cachedExportContext = {
      characters: getAllCharacters(),
      frontFilenames: listRawAssetFilenamesSync("front"),
      backFilenames: listRawAssetFilenamesSync("back"),
    };
  }
  return cachedExportContext;
}

export function resolveCardDisplay(
  characterId: string,
  printId?: string | number
): CardDisplay | null {
  const print = printId
    ? getCardPrintById(printId)
    : getDefaultCardPrintForCharacter(characterId);
  if (!print) {
    return null;
  }

  const context = getCardExportContext();
  const job = resolveCardExportJob(print, {
    characters: context.characters,
    frontFilenames: context.frontFilenames,
    backFilenames: context.backFilenames,
    seriesTitle: SERIES_TITLES[DEFAULT_SERIES_ID],
  });

  if (!job) {
    return null;
  }

  return {
    frontPortraitUrl: job.frontUrl,
    backPortraitUrl: job.backUrl,
    design: job.design,
    meta: job.meta,
  };
}