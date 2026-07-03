import type { ReactNode } from "react";
import { characterTypesFromString } from "@/lib/format-character-home";
import type { CharacterType } from "@/types/character";
import styles from "./play.module.css";

const TYPE_LABELS: Record<CharacterType, string> = {
  Human: "Human",
  Superhuman: "Superhuman",
  Robot: "Robot",
  Cyborg: "Cyborg",
  Construct: "Construct",
  Cartoon: "Cartoon",
  Creature: "Creature",
};

function isKnownCharacterType(value: string): value is CharacterType {
  return value in TYPE_LABELS;
}

function IconShell({
  children,
  viewBox = "0 0 24 24",
}: {
  children: ReactNode;
  viewBox?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function HumanFigure() {
  return (
    <>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M6.5 20c0-3.5 2.5-5.5 5.5-5.5s5.5 2 5.5 5.5" />
    </>
  );
}

function HumanIcon() {
  return (
    <IconShell>
      <HumanFigure />
    </IconShell>
  );
}

/** Shared overlay anchor on the human figure (upper torso / head). */
const HUMAN_OVERLAY_X = 25;
const HUMAN_OVERLAY_Y = 8.4;
const HUMAN_OVERLAY_VIEWBOX = "0 0 30 24";

function StarBadge() {
  return (
    <g
      transform={`translate(${HUMAN_OVERLAY_X} ${HUMAN_OVERLAY_Y}) scale(1.55) translate(-16.2 -6.2)`}
    >
      <path
        d="M16.2 3.8 16.9 5.6 18.8 5.6 17.2 6.8 17.8 8.6 16.2 7.6 14.6 8.6 15.2 6.8 13.6 5.6 15.5 5.6z"
        strokeWidth="1.45"
      />
    </g>
  );
}

function SuperhumanIcon() {
  return (
    <IconShell viewBox={HUMAN_OVERLAY_VIEWBOX}>
      <HumanFigure />
      <StarBadge />
    </IconShell>
  );
}

function buildGearPath(
  cx: number,
  cy: number,
  teeth: number,
  innerRadius: number,
  outerRadius: number
): string {
  const steps = teeth * 2;
  const segments: string[] = [];

  for (let index = 0; index < steps; index += 1) {
    const angle = ((Math.PI * 2 * index) / steps) - Math.PI / 2;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    segments.push(`${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return `${segments.join(" ")} Z`;
}

function GearShape() {
  return (
    <>
      <path d={buildGearPath(12, 12, 8, 4, 5.75)} />
      <circle cx="12" cy="12" r="2.5" />
    </>
  );
}

function GearBadge() {
  return (
    <g
      transform={`translate(${HUMAN_OVERLAY_X} ${HUMAN_OVERLAY_Y}) scale(0.82) translate(-12 -12)`}
    >
      <GearShape />
    </g>
  );
}

function RobotIcon() {
  return (
    <IconShell>
      <GearShape />
    </IconShell>
  );
}

function CyborgIcon() {
  return (
    <IconShell viewBox={HUMAN_OVERLAY_VIEWBOX}>
      <g transform="scale(-1, 1) translate(-30, 0)">
        <HumanFigure />
        <GearBadge />
      </g>
    </IconShell>
  );
}

function ConstructIcon() {
  return (
    <IconShell>
      <rect x="8.75" y="4.5" width="6.5" height="6.5" rx="1" />
      <rect x="4.5" y="13" width="6.5" height="6.5" rx="1" />
      <rect x="13" y="13" width="6.5" height="6.5" rx="1" />
    </IconShell>
  );
}

function CartoonIcon() {
  return (
    <IconShell>
      <g transform="scale(-1, 1) translate(-24, 0)">
        <path d="M5 6.5h11.5a2.5 2.5 0 0 1 2.5 2.5v4.5a2.5 2.5 0 0 1-2.5 2.5H10l-3.5 3v-3H5a2.5 2.5 0 0 1-2.5-2.5V9a2.5 2.5 0 0 1 2.5-2.5z" />
        <path d="M8.5 11h5M8.5 13.5h3" strokeWidth="1.5" />
      </g>
    </IconShell>
  );
}

function CreatureIcon() {
  return (
    <IconShell>
      <ellipse cx="12" cy="16.8" rx="4.2" ry="3.4" />
      <ellipse cx="7.2" cy="11.2" rx="1.7" ry="2.3" transform="rotate(-18 7.2 11.2)" />
      <ellipse cx="10.4" cy="9.1" rx="1.7" ry="2.3" />
      <ellipse cx="13.6" cy="9.1" rx="1.7" ry="2.3" />
      <ellipse cx="16.8" cy="11.2" rx="1.7" ry="2.3" transform="rotate(18 16.8 11.2)" />
    </IconShell>
  );
}

function UnknownTypeIcon() {
  return (
    <IconShell>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M9.5 9.25a2.75 2.75 0 0 1 4.8 1.4c0 1.85-2.3 2.35-2.3 3.85" />
      <circle cx="12" cy="17.1" r="0.9" fill="currentColor" stroke="none" />
    </IconShell>
  );
}

const TYPE_ICONS: Record<CharacterType, () => ReactNode> = {
  Human: HumanIcon,
  Superhuman: SuperhumanIcon,
  Robot: RobotIcon,
  Cyborg: CyborgIcon,
  Construct: ConstructIcon,
  Cartoon: CartoonIcon,
  Creature: CreatureIcon,
};

function SingleTypeIcon({ type }: { type: string }) {
  if (isKnownCharacterType(type)) {
    const Icon = TYPE_ICONS[type];
    return <Icon />;
  }

  return <UnknownTypeIcon />;
}

interface CharacterTypeIconProps {
  type?: string;
  className?: string;
}

export function CharacterTypeIcon({ type, className }: CharacterTypeIconProps) {
  const types = characterTypesFromString(type);
  const label = type?.trim() || "Unknown type";

  if (types.length === 0) {
    return (
      <span className={className} role="img" aria-label={label} title={label}>
        <UnknownTypeIcon />
      </span>
    );
  }

  if (types.length === 1) {
    return (
      <span className={className} role="img" aria-label={label} title={label}>
        <SingleTypeIcon type={types[0]} />
      </span>
    );
  }

  return (
    <span
      className={[className, styles.rosterCardTypeIconHybrid].filter(Boolean).join(" ")}
      role="img"
      aria-label={label}
      title={label}
    >
      {types.map((part, index) => (
        <span key={`${part}-${index}`} className={styles.rosterCardTypeIconHybridPart}>
          {index > 0 ? (
            <span className={styles.rosterCardTypeIconSlash} aria-hidden>
              /
            </span>
          ) : null}
          <SingleTypeIcon type={part} />
        </span>
      ))}
    </span>
  );
}
