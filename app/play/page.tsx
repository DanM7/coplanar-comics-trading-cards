import dynamic from "next/dynamic";
import styles from "@/components/play/play.module.css";

const PlayView = dynamic(
  () =>
    import("@/components/play/PlayView").then((module) => module.PlayView),
  {
    loading: () => (
      <p className={styles.playIntro}>Loading play mode…</p>
    ),
  }
);

export default function PlayPage() {
  return (
    <div className={`page-play ${styles.play}`}>
      <PlayView />
    </div>
  );
}
