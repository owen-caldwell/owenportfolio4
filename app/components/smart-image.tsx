import type { ImgHTMLAttributes } from "react";

/** Neutral 1×1 — no implied aspect ratio when width/height aren’t known. */
const NEUTRAL_BLUR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1' viewBox='0 0 1 1'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23ececec' offset='0'/%3E%3Cstop stop-color='%23d8d8d8' offset='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1' height='1' fill='url(%23g)'/%3E%3C/svg%3E";

function parsePositiveDim(value: number | string | undefined): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** When width & height are set, match placeholder aspect ratio to the real image. */
function defaultBlurPlaceholder(
  width: number | string | undefined,
  height: number | string | undefined,
): string {
  const w = parsePositiveDim(width);
  const h = parsePositiveDim(height);
  if (w == null || h == null) return NEUTRAL_BLUR_PLACEHOLDER;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ececec" offset="0"/><stop stop-color="#d8d8d8" offset="1"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type SmartImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  /** Enables zoom.js on click (`data-action="zoom"`). Default on; pass `false` to disable. */
  zoom?: boolean;
  blurDataURL?: string;
};

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function SmartImage({
  src,
  zoom = true,
  blurDataURL,
  className,
  srcSet,
  alt = "",
  width,
  height,
  ...props
}: SmartImageProps) {
  const placeholderSrc =
    blurDataURL ?? defaultBlurPlaceholder(width, height);

  return (
    // Lazysizes only unveils once per element; remount when `src` changes so
    // carousels and other dynamic swaps show the new image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      width={width}
      height={height}
      {...props}
      alt={alt}
      src={placeholderSrc}
      data-src={src}
      data-srcset={srcSet}
      data-action={zoom ? "zoom" : undefined}
      className={joinClasses("lazyload blur-up-image", className)}
    />
  );
}
