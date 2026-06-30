import { normalizeCharacterId } from "@/lib/character-id";

export const PLAY_TEAM_QUERY_KEY = "team";
export const PLAY_TEAM_SLOT_COUNT = 3;

const TEAM_ID_PATTERN = /^\d{3}$/;

/** Parse `?team=004,038,050` — exactly three comma-separated 3-digit ids, no duplicates. */
export function parsePlayTeamQuery(
  raw: string | null | undefined
): string[] | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const parts = trimmed.split(",").map((part) => part.trim());
  if (parts.length !== PLAY_TEAM_SLOT_COUNT) {
    return null;
  }

  if (parts.some((part) => !TEAM_ID_PATTERN.test(part))) {
    return null;
  }

  const normalized = parts.map((part) => normalizeCharacterId(part));
  if (new Set(normalized).size !== PLAY_TEAM_SLOT_COUNT) {
    return null;
  }

  return normalized;
}

/** Format roster ids for `?team=` (always 3-digit, comma-separated). */
export function formatPlayTeamQuery(characterIds: string[]): string {
  return characterIds.map((id) => normalizeCharacterId(id)).join(",");
}

export function playPathWithTeam(characterIds: string[]): string {
  const params = new URLSearchParams();
  params.set(PLAY_TEAM_QUERY_KEY, formatPlayTeamQuery(characterIds));
  return `/play?${params.toString()}`;
}

export function invalidPlayTeamQueryMessage(
  raw: string | null | undefined
): string | null {
  if (raw === null || raw === undefined || !raw.trim()) {
    return null;
  }

  if (parsePlayTeamQuery(raw) !== null) {
    return null;
  }

  return (
    "Invalid ?team= parameter. Use exactly three 3-digit fighter ids " +
    "separated by commas, e.g. ?team=004,038,050."
  );
}
