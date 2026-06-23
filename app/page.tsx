import Link from "next/link";
import { REALM_COLORS, HOME_REGIONS } from "@/constants/realms";
import { UNIVERSE_BRAND } from "@/constants/project";

export default function HomePage() {
  return (
    <section className="hero">
      <p>
        Rip foil packs, collect characters from across the {UNIVERSE_BRAND}{" "}
        Universe, and fill your nostalgic digital binder — inspired by 90s
        Marvel and DC card series.
      </p>
      <div className="hero-actions">
        <Link href="/pack" className="hero-link">
          Open a Pack
        </Link>
        <Link href="/binder" className="hero-link hero-link--secondary">
          My Binder
        </Link>
      </div>
      <div className="realm-legend">
        {HOME_REGIONS.map((realm) => (
          <span
            key={realm}
            className="realm-pill"
            style={{ backgroundColor: REALM_COLORS[realm], color: "var(--accent-on)" }}
          >
            {realm}
          </span>
        ))}
      </div>
    </section>
  );
}
