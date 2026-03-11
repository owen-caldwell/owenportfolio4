"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useHomeView } from "./components/home-view-context";
import { useMenuHover } from "./components/menu-hover-context";
import MenuOrb from "./components/menu-orb";
import { colorForHref, DEFAULT_ORB_COLOR } from "./page-tags";

export function Name() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { mobileView, setMobileView } = useHomeView();
  const { hoveredMenuLinkId } = useMenuHover();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathSegments = pathname.split("/").filter(Boolean); // Split the path into segments and remove empty strings
  const currentProjectSlug =
    pathSegments[0] === "p" && pathSegments[1] ? pathSegments[1] : null;
  const currentOrbColor = currentProjectSlug
    ? colorForHref(`/p/${currentProjectSlug}`)
    : DEFAULT_ORB_COLOR;
  const recommendedRoutes = [
    { href: "/p/fda-redesign", label: "FDA Nutrition Facts" },
    { href: "/p/lacima", label: "La Cima Elementary" },
    { href: "/p/seniorproject", label: "Senior Project" },
    { href: "/p/acc-final-project", label: "ACC Final Project" },
  ];

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-2 z-40 -mx-1 mb-2 rounded-full border border-black/5 bg-white/60 px-3 py-2 text-[#242424] backdrop-blur-xl dark:border-white/15 dark:bg-[#141414]/60 dark:text-neutral-200 md:static md:mx-0 md:mb-0 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-start gap-2">
        <div className="flex gap-2">
          <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0">
            {hoveredMenuLinkId === null && <MenuOrb color={currentOrbColor} />}
          </span>
          <nav className="flex text-sm">
            <Link href="/" className="hover:underline underline-offset-2">
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
            onClick={() =>
              setMobileView(mobileView === "featured" ? "index" : "featured")
            }
            aria-label={
              mobileView === "featured" ? "Switch to index" : "Switch to gallery"
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
              {recommendedRoutes.map((route, index) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className="inline-flex items-center gap-2 hover:underline underline-offset-2"
                  >
                    <span>{route.label}</span>
                    <motion.span
                      aria-hidden
                      className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full"
                      initial={{ backgroundColor: DEFAULT_ORB_COLOR }}
                      animate={{ backgroundColor: colorForHref(route.href) }}
                      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
