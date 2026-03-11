"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import HomeColumn from "../home-column";

type ProjectOverlayLayoutProps = {
  children: React.ReactNode;
};

export default function ProjectOverlayLayout({
  children,
}: ProjectOverlayLayoutProps) {
  const [animKey, setAnimKey] = useState(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setAnimKey((value) => value + 1);
  }, [children]);

  return (
    <>
      <div className="md:grid md:grid-cols-2 md:gap-8">
        <div className="hidden md:block">
          <HomeColumn />
        </div>
        <motion.div
          key={`desktop-${animKey}`}
          data-right-scroll
          className="hidden md:block py-10 md:overflow-y-scroll md:max-h-screen md:fixed md:right-4 md:top-0 md:max-w-[50vw] mx-auto md:mx-0 w-full px-2 md:px-0"
          initial={{ x: 48, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <div data-right-scroll-content>
            <div className="prose pb-20">{children}</div>
          </div>
        </motion.div>
      </div>

      <motion.div
        key={`mobile-${animKey}`}
        className="md:hidden"
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <div className="prose pb-16">{children}</div>
      </motion.div>
    </>
  );
}
