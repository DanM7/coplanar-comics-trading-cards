"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CARD_PUBLISHER_LOGO_URL, UNIVERSE_BRAND } from "@/constants/project";
import { SignInButtons } from "@/components/auth/SignInButtons";
import { PACK_COMPACT_HORIZONTAL_MQ } from "@/lib/pack-viewport";
import { SiteNav } from "./SiteNav";

const MOBILE_HEADER_MQ = "(max-width: 768px)";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [isMobile, setIsMobile] = useState(false);
  const [isCompactLandscape, setIsCompactLandscape] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const useCollapsedHeader = isMobile || isCompactLandscape;

  const closeMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  const openMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(true);
  }, []);

  useEffect(() => {
    const mobileMedia = window.matchMedia(MOBILE_HEADER_MQ);
    const landscapeMedia = window.matchMedia(PACK_COMPACT_HORIZONTAL_MQ);

    const syncLayout = () => {
      const mobile = mobileMedia.matches;
      const landscape = landscapeMedia.matches;

      setIsMobile(mobile);
      setIsCompactLandscape(landscape);

      const onPackPage =
        pathname === "/pack" || pathname.startsWith("/pack/");
      if (onPackPage) {
        document.documentElement.setAttribute("data-pack-page", "true");
      } else {
        document.documentElement.removeAttribute("data-pack-page");
      }

      if (landscape) {
        document.documentElement.setAttribute("data-mobile-landscape", "true");
      } else {
        document.documentElement.removeAttribute("data-mobile-landscape");
        setMobileDrawerOpen(false);
      }
    };

    syncLayout();
    mobileMedia.addEventListener("change", syncLayout);
    landscapeMedia.addEventListener("change", syncLayout);

    return () => {
      mobileMedia.removeEventListener("change", syncLayout);
      landscapeMedia.removeEventListener("change", syncLayout);
      document.documentElement.removeAttribute("data-pack-page");
      document.documentElement.removeAttribute("data-mobile-landscape");
    };
  }, [pathname]);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!useCollapsedHeader || !mobileDrawerOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileDrawer();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMobileDrawer, mobileDrawerOpen, useCollapsedHeader]);

  return (
    <header
      className={[
        "site-header",
        useCollapsedHeader ? "site-header--mobile" : "",
        isCompactLandscape ? "site-header--mobile-landscape" : "",
        mobileDrawerOpen ? "site-header--mobile-drawer-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {useCollapsedHeader && mobileDrawerOpen ? (
        <button
          type="button"
          className="site-header__mobileBackdrop"
          aria-label="Close menu"
          onClick={closeMobileDrawer}
        />
      ) : null}

      {useCollapsedHeader && !mobileDrawerOpen ? (
        <button
          type="button"
          className="site-header__mobileToggle"
          aria-label="Open menu"
          aria-expanded={false}
          onClick={openMobileDrawer}
        >
          {/* Same transparent asset as card fronts; avoid CardPublisherLogo card layout styles */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CARD_PUBLISHER_LOGO_URL}
            alt=""
            className="site-header__mobileToggleMark"
            crossOrigin="anonymous"
            aria-hidden
          />
        </button>
      ) : null}

      <div
        className={[
          "site-header__mobileShell",
          mobileDrawerOpen ? "site-header__mobileShell--open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="site-header__inner">
          <Link
            href="/"
            className={["site-logo", isHome ? "site-logo--active" : ""]
              .filter(Boolean)
              .join(" ")}
            aria-current={isHome ? "page" : undefined}
            onClick={useCollapsedHeader ? closeMobileDrawer : undefined}
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
      </div>
    </header>
  );
}
