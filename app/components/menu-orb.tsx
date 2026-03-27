"use client";

import { motion } from "framer-motion";

type MenuOrbProps = {
  color: string;
  className?: string;
  /**
   * When true, shares `layoutId` with other instances so the orb can animate between
   * the header and menu links (desktop). Disable on mobile to avoid stray layout/color flashes.
   */
  sharedLayout?: boolean;
};

export default function MenuOrb({
  color,
  className = "",
  sharedLayout = true,
}: MenuOrbProps) {
  return (
    <motion.span
      {...(sharedLayout ? { layoutId: "menu-ellipse" as const } : {})}
      className={`relative z-50 inline-flex h-2.5 w-2.5 shrink-0 overflow-hidden rounded-full pointer-events-none ${className}`.trim()}
      style={{ backgroundColor: color }}
      transition={{ backgroundColor: { duration: 0 } }}
      aria-hidden
    />
  );
}

/** Open ring — same size/placement as `MenuOrb`, for the current-route indicator. */
export function MenuOrbOutline({ color, className = "" }: MenuOrbProps) {
  return (
    <span
      className={`relative z-50 inline-flex h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px] border-solid bg-transparent pointer-events-none ${className}`.trim()}
      style={{ borderColor: color }}
      aria-hidden
    />
  );
}
