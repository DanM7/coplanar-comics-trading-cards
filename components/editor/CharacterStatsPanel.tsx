"use client";

import { computeTotalPower } from "@/lib/character-stat-validation";
import { formatStatValue } from "@/lib/format-stat";
import type { CharacterStatRecord } from "@/types/character-stats";
import styles from "./editor.module.css";

interface CharacterStatsPanelProps {
  characterId: string | null;
  statRecord: CharacterStatRecord | undefined;
}

const STAT_FIELDS: { key: keyof CharacterStatRecord["stats"]; label: string }[] =
  [
    { key: "strength", label: "Strength" },
    { key: "speed", label: "Speed" },
    { key: "intelligence", label: "Intelligence" },
    { key: "durability", label: "Durability" },
    { key: "energy_projection", label: "Energy Proj." },
    { key: "skill", label: "Skill" },
  ];

export function CharacterStatsPanel({
  characterId,
  statRecord,
}: CharacterStatsPanelProps) {
  if (!characterId) {
    return (
      <p className={styles.hint}>
        Select a character to load stats from{" "}
        <code>data/character_stats.json</code>.
      </p>
    );
  }

  if (!statRecord) {
    return (
      <p className={styles.hint}>
        No entry in <code>data/character_stats.json</code> for id{" "}
        <strong>{characterId}</strong>. Card back stats will show — until you
        add a row.
      </p>
    );
  }

  const total = computeTotalPower(statRecord.stats);

  return (
    <div className={styles.metaFields}>
      <p className={styles.hint}>
        Read from <code>data/character_stats.json</code> (matched by id). Values
        below are applied to the card back preview.
      </p>
      <div className={styles.field}>
        <label>Id (file)</label>
        <input value={statRecord.id} readOnly className={styles.readOnly} />
      </div>
      <div className={styles.field}>
        <label>Name (file, display only)</label>
        <input value={statRecord.name} readOnly className={styles.readOnly} />
      </div>
      <div className={styles.field}>
        <label>Tier</label>
        <input
          value={String(statRecord.tier)}
          readOnly
          className={styles.readOnly}
        />
      </div>
      {STAT_FIELDS.map(({ key, label }) => (
        <div key={key} className={styles.field}>
          <label>{label}</label>
          <input
            value={formatStatValue(statRecord.stats[key])}
            readOnly
            className={styles.readOnly}
          />
        </div>
      ))}
      <div className={styles.field}>
        <label>Total power</label>
        <input value={String(total)} readOnly className={styles.readOnly} />
      </div>
    </div>
  );
}
