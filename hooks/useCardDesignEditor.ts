"use client";



import { useCallback, useEffect, useState } from "react";

import {
  cardPrintHasCustomFrontBorder,
  imageUrlsForCardPrint,
  resolveCardPrintBackFilename,
  resolveCardPrintFrontFilename,
} from "@/lib/card-print-assets";
import {
  preloadImageUrls,
  preloadImageUrlsIdle,
} from "@/lib/preload-images";

import {
  DEFAULT_CARD_DESIGN,
  normalizeCardDesign,
  type CardDesignConfig,
  type CardSide,
  type RawAssetEntry,
} from "@/types/card-design";

import { characterIdsMatch, normalizeCharacterId } from "@/lib/character-id";
import { characterToCardStats } from "@/lib/cards-loader";
import { SERIES_TITLES, DEFAULT_SERIES_ID } from "@/constants/series";
import {
  getCardPrintById,
  storageKeyForCardPrint,
} from "@/lib/card-editor-designs-loader";
import {
  readEditorCardPrintIdFromUrl,
  writeEditorCardPrintIdToUrl,
} from "@/lib/editor-query";
import {
  formatCardPrintId,
  formatCardSeriesFooter,
} from "@/lib/format-card-series-footer";
import {
  buildRepoExportPayload,
  mergeCardPrintDesign,
} from "@/lib/merge-character-design";
import type { CardPrintDefinition } from "@/types/card-editor-designs";
import type { CardStats } from "@/types/card";
import type { Alignment, Character } from "@/types/character";
import type { CharacterMoveRecord } from "@/types/character-moves";
import type { CharacterStatRecord } from "@/types/character-stats";



const STORAGE_PREFIX = "coplanar-comics-card-design:";



/** Default character when the editor opens */

export const DEFAULT_EDITOR_CHARACTER_ID = "6";

/** Default card print (Abstract common) when the editor opens */

export const DEFAULT_EDITOR_CARD_PRINT_ID = "6";



export interface EditorMeta {

  displayName: string;

  cardId: string;

  alignment: string;

  tier: number;

  realm: Character["home_region"];

  home_plane: Character["home_plane"];
  home_location: string;
  home_district: string;
  type?: string;
  identity?: string;

  description: string;

  flavorText: string;
  stats: CardStats;
  seriesFooterLine: string;
}



const DEFAULT_META: EditorMeta = {

  displayName: "Character",

  cardId: "000",

  alignment: "Neutral",

  tier: 1,

  realm: "Human Realm",

  home_plane: "Human",
  home_location: "Coplanar Plains",
  home_district: "",

  description: "Character description for card back preview.",

  flavorText: "",
  seriesFooterLine: "",
  stats: {
    strength: null,
    speed: null,
    intelligence: null,
    durability: null,
    energy_projection: null,
    skill: null,
  },
};



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



