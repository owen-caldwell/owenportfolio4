"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  getFeaturedEntries,
  getFeaturedLinkIdByHoverId,
  getHoverIdByFeaturedLinkId,
} from "./content/entries";
import { useHomeView } from "./components/home-view-context";
import { useMenuHover } from "./components/menu-hover-context";
import SmartImage from "./components/smart-image";

function ExternalLinkArrowIcon({
  className = "h-3 w-3 shrink-0",
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
  href: string;
  children: React.ReactNode;
  className?: string;
};

function HoverableLink({ href, children, className = "" }: HoverableLinkProps) {
  return (
    <Link
      href={href}
      className={`relative z-20 underline-offset-2 inline-flex items-center gap-2 hover:underline ${className}`.trim()}
    >
      <span>{children}</span>
    </Link>
  );
}

function isVideoMedia(src: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
}

function isUsableFeaturedHref(trimmedHref: string): boolean {
  if (!trimmedHref) return false;
  return /^https?:\/\//.test(trimmedHref) || trimmedHref.startsWith("/");
}

function isExternalFeaturedHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

type FeaturedDestinationLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

function FeaturedDestinationLink({
  href,
  children,
  className = "",
  "aria-label": ariaLabel,
}: FeaturedDestinationLinkProps) {
  const external = isExternalFeaturedHref(href);
  const mergedClass = `block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${className}`.trim();
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={mergedClass}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={mergedClass} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export default function Featured() {
  const { hoveredMenuLinkId, setHoveredMenuLinkId } = useMenuHover();
  const { mobileView } = useHomeView();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeProjectIdRef = useRef("featured-link-0");
  const links = useMemo(() => getFeaturedEntries(), []);
  const [activeProjectId, setActiveProjectId] = useState("featured-link-0");
  const [isDesktopViewport, setIsDesktopViewport] = useState<boolean | null>(
    null,
  );
  const [isDesktopListHovered, setIsDesktopListHovered] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const activateProject = (index: number, projectId: string) => {
    setActiveProjectId(projectId);
    const node = itemRefs.current[index];
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px)");
    const updateViewport = () => setIsDesktopViewport(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  useLayoutEffect(() => {
    if (isDesktopViewport === null) return;
    activeProjectIdRef.current = activeProjectId;
    if (!isDesktopViewport) {
      if (mobileView === "featured") {
        setHoveredMenuLinkId(activeProjectId);
      } else {
        setHoveredMenuLinkId(null);
      }
      return;
    }
    if (isDesktopListHovered) {
      setHoveredMenuLinkId(activeProjectId);
    }
  }, [
    activeProjectId,
    isDesktopViewport,
    isDesktopListHovered,
    mobileView,
    setHoveredMenuLinkId,
  ]);

  useEffect(() => {
    if (mobileView !== "featured") return;

    const firstProjectId = "featured-link-0";
    const root = scrollContainerRef.current;
    if (root) {
      root.scrollTo({ top: 0, behavior: "auto" });
    }
    setActiveProjectId(firstProjectId);
  }, [mobileView]);

  useEffect(() => {
    if (!hoveredMenuLinkId) return;
    const featuredId = getFeaturedLinkIdByHoverId(hoveredMenuLinkId);
    if (!featuredId) return;

    const index = Number(featuredId.replace("featured-link-", ""));
    if (!Number.isFinite(index) || index < 0) return;

    activateProject(index, featuredId);
  }, [hoveredMenuLinkId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    for (const link of links) {
      const first = link.featured?.media?.[0];
      if (!first?.src) continue;
      if (isVideoMedia(first.src)) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = first.src;
        video.load();
        if (first.poster) {
          const poster = new Image();
          poster.src = first.poster;
        }
        continue;
      }
      const image = new Image();
      image.src = first.src;
    }
  }, [links]);

  useEffect(() => {
    if (!hasMounted) return;
    const root = scrollContainerRef.current;
    if (!root) return;

    let frameId = 0;

    const updateActiveFromScroll = () => {
      const anchorY = root.scrollTop + root.clientHeight / 2;
      let closestId: string | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const item of itemRefs.current) {
        if (!item) continue;
        const id = item.dataset.projectId;
        if (!id) continue;

        const itemCenter = item.offsetTop + item.offsetHeight / 2;
        const distance = Math.abs(itemCenter - anchorY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = id;
        }
      }

      if (!closestId) return;

      if (activeProjectIdRef.current !== closestId) {
        setActiveProjectId(closestId);
      }
    };

    const queueUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateActiveFromScroll();
      });
    };

    updateActiveFromScroll();
    root.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      root.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
    };
  }, [hasMounted, setHoveredMenuLinkId]);

  const shellClassName =
    "relative z-50 flex flex-col gap-20 overflow-y-auto md:h-dvh md:overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:-my-20 md:py-10";

  if (!hasMounted) {
    return (
      <div ref={scrollContainerRef} className={shellClassName} aria-hidden />
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className={shellClassName}
      onMouseEnter={() => {
        if (isDesktopViewport !== true) return;
        setIsDesktopListHovered(true);
      }}
      onMouseLeave={() => {
        if (isDesktopViewport !== true) return;
        setIsDesktopListHovered(false);
        setHoveredMenuLinkId(null);
      }}
    >
      {links.map((link, index) => {
        if (!link.featured) return null;
        const featured = link.featured;
        const actionHref = (link.href ?? "").trim();
        const actionText = featured.actionText?.trim();
        const showActionButton =
          Boolean(actionText) && isUsableFeaturedHref(actionHref);
        const destinationHref = isUsableFeaturedHref(actionHref)
          ? actionHref
          : "";
        const primaryMedia = featured.media[0];
        const projectId = `featured-link-${index}`;
        const hoveredFeaturedLinkId = hoveredMenuLinkId?.startsWith(
          "featured-link-",
        )
          ? hoveredMenuLinkId
          : getFeaturedLinkIdByHoverId(hoveredMenuLinkId);
        const hoveredWorkHoverId = getHoverIdByFeaturedLinkId(
          hoveredFeaturedLinkId,
        );
        const hasLinkedHover = hoveredWorkHoverId !== null;
        const visualActiveId = hoveredFeaturedLinkId ?? activeProjectId;
        const isInactive =
          isDesktopViewport === true
            ? (!isDesktopListHovered && !hasLinkedHover) ||
              visualActiveId !== projectId
            : activeProjectId !== projectId;
        const dimDescriptionAndAction =
          isDesktopViewport === true && isInactive;

        const mediaBlock = primaryMedia ? (
          isVideoMedia(primaryMedia.src) ? (
            <video
              src={primaryMedia.src}
              poster={primaryMedia.poster}
              className="block h-auto w-full"
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              aria-label={featured.imageAlt}
            />
          ) : (
            <SmartImage
              alt={featured.imageAlt}
              src={primaryMedia.src}
              width={1600}
              height={900}
              className="block h-auto w-full"
              sizes="100vw"
              zoom={false}
            />
          )
        ) : null;

        return (
          <div
            key={link.id}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            data-project-id={projectId}
            className="flex flex-col md:snap-center"
          >
            <div className="w-full">
              <div className="relative w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                {destinationHref ? (
                  <FeaturedDestinationLink
                    href={destinationHref}
                    aria-label={`Open project: ${featured.title ?? link.title}`}
                  >
                    {mediaBlock}
                  </FeaturedDestinationLink>
                ) : (
                  mediaBlock
                )}
              </div>
            </div>
            <div
              className="flex flex-col pt-2 text-sm md:text-base tracking-relaxed"
              onClickCapture={(event) => {
                if (!isInactive) return;
                event.preventDefault();
                event.stopPropagation();
                activateProject(index, projectId);
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <h3>{featured.title ?? link.title}</h3>
              </div>
              <div>
                <div
                  className={
                    dimDescriptionAndAction ? "text-neutral-500" : ""
                  }
                >
                  <ReactMarkdown>{featured.summary}</ReactMarkdown>
                </div>
                {showActionButton ? (
                  isExternalFeaturedHref(actionHref) ? (
                    <a
                      href={actionHref}
                      target="_blank"
                      rel="noreferrer"
                      className={`relative z-20 underline-offset-2 inline-flex items-center gap-2 hover:underline ${
                        dimDescriptionAndAction
                          ? "text-neutral-500"
                          : "text-blue-500"
                      }`.trim()}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span>{actionText}</span>
                        <ExternalLinkArrowIcon />
                      </span>
                    </a>
                  ) : (
                    <HoverableLink
                      href={actionHref}
                      className={
                        dimDescriptionAndAction
                          ? "text-neutral-500"
                          : "text-blue-500"
                      }
                    >
                      {actionText}
                    </HoverableLink>
                  )
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
      <div aria-hidden className="md:h-[35vh] shrink-0" />
    </div>
  );
}
