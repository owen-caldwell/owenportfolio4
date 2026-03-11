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
      className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${className}`.trim()}
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}
