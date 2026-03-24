"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getArchiveEntries,
  getClientEntries,
  getHomeWorkEntries,
  getHoverIdByFeaturedLinkId,
  getSocialEntries,
} from "./content/entries";
import type { ContentEntry } from "./content/entry-types";
import { useHomeView } from "./components/home-view-context";
import { useMenuHover } from "./components/menu-hover-context";
import MenuOrb, { MenuOrbOutline } from "./components/menu-orb";
import { colorForHref, DEFAULT_ORB_COLOR } from "./page-tags";

type HomeColumnProps = {
  className?: string;
};

function ExternalLinkArrowIcon({
  className = "h-3 w-3",
}: {
  className?: string;
}) {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className={className} fill="none">
      <path
        d="M2.5 9.5L9.5 2.5M4 2.5H9.5V8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type HoverableLinkProps = {
  id: string;
  href: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  isActive?: boolean;
  isDimmed?: boolean;
  /** CMS `external` entries keep the arrow and also get the hover orb on desktop; `internal` entries use the orb only. */
  variant?: "orb" | "arrow";
  shouldRenderOrb?: boolean;
  isDesktopViewport?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

function HoverableLink({
  id,
  href,
  children,
  target,
  rel,
  isActive = false,
  isDimmed = false,
  variant = "orb",
  shouldRenderOrb = false,
  isDesktopViewport = false,
  className = "",
  onClick,
}: HoverableLinkProps) {
  const { hoveredMenuLinkId, setHoveredMenuLinkId } = useMenuHover();
  const mappedHoverId = getHoverIdByFeaturedLinkId(hoveredMenuLinkId);
  const isHovered =
    !isActive && (hoveredMenuLinkId === id || mappedHoverId === id);
  const orbColor = colorForHref(href);

  const startHover = () => {
    if (isActive) return;
    setHoveredMenuLinkId(id);
  };
  const endHover = () => setHoveredMenuLinkId(null);

  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={`inline-flex items-center gap-2 ${className} ${
        isActive
          ? "md:cursor-default"
          : isDimmed
            ? "md:text-neutral-400 md:dark:text-neutral-500"
            : ""
      }`}
      style={
        isDesktopViewport && isDimmed ? undefined : { color: DEFAULT_ORB_COLOR }
      }
      onMouseEnter={startHover}
      onMouseLeave={isActive ? undefined : endHover}
      onFocus={startHover}
      onBlur={isActive ? undefined : endHover}
      onPointerDown={isActive ? undefined : endHover}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1.5">
        <span>{children}</span>
        {variant === "arrow" && <ExternalLinkArrowIcon />}
      </span>
      {shouldRenderOrb && isActive && (
        <MenuOrbOutline color={orbColor} className="mt-px" />
      )}
      {shouldRenderOrb && isHovered && !isActive && (
        <MenuOrb color={orbColor} className="mt-px" />
      )}
    </Link>
  );
}

