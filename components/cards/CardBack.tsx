import type { GeneratedCardBack } from "@/types/card";
import { formatTierPowerLine } from "@/lib/card-power-summary";
import { CardStatBlocks } from "./CardStatBlocks";

import styles from "./card.module.css";

interface CardBackProps {
  back: GeneratedCardBack;
}

export function CardBack({ back }: CardBackProps) {
  return (
    <div className={`${styles.face} ${styles.back}`}>
      <div className={styles.frame} aria-hidden />
      <div className={styles.backContent}>
        <div className={styles.backTopStack}>
          <header className={styles.backHeader}>
            <p className={styles.backText}>{back.idAlignmentLine}</p>
            <p className={styles.backText}>{back.homeLine}</p>
            <p className={styles.backText}>{back.typeIdentityLine}</p>
          </header>
          <div className={`${styles.backSectionDivider} ${styles.description}`}>
            <p className={styles.backText}>{back.description}</p>
          </div>
        </div>

        <div className={styles.backStatsSection}>
          <div className={styles.backStatsMain}>
            <p className={`${styles.backText} ${styles.tierPowerLine}`}>
              {formatTierPowerLine(back.stats, back.tier, back.moves)}
            </p>
            <CardStatBlocks
              className={styles.backText}
              stats={back.stats}
              moves={back.moves}
            />
            {back.flavorText ? (
              <p className={styles.flavor}>{back.flavorText}</p>
            ) : null}
          </div>
          <p className={styles.seriesTitle}>
            {back.seriesFooterLine ?? back.seriesTitle}
          </p>
        </div>
      </div>
    </div>
  );
}
