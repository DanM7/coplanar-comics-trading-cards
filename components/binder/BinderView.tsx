"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { BinderPage, BinderSlot } from "@/types/collection";
import type { GeneratedCard } from "@/types/card";
import { BinderPageView } from "./BinderPage";
import { BinderModal } from "./BinderModal";
import styles from "./binder.module.css";

export function BinderView() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [pages, setPages] = useState<BinderPage[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selected, setSelected] = useState<{
    card: GeneratedCard;
    quantity: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ owned: 0, total: 0 });

  const loadBinder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/collection/binder");
      if (!res.ok) return;
      const data = (await res.json()) as {
        pages: BinderPage[];
        owned: number;
        total: number;
      };
      setPages(data.pages);
      setStats({ owned: data.owned, total: data.total });
      setPageIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void loadBinder();
  }, [authLoading, isAuthenticated, loadBinder]);

  const handleSelect = (slot: BinderSlot) => {
    if (slot.card) {
      setSelected({ card: slot.card, quantity: slot.quantity });
    }
  };

  if (authLoading || loading) {
    return <p className={styles.stats}>Loading binder…</p>;
  }

  if (!isAuthenticated) {
    return (
      <p className={styles.stats}>
        Sign in to view your digital binder collection.
      </p>
    );
  }

  const currentPage = pages[pageIndex];

  return (
    <div className={styles.binder}>
      <div className={styles.binderShell}>
        <div className={styles.binderRings} aria-hidden>
          <div className={styles.ring} />
          <div className={styles.ring} />
          <div className={styles.ring} />
        </div>

        {currentPage && (
          <BinderPageView page={currentPage} onSelectCard={handleSelect} />
        )}
      </div>

      <div className={styles.binderFooter}>
        <p className={styles.stats}>
          {stats.owned} / {stats.total} cards collected
        </p>

        {pages.length > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className={styles.pageIndicator}>
              Page {pageIndex + 1} of {pages.length}
            </span>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={pageIndex >= pages.length - 1}
              onClick={() => setPageIndex((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {selected && (
        <BinderModal
          card={selected.card}
          quantity={selected.quantity}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
