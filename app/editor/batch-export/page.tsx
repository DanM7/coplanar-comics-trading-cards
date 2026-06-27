import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BatchCardExport } from "@/components/editor/BatchCardExport";
import { isDevToolsEnabled } from "@/lib/dev-only";
import styles from "@/components/editor/editor.module.css";

export const dynamic = "force-dynamic";

export default function BatchExportPage() {
  if (!isDevToolsEnabled()) {
    notFound();
  }

  return (
    <>
      <div className={styles.devBanner}>
        Local dev only — batch card PNG export
      </div>
      <h1>Batch Card Export</h1>
      <Suspense fallback={<p className={styles.editorIntro}>Loading…</p>}>
        <BatchCardExport />
      </Suspense>
    </>
  );
}
