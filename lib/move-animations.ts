import type { Alignment } from "@/types/character";
import type {
  AttackAnimationEffect,
  EnergyColorSource,
  MoveAnimationConfig,
  MoveAnimationOverrides,
  MoveAnimationsConfig,
  MoveAttackType,
} from "@/types/character-moves";

export const DEFAULT_MOVE_ANIMATIONS: MoveAnimationsConfig = {
  nameRules: [
    { contains: "slam", effects: ["shake"] },
    { contains: "smash", effects: ["shake"] },
    { contains: "bash", effects: ["shake"] },
    { contains: "stomp", effects: ["shake"] },
    { contains: "quake", effects: ["shake"] },
    { contains: "headbutt", effects: ["shake"] },
    { contains: "ram", effects: ["shake"] },
  ],
  energyDefaults: {
    colorSource: "character",
  },
  weaponColorRules: [],
  fallbacks: {
    physical: ["lunge"],
    energy: ["pulse", "flash"],
  },
};

const ALIGNMENT_ENERGY_COLORS: Record<Alignment, string> = {
  Good: "#48bb78",
  Evil: "#fc8181",
  Neutral: "#f6e05e",
  Team: "#63b3ed",
};

function normalizeMoveName(moveName: string): string {
  return moveName.trim().toLowerCase();
}

function dedupeEffects(effects: AttackAnimationEffect[]): AttackAnimationEffect[] {
  return [...new Set(effects)];
}

export function effectsFromMoveName(
  moveName: string,
  config: MoveAnimationsConfig = DEFAULT_MOVE_ANIMATIONS
): AttackAnimationEffect[] {
  const normalized = normalizeMoveName(moveName);
  if (!normalized) {
    return [];
  }

  const matched: AttackAnimationEffect[] = [];
  for (const rule of config.nameRules) {
    if (normalized.includes(rule.contains.trim().toLowerCase())) {
      matched.push(...rule.effects);
    }
  }

  return dedupeEffects(matched);
}

export function weaponColorFromMoveName(
  moveName: string,
  config: MoveAnimationsConfig = DEFAULT_MOVE_ANIMATIONS
): string | undefined {
  const normalized = normalizeMoveName(moveName);
  if (!normalized) {
    return undefined;
  }

  for (const rule of config.weaponColorRules ?? []) {
    if (normalized.includes(rule.contains.trim().toLowerCase())) {
      return rule.color;
    }
  }

  return undefined;
}

export function resolveMoveAnimation(input: {
  moveName: string;
  attackType: MoveAttackType;
  overrides?: MoveAnimationOverrides;
  config?: MoveAnimationsConfig;
}): MoveAnimationConfig {
  const config = input.config ?? DEFAULT_MOVE_ANIMATIONS;
  const overrides = input.overrides ?? {};
  let effects =
    overrides.effects && overrides.effects.length > 0
      ? dedupeEffects(overrides.effects)
      : effectsFromMoveName(input.moveName, config);

  if (effects.length === 0) {
    effects = dedupeEffects(
      config.fallbacks?.[input.attackType] ??
        config.fallbacks?.physical ??
        DEFAULT_MOVE_ANIMATIONS.fallbacks?.[input.attackType] ??
        ["lunge"]
    );
  }

  const energyColorSource =
    overrides.energyColorSource ??
    config.energyDefaults.colorSource ??
    "character";

  return {
    effects,
    energyColor: overrides.energyColor,
    energyColorSource,
  };
}

export function alignmentEnergyFallbackColor(alignment: Alignment): string {
  return ALIGNMENT_ENERGY_COLORS[alignment] ?? ALIGNMENT_ENERGY_COLORS.Neutral;
}

export function resolveEnergyAttackColor(input: {
  moveName: string;
  animation: MoveAnimationConfig;
  characterColor?: string | null;
  alignment: Alignment;
  config?: MoveAnimationsConfig;
}): string {
  if (input.animation.energyColor) {
    return input.animation.energyColor;
  }

  if (input.animation.energyColorSource === "weapon") {
    return (
      weaponColorFromMoveName(input.moveName, input.config) ??
      alignmentEnergyFallbackColor(input.alignment)
    );
  }

  return input.characterColor ?? alignmentEnergyFallbackColor(input.alignment);
}

export function overridesFromMoveSlot(
  record: {
    move1_effects?: AttackAnimationEffect[];
    move1_energy_color?: string;
    move1_energy_color_source?: EnergyColorSource;
    move2_effects?: AttackAnimationEffect[];
    move2_energy_color?: string;
    move2_energy_color_source?: EnergyColorSource;
  },
  slot: 1 | 2
): MoveAnimationOverrides {
  if (slot === 1) {
    return {
      effects: record.move1_effects,
      energyColor: record.move1_energy_color,
      energyColorSource: record.move1_energy_color_source,
    };
  }

  return {
    effects: record.move2_effects,
    energyColor: record.move2_energy_color,
    energyColorSource: record.move2_energy_color_source,
  };
}
