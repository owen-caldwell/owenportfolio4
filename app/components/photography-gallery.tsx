"use client";

import SmartImage from "@/app/components/smart-image";

type GalleryImage = {
  src: string;
  alt: string;
};

type PhotographyGalleryProps = {
  images: GalleryImage[];
  className?: string;
};

export default function PhotographyGallery({
  images,
  className = "",
}: PhotographyGalleryProps) {
  const count = images.length;

  if (!count) return null;

  return (
    <div
      className={`my-6 columns-1 gap-4 sm:columns-2 lg:columns-3 ${className}`.trim()}
    >
      {images.map((image) => (
        <div
          key={image.src}
          className="mb-4 break-inside-avoid overflow-hidden"
        >
          <SmartImage
            src={image.src}
            alt={image.alt}
            width={1200}
            height={1600}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            zoom
          />
        </div>
      ))}
    </div>
  );
}
