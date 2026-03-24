"use client";

import SmartImage from "@/app/components/smart-image";
import { motion } from "framer-motion";
import { useState } from "react";

type CarouselImage = {
  src: string;
  alt: string;
};

type MdxImageCarouselProps = {
  images: CarouselImage[];
  className?: string;
};

export default function MdxImageCarousel({
  images,
  className = "",
}: MdxImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  if (!count) return null;

  const goTo = (nextIndex: number) => {
    if (!count) return;
    const normalized = ((nextIndex % count) + count) % count;
    setIndex(normalized);
  };

  return (
    <div className={`my-6 space-y-3 ${className}`.trim()}>
      <div className="relative w-full overflow-hidden border border-black/10 dark:border-white/10 rounded-lg">
        {images.map((image, imageIndex) => {
          const isCurrent = imageIndex === index;
          return (
            <motion.div
              key={`${image.src}-${imageIndex}`}
              className={
                isCurrent
                  ? "relative w-full"
                  : "absolute inset-0 w-full pointer-events-none"
              }
              aria-hidden={!isCurrent}
              initial={false}
              animate={{ opacity: isCurrent ? 1 : 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <SmartImage
                src={image.src}
                alt={image.alt}
                width={1600}
                height={900}
                sizes="100vw"
                className="block h-auto w-full max-h-[850px] object-contain"
                zoom={false}
              />
            </motion.div>
          );
        })}
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Previous image"
          className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-w-resize bg-transparent"
        />
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Next image"
          className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-e-resize bg-transparent"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-neutral-600 dark:text-neutral-400 tabular-nums">
          {index + 1}/{count}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous image"
            className="px-2 py-1 text-sm"
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next image"
            className="px-2 py-1 text-sm"
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
}
