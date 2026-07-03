"use client";

import { PLAY_INTRO_MESSAGE } from "@/lib/play-intro";
import styles from "./play.module.css";

interface PlayIntroModalProps {
  onAcknowledge: () => void;
}

export function PlayIntroModal({ onAcknowledge }: PlayIntroModalProps) {
  return (
    <div
      className="auth-modal-overlay"
      role="dialog"
      aria-modal
      aria-labelledby="play-intro-title"
    >
      <div className="auth-modal-content">
        <h2 id="play-intro-title" className="auth-modal-title">
          Play!
        </h2>
        <div className="auth-modal-body">
          <p>{PLAY_INTRO_MESSAGE}</p>
        </div>
        <button
          type="button"
          className={`${styles.playBtn} auth-modal-close`}
          onClick={onAcknowledge}
          autoFocus
        >
          OK
        </button>
      </div>
    </div>
  );
}
