"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import SmartImage from "./components/smart-image";
import {
  getFeaturedEntries,
  getFeaturedLinkIdByHoverId,
  getHoverIdByFeaturedLinkId,
} from "./content/entries";
import { useHomeView } from "./components/home-view-context";
import { useMenuHover } from "./components/menu-hover-context";

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

export default function Featured() {
  const { hoveredMenuLinkId, setHoveredMenuLinkId } = useMenuHover();
  const { mobileView } = useHomeView();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeProjectIdRef = useRef("featured-link-0");
  const links = getFeaturedEntries();
  const [galleryIndexes, setGalleryIndexes] = useState<Record<string, number>>(
    {},
  );
  const [activeProjectId, setActiveProjectId] = useState("featured-link-0");
  const [isDesktopViewport, setIsDesktopViewport] = useState<boolean | null>(null);
  const [isDesktopListHovered, setIsDesktopListHovered] = useState(false);

  const activateProject = (index: number, projectId: string) => {
    setActiveProjectId(projectId);
    const node = itemRefs.current[index];
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

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
  }, [setHoveredMenuLinkId]);

  return (
    <div
      ref={scrollContainerRef}
      className="relative z-50 flex flex-col gap-2 scroll-smooth overflow-y-auto h-dvh snap-y snap-mandatory overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:-my-20 md:py-10"
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
        const currentIndex = galleryIndexes[link.id] ?? 0;
        const currentImage = featured.images[currentIndex];
        const projectId = `featured-link-${index}`;
        const hoveredFeaturedLinkId = hoveredMenuLinkId?.startsWith("featured-link-")
          ? hoveredMenuLinkId
          : getFeaturedLinkIdByHoverId(hoveredMenuLinkId);
        const hoveredWorkHoverId = getHoverIdByFeaturedLinkId(hoveredFeaturedLinkId);
        const hasLinkedHover = hoveredWorkHoverId !== null;
        const visualActiveId = hoveredFeaturedLinkId ?? activeProjectId;
        const isInactive = isDesktopViewport === true
          ? (!isDesktopListHovered && !hasLinkedHover) || visualActiveId !== projectId
          : activeProjectId !== projectId;

        return (
          <div
            key={link.id}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            data-project-id={projectId}
            className="flex flex-col snap-center"
            onClickCapture={(event) => {
              if (!isInactive) return;
              event.preventDefault();
              event.stopPropagation();
              activateProject(index, projectId);
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (isInactive) {
                  activateProject(index, projectId);
                  return;
                }
                setGalleryIndexes((prev) => ({
                  ...prev,
                  [link.id]: (currentIndex + 1) % featured.images.length,
                }));
              }}
              className="w-full cursor-pointer text-left"
              aria-label={`Advance ${featured.title ?? link.title} gallery`}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                {featured.images.length > 1 ? (
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={currentImage}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      <SmartImage
                        width={1000}
                        height={1000}
                        alt={featured.imageAlt}
                        src={currentImage}
                        zoom={false}
                        className={`h-full w-full object-contain transition-[filter] duration-300 ease-out ${
                          isInactive ? "grayscale" : ""
                        }`}
                      />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <SmartImage
                    width={1000}
                    height={1000}
                    alt={featured.imageAlt}
                    src={currentImage}
                    zoom={false}
                    className={`h-full w-full object-contain transition-[filter] duration-300 ease-out ${
                      isInactive ? "grayscale" : ""
                    }`}
                  />
                )}
              </div>
            </button>
            <div className="flex flex-col pt-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base">{featured.title ?? link.title}</h3>
                {featured.images.length > 1 && (
                  <span className="text-sm tabular-nums">
                    {currentIndex + 1}/{featured.images.length}
                  </span>
                )}
              </div>
              <div>
                <div className={isInactive ? "text-neutral-500" : ""}>
                  <ReactMarkdown>{featured.summary}</ReactMarkdown>
                </div>
                <HoverableLink
                  href={link.href}
                  className={isInactive ? "text-neutral-500" : "text-blue-500"}
                >
                  {featured.actionText}
                </HoverableLink>
              </div>
            </div>
          </div>
        );
      })}
      <div aria-hidden className="h-[35vh] shrink-0" />
    </div>
  );
}
