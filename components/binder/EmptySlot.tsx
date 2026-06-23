import styles from "./binder.module.css";

interface EmptySlotProps {
  printId?: string;
}

export function EmptySlot({ printId }: EmptySlotProps) {
  const label = printId
    ? `Card ${printId} — not collected`
    : "Uncollected card";

  return (
    <div className={styles.emptySlot} aria-label={label}>
      <span className={styles.emptySlotUnknown} aria-hidden>
        ?
      </span>
    </div>
  );
}
