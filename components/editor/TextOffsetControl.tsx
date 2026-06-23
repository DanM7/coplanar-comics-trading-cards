"use client";

import styles from "./editor.module.css";

interface TextOffsetControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Shown after the numeric value (default `px`). */
  valueSuffix?: string;
}

export function TextOffsetControl({
  label,
  value,
  onChange,
  min = -80,
  max = 80,
  step = 2,
  valueSuffix = "px",
}: TextOffsetControlProps) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className={styles.offsetControl}>
      <span className={styles.offsetLabel}>{label}</span>
      <div className={styles.offsetButtons}>
        <button
          type="button"
          className={styles.offsetBtn}
          onClick={() => onChange(clamp(safeValue - step))}
          aria-label={`${label} decrease`}
        >
          −
        </button>
        <span className={styles.offsetValue}>
          {safeValue}
          {valueSuffix}
        </span>
        <button
          type="button"
          className={styles.offsetBtn}
          onClick={() => onChange(clamp(safeValue + step))}
          aria-label={`${label} increase`}
        >
          +
        </button>
      </div>
    </div>
  );
}
