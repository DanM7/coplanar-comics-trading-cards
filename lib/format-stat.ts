export function formatStatValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return String(value);
}