export default function HomeColumn({ className = "" }: HomeColumnProps) {
  const pathname = usePathname();
  const { homeColumnPanel, setHomeColumnPanel } = useHomeView();
  const { hoveredMenuLinkId, setHoveredMenuLinkId } = useMenuHover();
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [hoveredArchiveHref, setHoveredArchiveHref] = useState<string | null>(
    null,
  );
  const [pendingActiveHref, setPendingActiveHref] = useState<string | null>(
    null,
  );
  const homeWorkEntries = getHomeWorkEntries();
  const clientEntries = getClientEntries();
  const socialEntries = getSocialEntries();
  const archiveEntries = getArchiveEntries();
  const hoveredEntryIdForColumn = hoveredMenuLinkId?.startsWith(
    "featured-link-",
  )
    ? getHoverIdByFeaturedLinkId(hoveredMenuLinkId)
    : hoveredMenuLinkId;
  const isHomeColumnHoverActive =
    Boolean(hoveredEntryIdForColumn) &&
    (hoveredEntryIdForColumn === "work-archive" ||
      clientEntries.some((e) => e.hoverId === hoveredEntryIdForColumn) ||
      homeWorkEntries.some((e) => e.hoverId === hoveredEntryIdForColumn) ||
      socialEntries.some((e) => e.hoverId === hoveredEntryIdForColumn));
  const isPathActive = (
    baseHref: string,
    candidate: string | null | undefined,
  ) =>
    Boolean(
      candidate &&
        (candidate === baseHref || candidate.startsWith(`${baseHref}/`)),
    );
  const isActiveProject = (href: string) =>
    isPathActive(href, pathname) || isPathActive(href, pendingActiveHref);
  const hasActiveArchiveLink = archiveEntries.some((item) =>
    isActiveProject(item.href),
  );
  const isActiveEntry = (entry: ContentEntry) => {
    if (entry.kind !== "internal") return false;
    const href = entry.href?.trim();
    if (!href) return false;
    return isActiveProject(href);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px)");
    const updateViewport = () => setIsDesktopViewport(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    setPendingActiveHref(null);
  }, [pathname]);

  const handleOptimisticInternalNavigation = (href: string) => {
    // Force the shared orb to return to the header immediately on click.
    setHoveredMenuLinkId(null);
    setPendingActiveHref(href);
  };

  return (
    <div
      className={`flex flex-col pt-8 md:pt-12 md:w-[450px] mx-auto md:mx-0 ${className}`.trim()}
    >
      <AnimatePresence mode="wait" initial={false}>
        {homeColumnPanel === "archive" ? (
          <motion.div
            key="archive-view"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col"
          >
            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 cursor-pointer mb-4"
              onClick={() => setHomeColumnPanel("default")}
            >
              <span aria-hidden>←</span>
            </button>
            <ul
              id="archive-project-links"
              className="pr-2 text-sm leading-[1.45]"
            >
              {archiveEntries.map((item, index) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.22,
                    delay: index * 0.03,
                    ease: "easeOut",
                  }}
                >
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-2 ${
                      hasActiveArchiveLink &&
                      !isActiveProject(item.href) &&
                      hoveredArchiveHref !== item.href
                        ? "md:text-neutral-400 md:dark:text-neutral-500"
                        : ""
                    }`}
                    style={
                      isDesktopViewport &&
                      hasActiveArchiveLink &&
                      !isActiveProject(item.href) &&
                      hoveredArchiveHref !== item.href
                        ? undefined
                        : { color: DEFAULT_ORB_COLOR }
                    }
                    onMouseEnter={() => setHoveredArchiveHref(item.href)}
                    onMouseLeave={() => setHoveredArchiveHref(null)}
                    onFocus={() => setHoveredArchiveHref(item.href)}
                    onBlur={() => setHoveredArchiveHref(null)}
                    onClick={() =>
                      handleOptimisticInternalNavigation(item.href)
                    }
                  >
                    <span>
                      {item.label}{" "}
                      <span className="text-neutral-500 dark:text-neutral-500">
                        {item.descriptor}
                      </span>
                    </span>
                    {isDesktopViewport && isActiveProject(item.href) ? (
                      <MenuOrbOutline
                        color={colorForHref(item.href)}
                        className="mt-px shrink-0"
                      />
                    ) : null}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <motion.div
            key="default-view"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col"
          >
            <small className="text-neutral-500 dark:text-neutral-500 mb-2">ABOUT ME</small>
            <div className="leading-[1.6] md:leading-[1.7] tracking-relaxed font-[family-name:var(--font-baskerville)] md:text-[1.12rem]">
              
              I&apos;m <b>Owen Caldwell</b>, an NYC-based{" "}
              <Link
                target="_blank"
                rel="noreferrer"
                href="https://deadline.com/2026/02/keir-gilchrist-elsie-fisher-to-star-nightflirt-horror-movie-1236727303/"
                style={{ color: DEFAULT_ORB_COLOR }}
              >
                Design Engineer
              </Link>{" "}
              and New York University graduate.
              <br />
              <br />
              My{" "}
              <Link
                href={"/p/seniorproject"}
                style={{ color: DEFAULT_ORB_COLOR }}
              >
                thesis{" "}
              </Link>{" "}
              at NYU is a generative art installation that uses{" "}
              <i>Lindenmayer systems</i> to draw paintings.
              <br />
              <br />I also run a solo <b>web design and development</b>{" "}
              practice. Currently building fictional UIs for an{" "}
              <Link
                target="_blank"
                rel="noreferrer"
                href="https://deadline.com/2026/02/keir-gilchrist-elsie-fisher-to-star-nightflirt-horror-movie-1236727303/"
                style={{ color: DEFAULT_ORB_COLOR }}
              >
                indie horror film
              </Link>
            </div>

            <ul className="my-4 py-4 border-y border-neutral-200 dark:border-neutral-800">
              <small className="text-neutral-500 dark:text-neutral-500">PROJECTS + CLIENTS</small>
              {homeWorkEntries.map((entry) => {
                const href = entry.href?.trim();
                const isActive = isActiveEntry(entry);
                const isDimmed =
                  isHomeColumnHoverActive &&
                  hoveredEntryIdForColumn !== null &&
                  hoveredEntryIdForColumn !== entry.hoverId &&
                  !isActive;
                if (!href) {
                  return (
                    
                    <li key={entry.id}>
                      <span
                        className={
                          isDimmed
                            ? "md:text-neutral-400 md:dark:text-neutral-500"
                            : ""
                        }
                      >
                        {entry.menuLabel ?? entry.title}
                      </span>
                    </li>
                  );
                }
                const isExternal = /^https?:\/\//.test(href);

                return (
                  <li key={entry.id}>
                    <HoverableLink
                      id={entry.hoverId}
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      variant={entry.kind === "external" ? "arrow" : "orb"}
                      isActive={isActive}
                      isDimmed={isDimmed}
                      shouldRenderOrb={isDesktopViewport}
                      isDesktopViewport={isDesktopViewport}
                      onClick={
                        isExternal
                          ? undefined
                          : () => handleOptimisticInternalNavigation(href)
                      }
                    >
                      {entry.menuLabel ?? entry.title}
                    </HoverableLink>
                  </li>
                );
              })}
            </ul>
            <small className="text-neutral-500 dark:text-neutral-500">SOCIAL</small>
            <ul className="space-x-2 flex mb-16 md:mb-0">
              {socialEntries.map((entry) => {
                const href = entry.href?.trim();
                if (!href) {
                  return (
                    <li key={entry.id}>
                      <span className="inline-flex flex-row items-center gap-1.5">
                        {entry.menuLabel ?? entry.title}
                      </span>
                    </li>
                  );
                }
                const isExternal = /^https?:\/\//.test(href);
                const isSocialDimmed =
                  isHomeColumnHoverActive &&
                  hoveredEntryIdForColumn !== entry.hoverId;
                return (
                  <li key={entry.id}>
                    <Link
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      className={`inline-flex flex-row items-center gap-1.5 ${
                        isSocialDimmed
                          ? "md:text-neutral-400 md:dark:text-neutral-500"
                          : ""
                      }`}
                      style={
                        isDesktopViewport && isSocialDimmed
                          ? undefined
                          : { color: DEFAULT_ORB_COLOR }
                      }
                      onMouseEnter={() => setHoveredMenuLinkId(entry.hoverId)}
                      onMouseLeave={() => setHoveredMenuLinkId(null)}
                      onFocus={() => setHoveredMenuLinkId(entry.hoverId)}
                      onBlur={() => setHoveredMenuLinkId(null)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span>{entry.menuLabel ?? entry.title}</span>
                        <ExternalLinkArrowIcon />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
