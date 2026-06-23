"use client";

import { CardDesignEditor } from "@/components/editor/CardDesignEditor";
import styles from "@/components/editor/editor.module.css";

export function EditorPageContent() {
  return (
    <>
      <div className={styles.devBanner}>
        Local dev only — card design editor (not available in production)
      </div>
      <p className={styles.editorIntro}>
        Compose front and back layouts from{" "}
        <code>assets/raw_front/</code> and <code>assets/raw_back/</code> portraits.
        Tweak borders, backgrounds, fonts, and layout per side.
      </p>
      <CardDesignEditor />
    </>
  );
}
