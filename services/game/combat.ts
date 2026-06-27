import type { MoveDisplay } from "@/types/character-moves";
import type { AttackResult, BattleFighter, BattleTeam } from "@/types/game";
import {
  baseEnergyPower,
  basePhysicalPower,
  defenseFactor,
  energyHitChance,
  physicalHitChance,
} from "@/services/game/stats";

export function resolveAttack(input: {
  attacker: BattleFighter;
  defender: BattleFighter;
  move: MoveDisplay;
  attackerTeam: BattleTeam;
  defenderTeam: BattleTeam;
  rng?: () => number;
}): AttackResult {
  const rng = input.rng ?? Math.random;
  const attackerStats = input.attacker.effectiveStats;
  const defenderStats = input.defender.effectiveStats;
  const attackerSynergy = input.attackerTeam.synergy;
  const move = input.move;

  const basePower =
    move.attackType === "energy"
      ? baseEnergyPower(attackerStats)
      : basePhysicalPower(attackerStats);

  const hitChance =
    move.attackType === "energy"
      ? energyHitChance(
          attackerStats.intelligence,
          defenderStats.intelligence,
          attackerSynergy.homeAccuracy
        )
      : physicalHitChance(
          attackerStats.skill,
          defenderStats.skill,
          attackerSynergy.homeAccuracy
        );

  const damageMultiplier = 1 + attackerSynergy.typeDamage;
  const defFactor = defenseFactor(defenderStats.durability);

  const hit = rng() < hitChance;
  if (!hit) {
    return {
      hit: false,
      damage: 0,
      hitChance,
      basePower,
      damageMultiplier,
      defenseFactor: defFactor,
      defenderHpAfter: input.defender.currentHp,
      defenderKO: false,
    };
  }

  let damage = basePower * damageMultiplier * defFactor;
  damage *= 1 - input.defenderTeam.synergy.alignmentDefense;

  const finalDamage = Math.max(1, Math.round(damage));
  const defenderHpAfter = Math.max(0, input.defender.currentHp - finalDamage);

  return {
    hit: true,
    damage: finalDamage,
    hitChance,
    basePower,
    damageMultiplier,
    defenseFactor: defFactor,
    defenderHpAfter,
    defenderKO: defenderHpAfter <= 0,
  };
}
