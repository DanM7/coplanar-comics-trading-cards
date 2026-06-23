import { normalizeCharacterId } from "@/lib/character-id";
import type { Character } from "@/types/character";

export type RawAssetVariant = "front" | "back";

export function characterNameToFileSlug(name: string): string {
  return name.trim().replace(/\s+/g, "_");
}

export function expectedRawBackBasename(
  characterId: string,
  characterName: string
): string {
  const id = normalizeCharacterId(characterId);
  const slug = characterNameToFileSlug(characterName);
  return `og_${id}_${slug}`;
}

export function parseRawFrontFilename(filename: string): {
  sortKey: string;
  displayName: string;
} {
  const base = filename.replace(/\.[^.]+$/, "");
  const match = base.match(/^(\d+)_(.+)$/);
  if (match) {
    return {
      sortKey: normalizeCharacterId(match[1]),
      displayName: match[2].replace(/_/g, " "),
    };
  }
  return { sortKey: base, displayName: base.replace(/_/g, " ") };
}

export function parseRawBackFilename(filename: string): {
  sortKey: string;
  displayName: string;
} {
  const base = filename.replace(/\.[^.]+$/, "");
  const match = base.match(/^og_(\d+)_(.+)$/i);
  if (match) {
    return {
      sortKey: normalizeCharacterId(match[1]),
      displayName: match[2].replace(/_/g, " "),
    };
  }
  return { sortKey: base, displayName: base.replace(/_/g, " ") };
}

/** @deprecated Use parseRawFrontFilename */
export const parseRawFilename = parseRawFrontFilename;

export function parseRawAssetFilename(
  variant: RawAssetVariant,
  filename: string
) {
  return variant === "back"
    ? parseRawBackFilename(filename)
    : parseRawFrontFilename(filename);
}

export function buildRawAssetApiUrl(
  variant: RawAssetVariant,
  filename: string
): string {
  const segment =
    variant === "front" ? "raw-front-assets" : "raw-back-assets";
  return `/api/dev/${segment}/${encodeURIComponent(filename)}`;
}

export function findRawBackFilenameForCharacter(
  character: Pick<Character, "id" | "name">,
  filenames: string[]
): string | null {
  if (filenames.length === 0) return null;

  const expectedBase = expectedRawBackBasename(character.id, character.name);
  const exact = filenames.find((f) => {
    const base = f.replace(/\.[^.]+$/, "");
    return base.toLowerCase() === expectedBase.toLowerCase();
  });
  if (exact) return exact;

  const id = normalizeCharacterId(character.id);
  const prefix = `og_${id}_`.toLowerCase();
  return (
    filenames.find((f) => {
      const base = f.replace(/\.[^.]+$/, "").toLowerCase();
      return base.startsWith(prefix);
    }) ?? null
  );
}

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

export function isRawImageFilename(filename: string): boolean {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXT.has(ext);
}
