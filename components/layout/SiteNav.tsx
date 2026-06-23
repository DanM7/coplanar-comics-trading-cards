"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDevToolsEnabled } from "@/lib/dev-only";

const NAV_ITEMS = [
  { href: "/pack", label: "Open Pack", match: (path: string) => path.startsWith("/pack") },
  { href: "/binder", label: "Binder", match: (path: string) => path.startsWith("/binder") },
  {
    href: "/collection",
    label: "Collection",
    match: (path: string) => path.startsWith("/collection"),
  },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const showEditorLink = isDevToolsEnabled();

  const linkClass = (active: boolean) =>
    ["site-nav__link", active ? "site-nav__link--active" : ""]
      .filter(Boolean)
      .join(" ");

  return (
    <nav className="site-nav" aria-label="Main">
      {NAV_ITEMS.map(({ href, label, match }) => (
        <Link
          key={href}
          href={href}
          className={linkClass(match(pathname))}
          aria-current={match(pathname) ? "page" : undefined}
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
