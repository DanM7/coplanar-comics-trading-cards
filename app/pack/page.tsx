"use client";

import { PackOpener } from "@/components/pack/PackOpener";
import styles from "@/components/pack/pack.module.css";

export default function PackPage() {
  return (
    <div className={styles.packPage}>
      <div className={styles.packPageGlow} aria-hidden />
      <PackOpener />
    </div>
  );
}
