"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Featured from "./featured";
import HomeColumn from "./home-column";
import { useHomeView } from "./components/home-view-context";

const transition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

/** Index: enter from left, exit left when opening gallery. */
const indexMotion = {
  initial: { opacity: 0, x: -28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
};

/** Featured: enter from right, exit right when opening info. */
const featuredMotion = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 28 },
};

export default function HomePageLayout() {
  const { mobileView } = useHomeView();
  const showFeatured = mobileView === "featured";
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktopViewport(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div className="isolate flex flex-col gap-y-4 md:flex-row md:gap-x-12">
      {isDesktopViewport ? (
        <>
          <div className="md:relative md:z-0">
            <HomeColumn />
          </div>
          <div
            data-right-scroll
            className="md:block py-10 md:max-w-[50vw] md:relative md:z-50"
          >
            <div data-right-scroll-content data-zoom-gallery-scope>
              <Featured />
            </div>
          </div>
        </>
      ) : (
        <div className="relative w-full overflow-x-hidden md:hidden">
          <AnimatePresence mode="wait" initial={false}>
            {showFeatured ? (
              <motion.div
                key="featured"
                role="presentation"
                initial={featuredMotion.initial}
                animate={featuredMotion.animate}
                exit={featuredMotion.exit}
                transition={transition}
                className="w-full"
              >
                <div
                  data-right-scroll
                  className="block py-10 md:max-w-[50vw] md:relative md:z-50"
                >
                  <div data-right-scroll-content data-zoom-gallery-scope>
                    <Featured />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="index"
                role="presentation"
                initial={indexMotion.initial}
                animate={indexMotion.animate}
                exit={indexMotion.exit}
                transition={transition}
                className="w-full"
              >
                <div className="md:relative md:z-0">
                  <HomeColumn />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
