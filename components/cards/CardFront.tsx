import type { GeneratedCardFront } from "@/types/card";
import { CardPublisherLogo } from "./CardPublisherLogo";
import styles from "./card.module.css";

interface CardFrontProps {
  front: GeneratedCardFront;
  compact?: boolean;
}

export function CardFront({ front, compact }: CardFrontProps) {
  return (
    <div className={`${styles.face} ${styles.front}`}>
      <div className={styles.frame} aria-hidden />
      <div className={styles.portrait}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={front.portraitUrl}
          alt=""
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            target.parentElement!.setAttribute("data-placeholder", front.name);
          }}
        />
        <span className={styles.portraitFallback}>{front.name}</span>
      </div>
      <div className={styles.nameplate}>
        <h3 className={styles.name}>{front.name}</h3>
      </div>
      <CardPublisherLogo compact={compact} />
    </div>
  );
}

export function CardFrontWrapper({
  front,
  compact,
}: CardFrontProps & { className?: string }) {
  return (
    <div className={compact ? styles.compact : undefined}>
      <CardFront front={front} compact={compact} />
    </div>
  );
}
