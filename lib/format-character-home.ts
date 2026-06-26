import type { Alignment, CharacterType, HomePlane } from "@/types/character";

export const CHARACTER_TYPE_IDENTITY_LABELS: Record<CharacterType, string> = {
  Human: "Real Name",
  Superhuman: "Real Name",
  Robot: "Inventor / Manufacturer",
  Cyborg: "Original Identity",
  Construct: "Origin",
  Cartoon: "Animator",
  Creature: "Species",
};

/** First type when `type` is a hybrid like `Construct / Cartoon`. */
export function primaryCharacterType(
  type: CharacterType | string | undefined
): string | undefined {
  if (!type) {
    return undefined;
  }

  const trimmed = type.trim();
  const slashIndex = trimmed.indexOf(" / ");
  if (slashIndex >= 0) {
    return trimmed.slice(0, slashIndex).trim();
  }

  return trimmed;
}

export function identityLabelForCharacterType(
  type: CharacterType | string | undefined
): string {
  const primary = primaryCharacterType(type);
  if (!primary) {
    return "Identity";
  }

  return (
    CHARACTER_TYPE_IDENTITY_LABELS[primary as CharacterType] ?? "Identity"
  );
}

/** e.g. `Type: Creature • Species: Trombonophis Barbitailus` */
export function formatCharacterTypeIdentityLine(input: {
  type?: string;
  identity?: string;
}): string {
  const type = (input.type ?? "").trim();
  const identity = (input.identity ?? "").trim();

  return `Type: ${type} • ${identity}`;
}

function normalizeCardId(cardId: string): string {
  return cardId.replace(/^#/, "");
}

/** e.g. `#004 • Alignment: Good • Plane: Human` */
export function formatCharacterBackIdLine(input: {
  cardId: string;
  alignment: Alignment;
  home_plane: HomePlane;
}): string {
  const id = normalizeCardId(input.cardId);
  return `#${id} • Alignment: ${input.alignment} • Plane: ${input.home_plane}`;
}

/** e.g. `Home: Coplanar City › Realspace Row` */
export function formatCharacterHomeBreadcrumb(input: {
  home_location?: string;
  home_district?: string;
}): string {
  const breadcrumb = [
    (input.home_location ?? "").trim(),
    (input.home_district ?? "").trim(),
  ].filter((segment) => segment.length > 0);

  if (breadcrumb.length === 0) {
    return "Home: —";
  }

  return `Home: ${breadcrumb.join(" › ")}`;
}

export function formatCharacterBackHeaderLines(input: {
  cardId: string;
  alignment: Alignment;
  home_plane: HomePlane;
  home_location?: string;
  home_district?: string;
  type?: string;
  identity?: string;
}): { idAlignmentLine: string; homeLine: string; typeIdentityLine: string } {
  return {
    idAlignmentLine: formatCharacterBackIdLine({
      cardId: input.cardId,
      alignment: input.alignment,
      home_plane: input.home_plane,
    }),
    homeLine: formatCharacterHomeBreadcrumb({
      home_location: input.home_location,
      home_district: input.home_district,
    }),
    typeIdentityLine: formatCharacterTypeIdentityLine({
      type: input.type,
      identity: input.identity,
    }),
  };
}
