import Image, { type ImageProps } from "next/image";

const DEFAULT_BLUR_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9' viewBox='0 0 16 9'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23ececec' offset='0'/%3E%3Cstop stop-color='%23d8d8d8' offset='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='16' height='9' fill='url(%23g)'/%3E%3C/svg%3E";

type SmartImageProps = ImageProps & {
  zoom?: boolean;
};

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function SmartImage({
  zoom = true,
  blurDataURL,
  className,
  alt,
  ...props
}: SmartImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      data-action={zoom ? "zoom" : undefined}
      placeholder="blur"
      blurDataURL={blurDataURL ?? DEFAULT_BLUR_DATA_URL}
      className={joinClasses("blur-up-image", className)}
    />
  );
}
