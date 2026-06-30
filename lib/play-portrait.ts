import { normalizeCharacterId } from "@/lib/character-id";
import { portraitUrlForCharacter } from "@/lib/character-portrait-url";

/** Public play-mode portrait URL (raw front art, no card frame). */
export function playPortraitPublicUrl(characterId: string): string {
  return `/api/play/portrait/${encodeURIComponent(normalizeCharacterId(characterId))}`;
}

/** Resolve raw front portrait URL for roster/battle (play API, not finished card PNG). */
export function resolvePlayPortraitUrl(characterId: string): string | null {
  if (!portraitUrlForCharacter(characterId)) {
    return null;
  }
  return playPortraitPublicUrl(characterId);
}
