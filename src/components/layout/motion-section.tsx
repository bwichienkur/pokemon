"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface MotionSectionProps extends React.ComponentProps<typeof motion.section> {
  children: React.ReactNode;
}

export function MotionSection({ children, ...props }: MotionSectionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.section>
  );
}
