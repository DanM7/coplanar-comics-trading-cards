import { characterToCardStats, getAllCharacters } from "@/lib/cards-loader";
import {
  cardPrintHasCustomFrontBorder,
  resolveCardPrintBackFilename,
  resolveCardPrintFrontFilename,
} from "@/lib/card-print-assets";
import { getCardPrintDefinitions } from "@/lib/card-editor-designs-loader";
import { getCharacterMoveById, moveDisplaysFromRecord } from "@/lib/character-moves-loader";
import { getCharacterStatRecordById } from "@/lib/character-stats-loader";
import { characterIdsMatch } from "@/lib/character-id";
import {
  formatCardPrintId,
  formatCardSeriesFooter,
} from "@/lib/format-card-series-footer";
import { cardPrintPngFilename } from "@/lib/card-export-filenames";
import {
  buildRawAssetApiUrl,
  listRawAssetFilenames,
  parseRawFrontFilename,
} from "@/lib/raw-assets";
import { SERIES_TITLES, DEFAULT_SERIES_ID } from "@/constants/series";
import {
  DEFAULT_CARD_DESIGN,
  normalizeCardDesign,
  type CardDesignConfig,
} from "@/types/card-design";
import type { CardPrintDefinition } from "@/types/card-editor-designs";
import type { Alignment, Character } from "@/types/character";
import type { EditorCardMeta } from "@/components/editor/EditableCardFace";

export interface CardExportJob {
  printId: string;
  characterName: string;
  frontUrl: string;
  backUrl: string;
  frontFilename: string;
  backFilename: string;
  design: CardDesignConfig;
  meta: EditorCardMeta;
}

function alignmentBorderPatch(
  alignment: Alignment
): Partial<CardDesignConfig["front"]> | null {
  if (alignment === "Evil") {
    return { borderId: "boss-crimson" };
  }
  if (alignment === "Good") {
    return { borderId: "hero-azure" };
  }
  return null;
}

function withFrontDefaults(design: CardDesignConfig): CardDesignConfig {
  return normalizeCardDesign({
    ...design,
    front: {
      ...design.front,
      layoutId: "front-minimal",
      fontId: "rounded-friendly",
    },
    back: {
      ...design.back,
      fontId: "rounded-friendly",
    },
  });
}

function mergeCardPrintDesignFromRepo(
  cardPrint: CardPrintDefinition
): CardDesignConfig {
  return normalizeCardDesign({
    ...DEFAULT_CARD_DESIGN,
    ...(cardPrint.design ?? {}),
  });
}

function metaFromCharacter(character: Character): EditorCardMeta {
  return {
    displayName: character.name,
    cardId: character.id,
    alignment: character.alignment,
    tier: character.tier,
    realm: character.home_region,
    home_plane: character.home_plane,
    home_location: character.home_location,
    home_district: character.home_district,
    type: character.type,
    identity: character.identity,
    description: character.description,
    flavorText: "",
    seriesFooterLine: "",
    stats: characterToCardStats(character),
  };
}

export function resolveCardExportJob(
  cardPrint: CardPrintDefinition,
  options: {
    characters: Character[];
    frontFilenames: string[];
    backFilenames: string[];
    seriesTitle?: string;
  }
): CardExportJob | null {
  const character = options.characters.find((entry) =>
    characterIdsMatch(entry.id, cardPrint.character)
  );
  if (!character) {
    return null;
  }

  const frontAssets = options.frontFilenames.map((filename) => {
    const { sortKey, displayName } = parseRawFrontFilename(filename);
    return { filename, sortKey, displayName };
  });

  const frontFilename = resolveCardPrintFrontFilename(
    cardPrint,
    character.id,
    frontAssets
  );
  const backFilename = resolveCardPrintBackFilename(
    cardPrint,
    character,
    options.backFilenames
  );

  if (!frontFilename || !backFilename) {
    return null;
  }

  let design = mergeCardPrintDesignFromRepo(cardPrint);
  const border = alignmentBorderPatch(character.alignment);
  if (border && !cardPrintHasCustomFrontBorder(cardPrint)) {
    design = {
      ...design,
      front: { ...design.front, ...border },
      back: { ...design.back, ...border },
    };
  }
  design = withFrontDefaults(design);

  const statRecord = getCharacterStatRecordById(character.id);
  const moveRecord = getCharacterMoveById(character.id);
  const seriesTitle =
    options.seriesTitle ?? SERIES_TITLES[DEFAULT_SERIES_ID];

  const meta: EditorCardMeta = {
    ...metaFromCharacter(character),
    tier: statRecord?.tier ?? character.tier,
    stats: statRecord
      ? {
          strength: statRecord.stats.strength,
          speed: statRecord.stats.speed,
          intelligence: statRecord.stats.intelligence,
          durability: statRecord.stats.durability,
          energy_projection: statRecord.stats.energy_projection,
          skill: statRecord.stats.skill,
        }
      : characterToCardStats(character),
    moves: moveRecord ? moveDisplaysFromRecord(moveRecord) : [],
    seriesFooterLine: formatCardSeriesFooter(
      cardPrint.id,
      cardPrint.rarity,
      seriesTitle
    ),
  };

  const formattedPrintId = formatCardPrintId(cardPrint.id);

  return {
    printId: formattedPrintId,
    characterName: character.name,
    frontUrl: buildRawAssetApiUrl("front", frontFilename),
    backUrl: buildRawAssetApiUrl("back", backFilename),
    frontFilename: cardPrintPngFilename(formattedPrintId, "front"),
    backFilename: cardPrintPngFilename(formattedPrintId, "back"),
    design,
    meta,
  };
}

export async function listCardExportJobs(input?: {
  status?: string;
  printIds?: string[];
}): Promise<CardExportJob[]> {
  const [frontFilenames, backFilenames] = await Promise.all([
    listRawAssetFilenames("front"),
    listRawAssetFilenames("back"),
  ]);
  const characters = getAllCharacters();
  const seriesTitle = SERIES_TITLES[DEFAULT_SERIES_ID];

  const prints = getCardPrintDefinitions().filter((print) => {
    if (input?.printIds?.length) {
      const formatted = formatCardPrintId(print.id);
      if (!input.printIds.includes(formatted) && !input.printIds.includes(String(print.id))) {
        return false;
      }
    }
    if (!input?.status) {
      return true;
    }
    return (print.status ?? "").trim().toLowerCase() === input.status.toLowerCase();
  });

  const jobs: CardExportJob[] = [];
  for (const print of prints) {
    const job = resolveCardExportJob(print, {
      characters,
      frontFilenames,
      backFilenames,
      seriesTitle,
    });
    if (job) {
      jobs.push(job);
    }
  }

  return jobs;
}
