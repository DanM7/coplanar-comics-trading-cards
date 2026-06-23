"use client";

import type { BinderPage as BinderPageType } from "@/types/collection";
import { BinderGrid } from "./BinderGrid";
import styles from "./binder.module.css";

interface BinderPageProps {
  page: BinderPageType;
  onSelectCard: (slot: BinderPageType["slots"][0]) => void;
}

export function BinderPageView({ page, onSelectCard }: BinderPageProps) {
  return (
    <div className={styles.page}>
      <BinderGrid slots={page.slots} onSelectCard={onSelectCard} />
    </div>
  );
}
