"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isDevToolsEnabled } from "@/lib/dev-only";
import { prefetchPlayRoster } from "@/lib/play-roster-client";

const NAV_ITEMS = [
  { href: "/play", label: "Play!", match: (path: string) => path.startsWith("/play") },
  { href: "/pack", label: "Open Pack", match: (path: string) => path.startsWith("/pack") },
  { href: "/binder", label: "Binder", match: (path: string) => path.startsWith("/binder") },
  {
    href: "/collection",
    label: "Collection",
    match: (path: string) => path.startsWith("/collection"),
  },
] as const;

function warmPlayRoute(router: ReturnType<typeof useRouter>): void {
  router.prefetch("/play");
  prefetchPlayRoster();
}

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const showEditorLink = isDevToolsEnabled();

  useEffect(() => {
    if (pathname.startsWith("/play")) {
      return;
    }

    const warm = () => warmPlayRoute(router);

    if (typeof requestIdleCallback !== "undefined") {
      const idleId = requestIdleCallback(warm, { timeout: 2500 });
      return () => cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(warm, 1200);
    return () => window.clearTimeout(timeoutId);
  }, [pathname, router]);

  const linkClass = (active: boolean) =>
    ["site-nav__link", active ? "site-nav__link--active" : ""]
      .filter(Boolean)
      .join(" ");

  const warmPlayOnIntent = () => warmPlayRoute(router);

  return (
    <nav className="site-nav" aria-label="Main">
      {NAV_ITEMS.map(({ href, label, match }) => (
        <Link
          key={href}
          href={href}
          className={linkClass(match(pathname))}
          aria-current={match(pathname) ? "page" : undefined}
          onPointerEnter={href === "/play" ? warmPlayOnIntent : undefined}
          onFocus={href === "/play" ? warmPlayOnIntent : undefined}
        >
          {label}
        </Link>
      ))}
      {showEditorLink && (
        <Link
          href="/editor"
          className={`${linkClass(pathname.startsWith("/editor"))} site-nav__dev`}
          aria-current={pathname.startsWith("/editor") ? "page" : undefined}
        >
          Editor
        </Link>
      )}
    </nav>
  );
}
