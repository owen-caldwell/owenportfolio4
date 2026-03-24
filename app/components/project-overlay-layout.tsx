"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { getLayoutBySlug } from "../content/entries";
import HomeColumn from "../home-column";

type ProjectOverlayLayoutProps = {
  children: React.ReactNode;
};

export default function ProjectOverlayLayout({
  children,
}: ProjectOverlayLayoutProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const slug = pathSegments[0] === "p" ? (pathSegments[1] ?? null) : null;
  const layout = getLayoutBySlug(slug);
  const contentClassByLayout = {
    article: "prose pb-20",
    gallery: "pb-20 [&_img]:my-2 [&_iframe]:w-full",
    custom: "pb-20",
  } as const;
  const desktopContentClass = contentClassByLayout[layout];
  const mobileContentClass =
    layout === "article"
      ? "prose pb-16"
      : "pb-16 [&_img]:my-2 [&_iframe]:w-full";

  return (
    <>
      <div className="md:grid md:grid-cols-2 md:gap-8">
        <div className="hidden md:block">
          <HomeColumn />
        </div>
        <motion.div
          key={`desktop-${pathname}`}
          data-right-scroll
          className="hidden md:block py-10 md:py-4 md:overflow-y-scroll md:max-h-screen md:fixed md:right-18 md:top-0 md:max-w-[50vw] mx-auto md:mx-0 w-full px-2 md:px-0"
          initial={{ x: 48, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <div data-right-scroll-content className="max-w-[700px]">
            <div className={desktopContentClass} data-zoom-gallery-scope>
              {children}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        key={`mobile-${pathname}`}
        className="md:hidden"
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <div className={mobileContentClass} data-zoom-gallery-scope>
          {children}
        </div>
      </motion.div>
    </>
  );
}
