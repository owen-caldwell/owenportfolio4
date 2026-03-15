"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getArchiveEntries,
  getHomeWorkEntries,
  getHoverIdByFeaturedLinkId,
  getSocialEntries,
} from "./content/entries";
import type { ContentEntry } from "./content/entry-types";
import { useHomeView } from "./components/home-view-context";
import { useMenuHover } from "./components/menu-hover-context";
import MenuOrb from "./components/menu-orb";
import { colorForHref, INTERNAL_LINK_FALLBACK_ORB_COLOR } from "./page-tags";

type HomeColumnProps = {
  className?: string;
};

type HoverableLinkProps = {
  id: string;
  href: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  isActive?: boolean;
  isDimmed?: boolean;
  shouldRenderOrb?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

function fadedColor(hex: string, alpha = 0.62): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return hex;

  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function HoverableLink({
  id,
  href,
  children,
  target,
  rel,
  isActive = false,
  isDimmed = false,
  shouldRenderOrb = false,
  onClick,
}: HoverableLinkProps) {
  const { hoveredMenuLinkId, setHoveredMenuLinkId } = useMenuHover();
  const mappedHoverId = getHoverIdByFeaturedLinkId(hoveredMenuLinkId);
  const isHovered =
    !isActive && (hoveredMenuLinkId === id || mappedHoverId === id);
  const orbColor = colorForHref(href);
  const activeColor = fadedColor(orbColor);

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
      className={`underline-offset-2 inline-flex items-center gap-2 ${
        isActive
          ? "cursor-default"
          : isDimmed
            ? "text-neutral-400 dark:text-neutral-500"
            : "hover:underline"
      }`}
      style={isActive ? { color: activeColor } : undefined}
      onMouseEnter={startHover}
      onMouseLeave={isActive ? undefined : endHover}
      onFocus={startHover}
      onBlur={isActive ? undefined : endHover}
      onPointerDown={isActive ? undefined : endHover}
      onClick={onClick}
    >
      <span>{children}</span>
      {shouldRenderOrb && isHovered && (
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
  const socialEntries = getSocialEntries();
  const archiveEntries = getArchiveEntries();
  const hoveredWorkLinkId = (() => {
    if (!hoveredMenuLinkId) return null;
    if (hoveredMenuLinkId.startsWith("work-")) return hoveredMenuLinkId;
    const mappedHoverId = getHoverIdByFeaturedLinkId(hoveredMenuLinkId);
    return mappedHoverId?.startsWith("work-") ? mappedHoverId : null;
  })();
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
  const isActiveEntry = (entry: ContentEntry) =>
    entry.kind === "internal" && isActiveProject(entry.href);

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
      className={`flex flex-col pt-12 md:pt-20 md:w-[450px] mx-auto md:mx-0 ${className}`.trim()}
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
                    className={`hover:underline underline-offset-2 ${
                      hasActiveArchiveLink &&
                      !isActiveProject(item.href) &&
                      hoveredArchiveHref !== item.href
                        ? "text-neutral-400 dark:text-neutral-500"
                        : ""
                    }`}
                    onMouseEnter={() => setHoveredArchiveHref(item.href)}
                    onMouseLeave={() => setHoveredArchiveHref(null)}
                    onFocus={() => setHoveredArchiveHref(item.href)}
                    onBlur={() => setHoveredArchiveHref(null)}
                    onClick={() =>
                      handleOptimisticInternalNavigation(item.href)
                    }
                  >
                    {item.label}{" "}
                    <span className="text-neutral-500 dark:text-neutral-500">
                      {item.descriptor}
                    </span>
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
            <div className="leading-[1.5] font-[family-name:var(--font-baskerville)] md:text-lg">
              I&apos;m <b>Owen Caldwell</b>, a New York City-based{" "}
              <i>Designer</i>, <i>Product Engineer</i>, and recent New York
              University graduate.
              <br />
              <br />I have designed and built custom websites also made graphics
              for films, coded{" "}
              <Link
                href={"p/seniorproject"}
                className="hover:underline underline-offset-2"
              >
                L-system paintings
              </Link>{" "}
              for an art installation, and built my own speaker.
            </div>

            <div className="pt-12 pb-4">Work</div>
            <ul>
              {homeWorkEntries.map((entry) => {
                const isActive = isActiveEntry(entry);
                const isDimmed =
                  hoveredWorkLinkId !== null &&
                  hoveredWorkLinkId !== entry.hoverId &&
                  !isActive;
                const isExternal = /^https?:\/\//.test(entry.href);

                return (
                  <li key={entry.id}>
                    <HoverableLink
                      id={entry.hoverId}
                      href={entry.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      isActive={isActive}
                      isDimmed={isDimmed}
                      shouldRenderOrb={isDesktopViewport}
                      onClick={
                        isExternal
                          ? undefined
                          : () => handleOptimisticInternalNavigation(entry.href)
                      }
                    >
                      {entry.menuLabel ?? entry.title}
                    </HoverableLink>
                  </li>
                );
              })}
              <li className="pt-1">
                <button
                  type="button"
                  className="inline-flex items-center gap-2"
                  onClick={() => {
                    setHoveredMenuLinkId(null);
                    setHomeColumnPanel("archive");
                  }}
                  onMouseEnter={() => setHoveredMenuLinkId("work-archive")}
                  onMouseLeave={() => setHoveredMenuLinkId(null)}
                  onFocus={() => setHoveredMenuLinkId("work-archive")}
                  onBlur={() => setHoveredMenuLinkId(null)}
                  onPointerDown={() => setHoveredMenuLinkId(null)}
                  aria-expanded={false}
                  aria-controls="archive-project-links"
                >
                  <span className="hover:underline underline-offset-2 cursor-pointer">
                    Archive
                  </span>
                  {isDesktopViewport &&
                    hoveredMenuLinkId === "work-archive" && (
                      <MenuOrb
                        color={INTERNAL_LINK_FALLBACK_ORB_COLOR}
                        className="mt-px"
                      />
                    )}
                </button>
              </li>
            </ul>
            <div className="pt-6 pb-4 pl-1" />
            <ul className="space-y-1">
              {socialEntries.map((entry) => {
                const isExternal = /^https?:\/\//.test(entry.href);
                return (
                  <li key={entry.id}>
                    <HoverableLink
                      id={entry.hoverId}
                      href={entry.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      shouldRenderOrb={isDesktopViewport}
                    >
                      {entry.menuLabel ?? entry.title}
                    </HoverableLink>
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
