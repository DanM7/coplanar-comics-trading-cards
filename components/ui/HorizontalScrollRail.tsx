"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./horizontal-scroll-rail.module.css";

interface HorizontalScrollRailProps {
  children: ReactNode;
  /** When set, keeps this child centered in the scroller as it changes. */
  activeIndex?: number;
  className?: string;
  scrollerClassName?: string;
  "aria-label"?: string;
}

export function HorizontalScrollRail({
  children,
  activeIndex,
  className,
  scrollerClassName,
  "aria-label": ariaLabel,
}: HorizontalScrollRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 100 });

  const updateIndicator = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (scrollWidth <= clientWidth + 1) {
      setIndicator({ left: 0, width: 100 });
      return;
    }

    const widthPct = (clientWidth / scrollWidth) * 100;
    const leftPct = (scrollLeft / scrollWidth) * 100;
    setIndicator({ left: leftPct, width: widthPct });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }

    updateIndicator();
    el.addEventListener("scroll", updateIndicator, { passive: true });
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateIndicator);
      observer.disconnect();
    };
  }, [updateIndicator, children]);

  useEffect(() => {
    if (activeIndex === undefined) {
      return;
    }

    const el = scrollerRef.current;
    if (!el) {
      return;
    }

    const item = el.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({
      inline: "center",
      block: "center",
      behavior: "smooth",
    });
  }, [activeIndex, children]);

  return (
    <div className={[styles.rail, className].filter(Boolean).join(" ")}>
      <div
        ref={scrollerRef}
        className={[styles.scroller, scrollerClassName].filter(Boolean).join(" ")}
        aria-label={ariaLabel}
      >
        {children}
      </div>
      <div className={styles.scrollIndicator} aria-hidden>
        <div
          className={styles.scrollIndicatorThumb}
          style={{
            left: `${indicator.left}%`,
            width: `${indicator.width}%`,
          }}
        />
      </div>
    </div>
  );
}
