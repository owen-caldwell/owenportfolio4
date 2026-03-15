"use client";

import { motion } from "framer-motion";

type MenuOrbProps = {
  color: string;
  className?: string;
};

export default function MenuOrb({ color, className = "" }: MenuOrbProps) {
  return (
    <motion.span
      layoutId="menu-ellipse"
      className={`relative z-50 inline-flex h-2.5 w-2.5 shrink-0 overflow-hidden rounded-full pointer-events-none ${className}`.trim()}
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}
