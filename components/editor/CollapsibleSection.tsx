"use client";

import { useId, useState, type ReactNode } from "react";
import styles from "./editor.module.css";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className={styles.collapseSection}>
      <button
        type="button"
        className={styles.collapseHeader}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.collapseTitle}>{title}</span>
        <span className={styles.collapseChevron} aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <div id={contentId} className={styles.collapseBody}>
          {children}
        </div>
      )}
    </section>
  );
}
