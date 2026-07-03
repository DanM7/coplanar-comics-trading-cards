"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { HorizontalScrollRail } from "@/components/ui/HorizontalScrollRail";
import styles from "./pack.module.css";

interface PackCardStripProps {
  grid: boolean;
  activeIndex: number;
  children: ReactNode;
}

/** Portrait: horizontal scroll. Landscape / desktop: flexible 3×4 grid beside the hero card. */
export function PackCardStrip({ grid, activeIndex, children }: PackCardStripProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!grid || !gridRef.current) {
      return;
    }

    const item = gridRef.current.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex, grid, children]);

  if (grid) {
    return (
      <div className={`${styles.cardStripRail} ${styles.packStripRailGrid}`}>
        <div
          ref={gridRef}
          className={styles.packStripGridFlex}
          aria-label="Opened cards in this pack"
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <HorizontalScrollRail
      className={styles.cardStripRail}
      scrollerClassName={styles.packStripScrollRow}
      activeIndex={activeIndex}
      aria-label="Opened cards in this pack"
    >
      {children}
    </HorizontalScrollRail>
  );
}
