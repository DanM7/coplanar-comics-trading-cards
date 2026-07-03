import { Suspense } from "react";
import { PlayView } from "@/components/play/PlayView";
import styles from "@/components/play/play.module.css";

export default function PlayPage() {
  return (
    <div className={`page-play ${styles.play}`}>
      <Suspense fallback={<p className={styles.playStatusCenter}>Loading play mode…</p>}>
        <PlayView />
      </Suspense>
    </div>
  );
}
