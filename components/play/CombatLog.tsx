import type { CombatLogEntry } from "@/types/game";
import styles from "./play.module.css";

interface CombatLogProps {
  entries: CombatLogEntry[];
}

export function CombatLog({ entries }: CombatLogProps) {
  return (
    <aside className={styles.combatLog}>
      <h3>Combat Log</h3>
      <ul className={styles.logList}>
        {[...entries].reverse().map((entry) => (
          <li
            key={entry.id}
            className={[
              styles.logEntry,
              entry.kind === "round" ? styles.logEntryRound : "",
              entry.kind === "miss" ? styles.logEntryMiss : "",
              entry.kind === "ko" ? styles.logEntryKo : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {entry.message}
          </li>
        ))}
      </ul>
    </aside>
  );
}
