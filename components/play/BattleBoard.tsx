"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  boardAnimationClass,
  fighterAnimationClass,
  fighterShowsHitOverlay,
  useBattleAttackAnimation,
} from "@/hooks/useBattleAttackAnimation";
import {
  executeCpuTurn,
  executePlayerAction,
  formatSynergySummary,
  getActiveFighter,
} from "@/services/game/match";
import { projectAttackDamage } from "@/services/game/combat";
import {
  computeTeamPowerFromBattleTeam,
  formatTeamPowerScore,
} from "@/services/game/team-power";
import type { BattleFighter, BattleState } from "@/types/game";
import { AttackEffectOverlay } from "./AttackEffectOverlay";
import { CombatLog } from "./CombatLog";
import styles from "./play.module.css";

interface BattleBoardProps {
  battle: BattleState;
  onBattleChange: (next: BattleState) => void;
  onRematch: () => void;
}

function hpPercent(current: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((current / max) * 100);
}

function animationStyleClass(className?: string): string {
  if (!className) {
    return "";
  }

  return styles[className as keyof typeof styles] ?? "";
}

function FighterCard({
  fighter,
  isActive,
  isAttackable,
  onAttack,
  activeAnimation,
  variant,
  damagePreview,
}: {
  fighter: BattleFighter;
  isActive: boolean;
  isAttackable?: boolean;
  onAttack?: () => void;
  activeAnimation: ReturnType<typeof useBattleAttackAnimation>;
  variant: "cpu" | "player";
  damagePreview?: { damage: number; hitChance: number; wouldKo: boolean } | null;
}) {
  const pct = hpPercent(fighter.currentHp, fighter.maxHp);
  const animClass = fighterAnimationClass(fighter.id, activeAnimation);
  const isAnimatedDefender = fighterShowsHitOverlay(fighter.id, activeAnimation);
  const isAnimatedAttacker =
    activeAnimation?.attackerId === fighter.id;
  const flashColor = activeAnimation?.energyFlashColor;
  const isAnimating = isAnimatedDefender || isAnimatedAttacker;

  const handleActivate = () => {
    if (isAttackable && onAttack) {
      onAttack();
    }
  };

  return (
    <div
      className={[
        styles.fighterCard,
        variant === "cpu" ? styles.fighterCardCpu : styles.fighterCardPlayer,
        isActive ? styles.fighterCardActive : "",
        fighter.isKO ? styles.fighterCardKO : "",
        isAttackable ? styles.fighterCardAttackable : "",
        isAnimating ? styles.fighterCardAnimated : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={isAttackable ? handleActivate : undefined}
      onKeyDown={
        isAttackable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleActivate();
              }
            }
          : undefined
      }
      role={isAttackable ? "button" : undefined}
      tabIndex={isAttackable ? 0 : undefined}
      aria-label={
        isAttackable
          ? damagePreview
            ? `Attack ${fighter.name} for ${damagePreview.damage} damage`
            : `Attack ${fighter.name}`
          : undefined
      }
    >
      <div
        key={
          isAnimating && activeAnimation
            ? `${fighter.id}-anim-${activeAnimation.logId}`
            : `${fighter.id}-body`
        }
        className={[
          styles.fighterCardBody,
          animClass ? animationStyleClass(animClass) : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
      {fighter.frontImageUrl ? (
        <div
          className={[
            styles.fighterPortrait,
            animClass ? styles.fighterPortraitAnimating : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {damagePreview ? (
            <div
              className={[
                styles.fighterDamagePreview,
                damagePreview.wouldKo ? styles.fighterDamagePreviewKo : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden
            >
              <span className={styles.fighterDamagePreviewValue}>
                −{damagePreview.damage}
              </span>
              <span className={styles.fighterDamagePreviewHit}>
                {Math.round(damagePreview.hitChance * 100)}% hit
              </span>
            </div>
          ) : null}
          <Image
            src={fighter.frontImageUrl}
            alt=""
            width={140}
            height={320}
            className={styles.fighterPortraitImg}
            unoptimized
          />
        </div>
      ) : null}
      {isAnimatedDefender && activeAnimation ? (
        <AttackEffectOverlay
          effects={activeAnimation.effects}
          boltsFromTop={activeAnimation.attackerId.startsWith("cpu-")}
          flashColor={flashColor}
        />
      ) : null}
      <div className={styles.fighterHeader}>
        <p className={styles.fighterName}>{fighter.name}</p>
        <p className={styles.fighterHpText}>
          {fighter.currentHp}/{fighter.maxHp} HP
        </p>
      </div>
      <div className={styles.hpBar}>
        <div
          className={[
            styles.hpBarFill,
            pct <= 30 ? styles.hpBarFillLow : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
      </div>
    </div>
  );
}

export function BattleBoard({
  battle,
  onBattleChange,
  onRematch,
}: BattleBoardProps) {
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(
    null
  );
  const activeAnimation = useBattleAttackAnimation(battle);

  const activeFighter = getActiveFighter(battle);
  const playerTeamPower = useMemo(
    () => computeTeamPowerFromBattleTeam(battle.playerTeam),
    [battle.playerTeam]
  );
  const cpuTeamPower = useMemo(
    () => computeTeamPowerFromBattleTeam(battle.cpuTeam),
    [battle.cpuTeam]
  );
  const cpuTargets = useMemo(
    () => battle.cpuTeam.fighters.filter((fighter) => !fighter.isKO),
    [battle.cpuTeam.fighters]
  );
  const canPickTarget =
    battle.awaitingPlayerAction &&
    selectedMoveIndex !== null &&
    cpuTargets.length > 0;
  const selectedMove =
    activeFighter && selectedMoveIndex !== null
      ? activeFighter.moves[selectedMoveIndex]
      : null;

  const damagePreviewForTarget = (defender: BattleFighter) => {
    if (
      !activeFighter ||
      !selectedMove ||
      defender.isKO ||
      !battle.awaitingPlayerAction
    ) {
      return null;
    }

    const projection = projectAttackDamage({
      attacker: activeFighter,
      defender,
      move: selectedMove,
      attackerTeam: battle.playerTeam,
      defenderTeam: battle.cpuTeam,
    });

    return {
      damage: projection.damage,
      hitChance: projection.hitChance,
      wouldKo: projection.defenderKO,
    };
  };
  const boardShakeClass = animationStyleClass(
    boardAnimationClass(activeAnimation)
  );

  useEffect(() => {
    setSelectedMoveIndex(null);
  }, [battle.turnIndex, battle.round]);

  useEffect(() => {
    if (battle.phase !== "battle" || battle.awaitingPlayerAction) {
      return;
    }

    const timer = window.setTimeout(() => {
      onBattleChange(executeCpuTurn(battle));
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [battle, onBattleChange]);

  const handleEnemyAttack = (targetFighterId: string) => {
    if (
      selectedMoveIndex === null ||
      !battle.awaitingPlayerAction
    ) {
      return;
    }

    onBattleChange(
      executePlayerAction(battle, {
        moveIndex: selectedMoveIndex,
        targetFighterId,
      })
    );
  };

  if (battle.phase === "victory" || battle.phase === "defeat") {
    return (
      <div>
        <div className={styles.victoryBanner}>
          <h2>{battle.phase === "victory" ? "Victory!" : "Defeat"}</h2>
          <p>
            {battle.phase === "victory"
              ? "Your team wins the battle."
              : "Your team was knocked out."}
          </p>
        </div>
        <CombatLog entries={battle.log} />
        <div className={styles.playActions}>
          <button type="button" className={styles.playBtn} onClick={onRematch}>
            New Battle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.battleLayout}>
      <div
        key={
          activeAnimation?.effects.includes("shake")
            ? `shake-${activeAnimation.logId}`
            : "battle-steady"
        }
        className={boardShakeClass || undefined}
      >
        <span className={styles.roundBadge}>Round {battle.round}</span>

        <div className={styles.battleTeams}>
          <div className={styles.battleTeamMeta}>
            <div
              className={`${styles.teamMetaBlock} ${styles.teamMetaBlockCpu}`}
            >
              <p className={styles.teamLabel}>Opponent</p>
              {cpuTeamPower ? (
                <p className={styles.teamPowerLine}>
                  Power:{" "}
                  <strong>
                    {formatTeamPowerScore(cpuTeamPower.totalScore)}
                  </strong>
                </p>
              ) : null}
              <p className={styles.synergyLine}>
                {formatSynergySummary(battle.cpuTeam)}
              </p>
            </div>
            <div
              className={`${styles.teamMetaBlock} ${styles.teamMetaBlockPlayer}`}
            >
              <p className={styles.teamLabel}>Your Team</p>
              {playerTeamPower ? (
                <p className={styles.teamPowerLine}>
                  Power:{" "}
                  <strong>
                    {formatTeamPowerScore(playerTeamPower.totalScore)}
                  </strong>
                </p>
              ) : null}
              <p className={styles.synergyLine}>
                {formatSynergySummary(battle.playerTeam)}
              </p>
            </div>
          </div>

          <div className={styles.battleColumns} aria-label="Battle field">
            {[0, 1, 2].map((slot) => {
              const cpuFighter = battle.cpuTeam.fighters.find(
                (fighter) => fighter.slot === slot
              );
              const playerFighter = battle.playerTeam.fighters.find(
                (fighter) => fighter.slot === slot
              );

              return (
                <div key={slot} className={styles.battleColumn}>
                  {cpuFighter ? (
                    <FighterCard
                      fighter={cpuFighter}
                      isActive={activeFighter?.id === cpuFighter.id}
                      isAttackable={
                        canPickTarget && !cpuFighter.isKO
                      }
                      onAttack={() => handleEnemyAttack(cpuFighter.id)}
                      activeAnimation={activeAnimation}
                      variant="cpu"
                      damagePreview={damagePreviewForTarget(cpuFighter)}
                    />
                  ) : null}
                  {playerFighter ? (
                    <FighterCard
                      fighter={playerFighter}
                      isActive={activeFighter?.id === playerFighter.id}
                      activeAnimation={activeAnimation}
                      variant="player"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.actionPanel}>
          {battle.awaitingPlayerAction && activeFighter ? (
            <>
              <p className={styles.actionHint}>
                {canPickTarget
                  ? `${activeFighter.name} — tap an opponent to use ${activeFighter.moves[selectedMoveIndex!]?.name}.`
                  : `${activeFighter.name}'s turn — choose a move.`}
              </p>
              <div className={styles.moveGrid}>
                {activeFighter.moves.map((move, index) => (
                  <button
                    key={`${move.name}-${index}`}
                    type="button"
                    className={[
                      styles.moveBtn,
                      selectedMoveIndex === index ? styles.moveBtnSelected : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setSelectedMoveIndex(index)}
                  >
                    <span className={styles.moveName}>{move.name}</span>
                    <span className={styles.movePower}>Power {move.value}</span>
                    <span className={styles.moveType}>
                      {move.attackType === "energy" ? "Energy" : "Physical"}{" "}
                      attack
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.cpuThinking}>Opponent is thinking…</p>
          )}
        </div>
      </div>

      <CombatLog entries={battle.log} />
    </div>
  );
}
