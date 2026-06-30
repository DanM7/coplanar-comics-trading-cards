"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { findLatestAnimatedLogEntry } from "@/lib/battle-attack-animation";
import { getMoveAnimationsConfig } from "@/lib/character-moves-loader";
import {
  alignmentEnergyFallbackColor,
  resolveEnergyAttackColor,
} from "@/lib/move-animations";
import { sampleImageBackdropColor } from "@/lib/sample-image-backdrop-color";
import type { AttackAnimationEffect } from "@/types/character-moves";
import type { BattleFighter, BattleState, CombatLogAnimation } from "@/types/game";

export interface ActiveBattleAnimation {
  logId: string;
  attackerId: string;
  defenderId: string;
  effects: AttackAnimationEffect[];
  energyFlashColor?: string;
}

const ANIMATION_DURATION_MS = 1000;

function findFighter(
  battle: BattleState,
  fighterId: string
): BattleFighter | undefined {
  return [...battle.playerTeam.fighters, ...battle.cpuTeam.fighters].find(
    (fighter) => fighter.id === fighterId
  );
}

async function resolveAnimationFlashColor(
  battle: BattleState,
  animation: CombatLogAnimation
): Promise<string | undefined> {
  if (animation.attackType !== "energy") {
    return undefined;
  }

  const attacker = findFighter(battle, animation.attackerId);
  if (!attacker) {
    return undefined;
  }

  let characterColor: string | null = null;
  if (animation.energyColorSource === "character" && attacker.frontImageUrl) {
    characterColor = await sampleImageBackdropColor(attacker.frontImageUrl);
  }

  return resolveEnergyAttackColor({
    moveName: animation.moveName,
    animation: {
      effects: animation.effects,
      energyColor: animation.energyColor,
      energyColorSource: animation.energyColorSource,
    },
    characterColor,
    alignment: attacker.alignment,
    config: getMoveAnimationsConfig(),
  });
}

function toActiveAnimation(
  battle: BattleState,
  logId: string,
  animation: CombatLogAnimation
): ActiveBattleAnimation {
  const attacker = findFighter(battle, animation.attackerId);
  return {
    logId,
    attackerId: animation.attackerId,
    defenderId: animation.defenderId,
    effects: animation.effects,
    energyFlashColor:
      animation.attackType === "energy"
        ? alignmentEnergyFallbackColor(attacker?.alignment ?? "Neutral")
        : "#ffffff",
  };
}

export function useBattleAttackAnimation(battle: BattleState) {
  const [activeAnimation, setActiveAnimation] =
    useState<ActiveBattleAnimation | null>(null);
  const battleRef = useRef(battle);
  battleRef.current = battle;

  const animatedEntry = findLatestAnimatedLogEntry(battle.log);
  const animatedLogId = animatedEntry?.id ?? null;

  useLayoutEffect(() => {
    if (!animatedLogId) {
      return;
    }

    const entry = battleRef.current.log.find(
      (logEntry) => logEntry.id === animatedLogId
    );
    if (!entry?.animation) {
      return;
    }

    const snapshot = toActiveAnimation(
      battleRef.current,
      animatedLogId,
      entry.animation
    );
    setActiveAnimation(snapshot);

    let cancelled = false;
    if (entry.animation.attackType === "energy") {
      void resolveAnimationFlashColor(battleRef.current, entry.animation).then(
        (energyFlashColor) => {
          if (cancelled || !energyFlashColor) {
            return;
          }
          setActiveAnimation((current) =>
            current?.logId === animatedLogId
              ? { ...current, energyFlashColor }
              : current
          );
        }
      );
    }

    const timer = window.setTimeout(() => {
      setActiveAnimation((current) =>
        current?.logId === animatedLogId ? null : current
      );
    }, ANIMATION_DURATION_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [animatedLogId]);

  return activeAnimation;
}

export function fighterAnimationClass(
  fighterId: string,
  activeAnimation: ActiveBattleAnimation | null
): string | undefined {
  if (!activeAnimation) {
    return undefined;
  }

  const isCpu = fighterId.startsWith("cpu-");

  if (activeAnimation.defenderId === fighterId) {
    if (activeAnimation.effects.includes("shake")) {
      return "fighterAnimShake";
    }
    if (activeAnimation.effects.includes("spin")) {
      return "fighterAnimSpin";
    }
    if (
      activeAnimation.effects.includes("lunge") ||
      activeAnimation.effects.includes("flash") ||
      activeAnimation.effects.includes("pulse") ||
      activeAnimation.effects.includes("spray") ||
      activeAnimation.effects.includes("smoke") ||
      activeAnimation.effects.includes("laserBolts") ||
      activeAnimation.effects.includes("flames")
    ) {
      return isCpu ? "fighterAnimLungeCpu" : "fighterAnimLungePlayer";
    }
  }

  if (activeAnimation.attackerId === fighterId) {
    if (
      activeAnimation.effects.includes("lunge") ||
      activeAnimation.effects.includes("shake")
    ) {
      return isCpu
        ? "fighterAnimLungeAttackerCpu"
        : "fighterAnimLungeAttackerPlayer";
    }
  }

  return undefined;
}

export function boardAnimationClass(
  activeAnimation: ActiveBattleAnimation | null
): string | undefined {
  if (!activeAnimation?.effects.includes("shake")) {
    return undefined;
  }

  return "battleBoardShake";
}

export function fighterShowsHitOverlay(
  fighterId: string,
  activeAnimation: ActiveBattleAnimation | null
): boolean {
  return activeAnimation?.defenderId === fighterId;
}
