import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

export type RevealPreset = "rise" | "fade" | "left" | "right" | "scale" | "blur" | "tilt" | "pop";

const VARIANTS: Record<RevealPreset, Variants> = {
  rise: {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },

  pop: {
    hidden: { opacity: 0, scale: 0.92, y: 16 },
    visible: { opacity: 1, scale: 1, y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  left: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0 },
  },
  tilt: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
};

export interface RevealProps {
  children: ReactNode;
  preset?: RevealPreset;

  delay?: number;

  duration?: number;

  amount?: number;
  className?: string;
}

export function Reveal({
  children,
  preset = "rise",
  delay = 0,
  duration = 0.35,
  amount = 0.15,
  className,
}: RevealProps) {
  const prefersReducedMotion = useHydratedReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      data-reveal=""
      className={className}
      variants={VARIANTS[preset]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
