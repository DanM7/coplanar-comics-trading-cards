/** Scales rgba/hex glow color alpha by `factor` (1 = preset default). */
export function scaleBorderGlowColor(color: string, factor: number): string {
  const clamped = Math.min(2, Math.max(0, factor));
  const rgbaMatch = color.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i
  );
  if (rgbaMatch) {
    const alpha = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${Math.min(1, alpha * clamped)})`;
  }
  return color;
}

export function borderCssVarsWithGlow(
  cssVars: Record<string, string>,
  glowPercent: number
): Record<string, string> {
  const strength = Math.min(200, Math.max(0, glowPercent)) / 100;
  const glow = cssVars["--border-glow"];
  return {
    ...cssVars,
    "--border-glow-strength": String(strength),
    ...(glow ? { "--border-glow": scaleBorderGlowColor(glow, strength) } : {}),
  };
}