export function metaFromCharacter(character: Character): EditorMeta {

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



export function alignmentBorderPatch(

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



function resolveBackFilename(
  cardPrint: CardPrintDefinition,
  character: Character,
  backAssets: RawAssetEntry[]
): string | null {
  return resolveCardPrintBackFilename(
    cardPrint,
    character,
    backAssets.map((a) => a.filename)
  );
}

function resolveCardPrintSelection(
  cardPrint: CardPrintDefinition,
  characters: Character[],
  frontAssets: RawAssetEntry[],
  backAssets: RawAssetEntry[],
  seriesTitle: string
) {
  const character = characters.find((c) =>
    characterIdsMatch(c.id, cardPrint.character)
  );

  if (!character) return null;

  const frontFilename = resolveCardPrintFrontFilename(
    cardPrint,
    character.id,
    frontAssets
  );

  let design = mergeCardPrintDesign(
    cardPrint,
    character.id,
    frontFilename
  );

  const border = alignmentBorderPatch(character.alignment);

  if (border && !cardPrintHasCustomFrontBorder(cardPrint)) {
    design = {
      ...design,
      front: { ...design.front, ...border },
      back: { ...design.back, ...border },
    };
  }

  return {
    cardPrint,
    character,
    frontFilename,
    backFilename: resolveBackFilename(cardPrint, character, backAssets),
    meta: {
      ...metaFromCharacter(character),
      seriesFooterLine: formatCardSeriesFooter(
        cardPrint.id,
        cardPrint.rarity,
        seriesTitle
      ),
    },
    design: withFrontDefaults(normalizeCardDesign(design)),
  };
}

function resolveCharacterSelection(
  characterId: string,
  characters: Character[],
  frontAssets: RawAssetEntry[],
  backAssets: RawAssetEntry[],
  cardPrints: CardPrintDefinition[],
  seriesTitle: string
) {
  const character = characters.find((c) => c.id === characterId);
  if (!character) return null;

  const cardPrint =
    cardPrints.find((p) => characterIdsMatch(p.character, characterId)) ??
    getCardPrintById(characterId);

  if (!cardPrint) return null;

  return resolveCardPrintSelection(
    cardPrint,
    characters,
    frontAssets,
    backAssets,
    seriesTitle
  );
}



export function useCardDesignEditor() {

  const [frontAssets, setFrontAssets] = useState<RawAssetEntry[]>([]);

  const [backAssets, setBackAssets] = useState<RawAssetEntry[]>([]);

  const [characters, setCharacters] = useState<Character[]>([]);

  const [statRecords, setStatRecords] = useState<CharacterStatRecord[]>([]);

  const [moveRecords, setMoveRecords] = useState<CharacterMoveRecord[]>([]);

  const [cardPrints, setCardPrints] = useState<CardPrintDefinition[]>([]);

  const [selectedCardPrintId, setSelectedCardPrintId] = useState<string | null>(
    null
  );

  const [selectedFrontFilename, setSelectedFrontFilename] = useState<

    string | null

  >(null);

  const [selectedBackFilename, setSelectedBackFilename] = useState<

    string | null

  >(null);

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(

    null

  );

  const [activeSide, setActiveSide] = useState<CardSide>("back");

  const [design, setDesign] = useState<CardDesignConfig>(DEFAULT_CARD_DESIGN);

  const [meta, setMeta] = useState<EditorMeta>(DEFAULT_META);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);



  const seriesTitle = SERIES_TITLES[DEFAULT_SERIES_ID];

  const applyResolved = useCallback(
    (resolved: NonNullable<ReturnType<typeof resolveCardPrintSelection>>) => {
      setSelectedCardPrintId(resolved.cardPrint.id);
      setSelectedCharacterId(resolved.character.id);
      setMeta(resolved.meta);
      setDesign(resolved.design);
      if (resolved.frontFilename) {
        setSelectedFrontFilename(resolved.frontFilename);
      }
      setSelectedBackFilename(resolved.backFilename);
    },
    []
  );

  const selectCardPrint = useCallback(
    (cardPrintId: string) => {
      const cardPrint = getCardPrintById(cardPrintId) ??
        cardPrints.find((p) => p.id === cardPrintId);
      if (!cardPrint) return;

      const resolved = resolveCardPrintSelection(
        cardPrint,
        characters,
        frontAssets,
        backAssets,
        seriesTitle
      );
      if (!resolved) return;
      applyResolved(resolved);
    },
    [cardPrints, characters, frontAssets, backAssets, seriesTitle, applyResolved]
  );

  const selectCharacter = useCallback(
    (characterId: string) => {
      const resolved = resolveCharacterSelection(
        characterId,
        characters,
        frontAssets,
        backAssets,
        cardPrints,
        seriesTitle
      );
      if (!resolved) return;
      applyResolved(resolved);
    },
    [
      characters,
      frontAssets,
      backAssets,
      cardPrints,
      seriesTitle,
      applyResolved,
    ]
  );

  const selectAdjacentCardPrint = useCallback(
    (delta: -1 | 1) => {
      if (cardPrints.length === 0) return;

      const currentIndex = selectedCardPrintId
        ? cardPrints.findIndex(
            (p) =>
              formatCardPrintId(p.id) === formatCardPrintId(selectedCardPrintId)
          )
        : -1;

      const nextIndex =
        currentIndex < 0
          ? delta === 1
            ? 0
            : cardPrints.length - 1
          : (currentIndex + delta + cardPrints.length) % cardPrints.length;

      selectCardPrint(cardPrints[nextIndex].id);
    },
    [cardPrints, selectedCardPrintId, selectCardPrint]
  );

  const selectAdjacentCharacter = selectAdjacentCardPrint;

  const selectRawFrontAsset = useCallback(

    (filename: string) => {

      const asset = frontAssets.find((a) => a.filename === filename);

      if (!asset) return;



      const character = characters.find((c) =>

        characterIdsMatch(c.id, asset.sortKey)

      );

      if (character) {

        const resolved = resolveCharacterSelection(
          character.id,
          characters,
          frontAssets,
          backAssets,
          cardPrints,
          seriesTitle
        );

        if (resolved) {
          applyResolved(resolved);
          setSelectedFrontFilename(resolved.frontFilename ?? filename);
          return;
        }
      }

      setSelectedFrontFilename(filename);
      setSelectedCharacterId(null);
      setSelectedCardPrintId(null);
      setSelectedBackFilename(null);
      setDesign(withFrontDefaults(mergeCardPrintDesign(null, null, filename)));
      setMeta({
        ...DEFAULT_META,
        displayName: asset.displayName,
        cardId: asset.sortKey,
        seriesFooterLine: formatCardSeriesFooter(
          asset.sortKey,
          "common",
          seriesTitle
        ),
        stats: {
          strength: null,
          speed: null,
          intelligence: null,
          durability: null,
          energy_projection: null,
          skill: null,
        },
      });
    },
    [
      frontAssets,
      backAssets,
      characters,
      cardPrints,
      seriesTitle,
      applyResolved,
    ]
  );



  const selectRawBackAsset = useCallback((filename: string) => {

    if (!backAssets.some((a) => a.filename === filename)) return;

    setSelectedBackFilename(filename);

  }, [backAssets]);



  useEffect(() => {
    async function devFetchJson<T>(url: string): Promise<T | null> {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) return null;
        return (await response.json()) as T;
      } catch {
        return null;
      }
    }

    void (async () => {
      try {
        const [
          frontData,
          backData,
          descriptionsData,
          statsFileData,
          movesData,
          cardPrintsData,
        ] = await Promise.all([
          devFetchJson<{ assets: RawAssetEntry[] }>(
            "/api/dev/raw-front-assets"
          ),
          devFetchJson<{ assets: RawAssetEntry[] }>("/api/dev/raw-back-assets"),
          devFetchJson<{ descriptions: Character[] }>(
            "/api/dev/character-descriptions"
          ),
          devFetchJson<{ stats: CharacterStatRecord[] }>(
            "/api/dev/character-stats"
          ),
          devFetchJson<{ moves: CharacterMoveRecord[] }>(
            "/api/dev/character-moves"
          ),
          devFetchJson<{ cards: CardPrintDefinition[] }>(
            "/api/dev/card-editor-designs"
          ),
        ]);

        const loadedCharacters = descriptionsData?.descriptions ?? [];
        const loadedCardPrints = cardPrintsData?.cards ?? [];
        const loadedFrontAssets = frontData?.assets ?? [];
        const loadedBackAssets = backData?.assets ?? [];

        if (loadedCharacters.length === 0) {
          setLoadError(
            descriptionsData
              ? "No characters found in data/character_descriptions.json."
              : "Could not load character data from /api/dev/character-descriptions. Use npm run dev (not npm start) or set ENABLE_CARD_EDITOR=true in .env, then restart the server."
          );
        } else {
          setLoadError(null);
        }

        setCardPrints(loadedCardPrints);
        setStatRecords(statsFileData?.stats ?? []);
        setMoveRecords(movesData?.moves ?? []);
        setCharacters(loadedCharacters);
        setFrontAssets(loadedFrontAssets);
        setBackAssets(loadedBackAssets);

        const title = SERIES_TITLES[DEFAULT_SERIES_ID];

        if (loadedCardPrints.length > 0) {
          const urlCardPrintId = readEditorCardPrintIdFromUrl();
          const printFromUrl = urlCardPrintId
            ? loadedCardPrints.find(
                (p) =>
                  formatCardPrintId(p.id) === formatCardPrintId(urlCardPrintId)
              )
            : undefined;

          const defaultPrint =
            printFromUrl ??
            loadedCardPrints.find(
              (p) =>
                formatCardPrintId(p.id) ===
                formatCardPrintId(DEFAULT_EDITOR_CARD_PRINT_ID)
            ) ??
            loadedCardPrints.find((p) =>
              characterIdsMatch(p.character, DEFAULT_EDITOR_CHARACTER_ID)
            ) ??
            loadedCardPrints[0];

          const resolved = resolveCardPrintSelection(
            defaultPrint,
            loadedCharacters,
            loadedFrontAssets,
            loadedBackAssets,
            title
          );

          if (resolved) {
            setSelectedCardPrintId(resolved.cardPrint.id);
            setSelectedCharacterId(resolved.character.id);
            setMeta(resolved.meta);
            setDesign(resolved.design);
            if (resolved.frontFilename) {
              setSelectedFrontFilename(resolved.frontFilename);
            }
            setSelectedBackFilename(resolved.backFilename);
          }
        } else if (loadedCharacters.length > 0) {
          const defaultId = normalizeCharacterId(DEFAULT_EDITOR_CHARACTER_ID);
          const defaultCharacter =
            loadedCharacters.find((c) => c.id === defaultId) ??
            loadedCharacters[0];

          const resolved = resolveCharacterSelection(
            defaultCharacter.id,
            loadedCharacters,
            loadedFrontAssets,
            loadedBackAssets,
            [],
            title
          );

          if (resolved) {
            setSelectedCardPrintId(resolved.cardPrint.id);
            setSelectedCharacterId(resolved.character.id);
            setMeta(resolved.meta);
            setDesign(resolved.design);
            if (resolved.frontFilename) {
              setSelectedFrontFilename(resolved.frontFilename);
            }
            setSelectedBackFilename(resolved.backFilename);
          }
        } else if (loadedFrontAssets.length > 0) {
          setSelectedFrontFilename(loadedFrontAssets[0].filename);
          setDesign(
            withFrontDefaults(
              mergeCardPrintDesign(null, null, loadedFrontAssets[0].filename)
            )
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    writeEditorCardPrintIdToUrl(selectedCardPrintId);
  }, [loading, selectedCardPrintId]);

  useEffect(() => {
    if (loading || (frontAssets.length === 0 && backAssets.length === 0)) {
      return;
    }

    const urls = [
      ...frontAssets.map((asset) => asset.url),
      ...backAssets.map((asset) => asset.url),
    ];

    return preloadImageUrlsIdle(urls);
  }, [loading, frontAssets, backAssets]);

  useEffect(() => {
    if (cardPrints.length === 0 || characters.length === 0) {
      return;
    }

    const currentIndex = selectedCardPrintId
      ? cardPrints.findIndex(
          (print) =>
            formatCardPrintId(print.id) ===
            formatCardPrintId(selectedCardPrintId)
        )
      : 0;

    if (currentIndex < 0) {
      return;
    }

    const neighborIndexes = [-2, -1, 1, 2].map(
      (delta) =>
        (currentIndex + delta + cardPrints.length) % cardPrints.length
    );

    const urls = neighborIndexes.flatMap((index) =>
      imageUrlsForCardPrint(
        cardPrints[index],
        characters,
        frontAssets,
        backAssets
      )
    );

    preloadImageUrls(urls);
  }, [
    selectedCardPrintId,
    cardPrints,
    characters,
    frontAssets,
    backAssets,
  ]);



  const selectedFrontAsset = frontAssets.find(

    (a) => a.filename === selectedFrontFilename

  );

  const selectedBackAsset = backAssets.find(

    (a) => a.filename === selectedBackFilename

  );

  const selectedCharacter = characters.find(

    (c) => c.id === selectedCharacterId

  );

  const selectedStatRecord = statRecords.find(

    (r) => r.id === selectedCharacterId

  );

  const selectedMoveRecord = moveRecords.find(
    (r) => r.id === selectedCharacterId
  );

  const metaLocked = Boolean(selectedCharacter);



  const updateSideDesign = useCallback(

    (side: CardSide, patch: Partial<CardDesignConfig["front"]>) => {

      setDesign((prev) => ({

        ...prev,

        [side]: { ...prev[side], ...patch },

      }));

    },

    []

  );



  const updateDesign = useCallback((patch: Partial<CardDesignConfig>) => {

    setDesign((prev) => normalizeCardDesign({ ...prev, ...patch }));

  }, []);



  const updateMeta = useCallback((patch: Partial<EditorMeta>) => {

    setMeta((prev) => ({ ...prev, ...patch }));

  }, []);



  const selectedCardPrint =
    (selectedCardPrintId ? getCardPrintById(selectedCardPrintId) : undefined) ??
    cardPrints.find(
      (p) =>
        selectedCardPrintId &&
        formatCardPrintId(p.id) === formatCardPrintId(selectedCardPrintId)
    );

  const saveToLocalStorage = useCallback(() => {
    const key = selectedCardPrintId
      ? storageKeyForCardPrint(selectedCardPrintId)
      : selectedFrontFilename;

    if (!key) return;

    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(design));
  }, [selectedCardPrintId, selectedFrontFilename, design]);

  const exportJson = useCallback(() => {
    if (!selectedCardPrint) return;

    const payload = buildRepoExportPayload(selectedCardPrint, design, {
      frontFilename: selectedFrontFilename,
      backFilename: selectedBackFilename,
    });

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `card-print-${formatCardPrintId(selectedCardPrint.id)}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    selectedFrontFilename,
    selectedBackFilename,
    selectedCardPrint,
    design,
  ]);



  const resetDesign = useCallback(() => {

    let next = withFrontDefaults({ ...DEFAULT_CARD_DESIGN });

    if (selectedCharacter) {

      const border = alignmentBorderPatch(selectedCharacter.alignment);

      if (border) {

        next = {

          ...next,

          front: { ...next.front, ...border },

          back: { ...next.back, ...border },

        };

      }

    }

    setDesign(next);

  }, [selectedCharacter]);



  return {

    frontAssets,

    backAssets,

    characters,

    cardPrints,

    selectedCardPrintId,

    selectedCardPrint,

    selectCardPrint,

    selectAdjacentCardPrint,

    selectedFrontFilename,

    selectRawFrontAsset,

    selectedBackFilename,

    selectRawBackAsset,

    selectedCharacterId,

    selectCharacter,

    selectAdjacentCharacter,

    selectedCharacter,

    selectedStatRecord,

    selectedMoveRecord,

    statRecords,

    moveRecords,

    selectedFrontAsset,

    selectedBackAsset,

    metaLocked,

    activeSide,

    setActiveSide,

    design,

    meta,

    loading,

    loadError,

    updateSideDesign,

    updateDesign,

    updateMeta,

    saveToLocalStorage,

    exportJson,

    resetDesign,

    /** @deprecated Use frontAssets */

    assets: frontAssets,

    /** @deprecated Use selectedFrontFilename */

    selectedFilename: selectedFrontFilename,

    /** @deprecated Use selectRawFrontAsset */

    selectRawAsset: selectRawFrontAsset,

    /** @deprecated Use selectedFrontAsset */

    selectedAsset: selectedFrontAsset,

  };

}

