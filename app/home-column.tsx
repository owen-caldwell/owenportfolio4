"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getHomeWorkEntries,
  getHoverIdByFeaturedLinkId,
  getSocialEntries,
} from "./content/entries";
import type { ContentEntry } from "./content/entry-types";
import { useMenuHover } from "./components/menu-hover-context";
import MenuOrb from "./components/menu-orb";
import { colorForHref } from "./page-tags";

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
}: HoverableLinkProps) {
  const { hoveredMenuLinkId, setHoveredMenuLinkId } = useMenuHover();
  const mappedHoverId = getHoverIdByFeaturedLinkId(hoveredMenuLinkId);
  const isHovered = !isActive && (hoveredMenuLinkId === id || mappedHoverId === id);
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
    >
      <span>{children}</span>
      {shouldRenderOrb && isHovered && <MenuOrb color={orbColor} className="mt-px" />}
    </Link>
  );
}

export default function HomeColumn({ className = "" }: HomeColumnProps) {
  const pathname = usePathname();
  const { hoveredMenuLinkId } = useMenuHover();
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const homeWorkEntries = getHomeWorkEntries();
  const socialEntries = getSocialEntries();
  const hoveredWorkLinkId = (() => {
    if (!hoveredMenuLinkId) return null;
    if (hoveredMenuLinkId.startsWith("work-")) return hoveredMenuLinkId;
    const mappedHoverId = getHoverIdByFeaturedLinkId(hoveredMenuLinkId);
    return mappedHoverId?.startsWith("work-") ? mappedHoverId : null;
  })();
  const isActiveProject = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
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

  return (
    <div
      className={`flex flex-col pt-12 md:pt-20 md:w-[450px] mx-auto md:mx-0 ${className}`.trim()}
    >
      <div className="leading-[1.5] font-[family-name:var(--font-baskerville)] md:text-lg">
        I'm <b>Owen Caldwell</b>, a New York City-based <i>Designer</i>,{" "}
        <i>Product Engineer</i>, and recent New York University graduate.
        <br />
        <br />I have designed and built custom websites also made graphics for films, coded{" "}
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
              >
                {entry.menuLabel ?? entry.title}
              </HoverableLink>
            </li>
          );
        })}
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
    </div>
  );
}
