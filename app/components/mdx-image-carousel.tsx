"use client";

import Image from "next/image";
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

  const current = images[index];
  const goTo = (nextIndex: number) => {
    if (!count) return;
    const normalized = ((nextIndex % count) + count) % count;
    setIndex(normalized);
  };

  return (
    <div className={`my-6 space-y-3 ${className}`.trim()}>
      <div className="relative overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
        <Image
          src={current.src}
          alt={current.alt}
          width={1600}
          height={1200}
          sizes="(max-width: 768px) 100vw, 800px"
          className="h-auto w-full"
          priority={index === 0}
        />
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
