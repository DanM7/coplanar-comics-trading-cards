"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CARD_PUBLISHER_LOGO_URL, UNIVERSE_BRAND } from "@/constants/project";
import { SignInButtons } from "@/components/auth/SignInButtons";
import { SiteNav } from "./SiteNav";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link
          href="/"
          className={["site-logo", isHome ? "site-logo--active" : ""]
            .filter(Boolean)
            .join(" ")}
          aria-current={isHome ? "page" : undefined}
        >
          <Image
            src={CARD_PUBLISHER_LOGO_URL}
            alt=""
            width={36}
            height={36}
            className="site-logo__mark"
            priority
          />
          <span className="site-logo__text">
            {UNIVERSE_BRAND}
            <span className="site-logo__sub">Trading Cards</span>
          </span>
        </Link>
        <SiteNav />
        <SignInButtons />
      </div>
    </header>
  );
}
