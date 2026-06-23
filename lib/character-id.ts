/** Canonical 3-digit character id (001, 004, 010, …). */
export function normalizeCharacterId(id: string | number): string {
  const digits = String(id).replace(/\D/g, "");
  if (digits.length > 0) {
    return digits.padStart(3, "0");
  }
  return String(id);
}

export function characterIdsMatch(
  a: string | number,
  b: string | number
): boolean {
  return normalizeCharacterId(a) === normalizeCharacterId(b);
}
