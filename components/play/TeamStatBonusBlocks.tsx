import { CardStatBlocks } from "@/components/cards/CardStatBlocks";
import {
  statBonusesAsBlockValues,
  totalTeamStatBoost,
} from "@/services/game/team-slots";
import type { CoreStats } from "@/types/character-stats";
import styles from "./play.module.css";

interface TeamStatBonusBlocksProps {
  bonuses: CoreStats;
}

export function TeamStatBonusBlocks({ bonuses }: TeamStatBonusBlocksProps) {
  const blockValues = statBonusesAsBlockValues(bonuses);
  const total = totalTeamStatBoost(bonuses);

  return (
    <div className={styles.teamStatBonusBlocks}>
      <p className={styles.teamBonusTotal}>
        Total stat boost: <strong>+{total.toFixed(1)}</strong>
      </p>
      <CardStatBlocks stats={blockValues} className={styles.teamStatBlockGrid} />
    </div>
  );
}
