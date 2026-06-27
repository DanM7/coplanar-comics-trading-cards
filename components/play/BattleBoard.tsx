"use client";

import { useEffect, useMemo, useState } from "react";
import {
  executeCpuTurn,
  executePlayerAction,
  formatSynergySummary,
  getActiveFighter,
} from "@/services/game/match";
import {
  computeTeamPowerFromBattleTeam,
  formatTeamPowerScore,
} from "@/services/game/team-power";
import type { BattleState } from "@/types/game";
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

export function BattleBoard({
  battle,
  onBattleChange,
  onRematch,
}: BattleBoardProps) {
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(
    null
  );
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

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

  useEffect(() => {
    setSelectedMoveIndex(null);
    setSelectedTargetId(null);
  }, [battle.turnIndex, battle.round]);

  useEffect(() => {
    if (battle.phase !== "battle" || battle.awaitingPlayerAction) {
      return;
    }

    const timer = window.setTimeout(() => {
      onBattleChange(executeCpuTurn(battle));
    }, 700);

    return () => window.clearTimeout(timer);
  }, [battle, onBattleChange]);

  const handleConfirmAttack = () => {
    if (
      selectedMoveIndex === null ||
      !selectedTargetId ||
      !battle.awaitingPlayerAction
    ) {
      return;
    }

    onBattleChange(
      executePlayerAction(battle, {
        moveIndex: selectedMoveIndex,
        targetFighterId: selectedTargetId,
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
      <div>
        <span className={styles.roundBadge}>Round {battle.round}</span>

        <div className={styles.battleTeams}>
          <section
            className={`${styles.teamBlock} ${styles.teamBlockCpu}`}
            aria-label="CPU team"
          >
            <p className={styles.teamLabel}>Opponent</p>
            {cpuTeamPower ? (
              <p className={styles.teamPowerLine}>
                Team power:{" "}
                <strong>{formatTeamPowerScore(cpuTeamPower.totalScore)}</strong>
              </p>
            ) : null}
            <p className={styles.synergyLine}>
              {formatSynergySummary(battle.cpuTeam)}
            </p>
            <div className={styles.fighterRow}>
              {battle.cpuTeam.fighters.map((fighter) => {
                const pct = hpPercent(fighter.currentHp, fighter.maxHp);
                const isTarget =
                  selectedTargetId === fighter.id && !fighter.isKO;
                const isActive = activeFighter?.id === fighter.id;

                return (
                  <div
                    key={fighter.id}
                    className={[
                      styles.fighterCard,
                      isActive ? styles.fighterCardActive : "",
                      fighter.isKO ? styles.fighterCardKO : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
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
                    {!fighter.isKO && battle.awaitingPlayerAction ? (
                      <div className={styles.targetGrid} style={{ marginTop: "0.45rem" }}>
                        <button
                          type="button"
                          className={[
                            styles.targetBtn,
                            isTarget ? styles.targetBtnSelected : "",
                          ]
                              .filter(Boolean)
                              .join(" ")}
                          onClick={() => setSelectedTargetId(fighter.id)}
                        >
                          Target
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section
            className={`${styles.teamBlock} ${styles.teamBlockPlayer}`}
            aria-label="Player team"
          >
            <p className={styles.teamLabel}>Your Team</p>
            {playerTeamPower ? (
              <p className={styles.teamPowerLine}>
                Team power:{" "}
                <strong>
                  {formatTeamPowerScore(playerTeamPower.totalScore)}
                </strong>
              </p>
            ) : null}
            <p className={styles.synergyLine}>
              {formatSynergySummary(battle.playerTeam)}
            </p>
            <div className={styles.fighterRow}>
              {battle.playerTeam.fighters.map((fighter) => {
                const pct = hpPercent(fighter.currentHp, fighter.maxHp);
                const isActive = activeFighter?.id === fighter.id;

                return (
                  <div
                    key={fighter.id}
                    className={[
                      styles.fighterCard,
                      isActive ? styles.fighterCardActive : "",
                      fighter.isKO ? styles.fighterCardKO : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
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
                );
              })}
            </div>
          </section>
        </div>

        <div className={styles.actionPanel}>
          {battle.awaitingPlayerAction && activeFighter ? (
            <>
              <p className={styles.actionHint}>
                {activeFighter.name}&apos;s turn — choose a move and target.
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
                    <span className={styles.moveType}>
                      {move.attackType === "energy" ? "Energy" : "Physical"}{" "}
                      attack
                    </span>
                  </button>
                ))}
              </div>
              <div className={styles.playActions}>
                <button
                  type="button"
                  className={styles.playBtn}
                  disabled={
                    selectedMoveIndex === null ||
                    !selectedTargetId ||
                    cpuTargets.length === 0
                  }
                  onClick={handleConfirmAttack}
                >
                  Attack
                </button>
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
