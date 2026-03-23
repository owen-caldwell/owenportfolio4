"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getEntryByHoverId,
  getMobileFeaturedMenuEntries,
} from "./content/entries";
import { useHomeView } from "./components/home-view-context";
import { useMenuHover } from "./components/menu-hover-context";
import MenuOrb from "./components/menu-orb";
import {
  colorForHref,
  colorForMenuHoverId,
  DEFAULT_ORB_COLOR,
} from "./page-tags";

function fadedColor(hex: string, alpha = 0.62): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return hex;

  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Name() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { mobileView, setMobileView } = useHomeView();
  const { hoveredMenuLinkId, setHoveredMenuLinkId } = useMenuHover();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const pathSegments = pathname.split("/").filter(Boolean); // Split the path into segments and remove empty strings
  const currentProjectSlug =
    pathSegments[0] === "p" && pathSegments[1] ? pathSegments[1] : null;
  const currentOrbColor = currentProjectSlug
    ? colorForHref(`/p/${currentProjectSlug}`)
    : DEFAULT_ORB_COLOR;
  const hoveredOrbColor = colorForMenuHoverId(hoveredMenuLinkId);
  const orbColor = hoveredOrbColor ?? currentOrbColor;
  const isFeaturedHoverTarget = hoveredMenuLinkId?.startsWith("featured-link-");
  const hoveredEntry = hoveredMenuLinkId
    ? getEntryByHoverId(hoveredMenuLinkId)
    : null;
  // Hide header orb when a link-side orb is shown (work/client hovers + archive control).
  const showLinkOrbInsteadOfHeader =
    isDesktopViewport &&
    hoveredMenuLinkId !== null &&
    !isFeaturedHoverTarget &&
    (hoveredMenuLinkId === "work-archive" || hoveredEntry !== null);
  const showHeaderOrb = !showLinkOrbInsteadOfHeader;
  const recommendedRoutes = getMobileFeaturedMenuEntries();
  const isActiveProjectRoute = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px)");
    const updateViewport = () => setIsDesktopViewport(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  return (
    <motion.header
      layoutRoot
      className="sticky top-2 z-40 -mx-1 mb-2 rounded-full border border-black/5 bg-white/60 px-3 py-2 text-[#242424] backdrop-blur-xl dark:border-white/15 dark:bg-[#141414]/60 dark:text-neutral-200 md:static md:mx-0 md:mb-0 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none font-[family-name:var(--font-geist-sans)]"
    >
      <div className="flex items-start gap-2">
        <div className="flex gap-2">
          <span className="relative z-20 mt-[4.5px] inline-flex h-2.5 w-2.5 shrink-0">
            {showHeaderOrb && <MenuOrb color={orbColor} />}
          </span>
          <nav className="flex text-sm">
            <Link
              href="/"
              className="hover:underline underline-offset-2"
              onClick={() => {
                setHoveredMenuLinkId(null);
                setMobileView("index");
              }}
            >
              Owen Caldwell
            </Link>
            {pathSegments.map((segment, index) => {
              if (segment === "p") return null; // Skip rendering for the "p" segment
              const href = "/" + pathSegments.slice(0, index + 1).join("/"); // Construct the path for each breadcrumb
              const isLast = index === pathSegments.length - 1; // Check if it's the last breadcrumb
              return (
                <span
                  key={href}
                  className="flex items-center text-gray-500 dark:text-neutral-400"
                >
                  <span className="mx-2">/</span>
                  {isLast ? (
                    <>
                      <span className="hidden md:inline">{segment}</span>
                      <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen((value) => !value)}
                        className="md:hidden inline-flex items-center gap-1 hover:underline underline-offset-2"
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-featured-menu"
                      >
                        <span>{segment}</span>
                        <svg
                          aria-hidden
                          viewBox="0 0 12 12"
                          className={`h-3 w-3 transition-transform ${
                            isMobileMenuOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                        >
                          <path
                            d="M3 4.5L6 7.5L9 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <Link
                      className="hover:underline underline-offset-2"
                      href={href}
                    >
                      {segment}
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>
        </div>

        {isHomePage ? (
          <button
            type="button"
            className="ml-auto md:hidden text-sm tracking-wide"
            onClick={() => {
              const nextView = mobileView === "featured" ? "index" : "featured";
              if (nextView === "index") {
                setHoveredMenuLinkId(null);
              } else {
                setHoveredMenuLinkId("featured-link-0");
              }
              setMobileView(nextView);
            }}
            aria-label={
              mobileView === "featured"
                ? "Switch to index"
                : "Switch to gallery"
            }
          >
            {mobileView === "featured" ? "INDEX" : "GALLERY"}
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            id="mobile-featured-menu"
            className="md:hidden absolute w-[200px] left-32 right-2 top-full z-30 mt-3 rounded-md bg-white/95 p-3 text-sm shadow-lg backdrop-blur dark:bg-[#141414]/75"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <ul className="space-y-1">
              {recommendedRoutes.map((route) => {
                const href = route.href?.trim();
                const label = route.menuLabel ?? route.title;
                if (!href) {
                  return (
                    <li key={route.id}>
                      <span className="inline-flex leading-[1.6] items-center gap-2">
                        {label}
                      </span>
                    </li>
                  );
                }
                const isActive = isActiveProjectRoute(href);
                const activeColor = fadedColor(colorForHref(href));

                return (
                  <li key={route.id}>
                    <Link
                      href={href}
                      className="inline-flex leading-[1.6] items-center gap-2 hover:underline underline-offset-2"
                      style={isActive ? { color: activeColor } : undefined}
                    >
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
