"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

const EASE_LUX = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Renderiza hijos en cascada (stagger) si son varios elementos */
  stagger?: boolean;
}

/**
 * Aparición elegante al entrar en viewport (fade + slide-up con easing de lujo).
 * Respeta prefers-reduced-motion vía la regla global de globals.css.
 */
export default function Reveal({ children, className, delay = 0, y = 28, stagger = false }: RevealProps) {
  if (stagger) {
    const container: Variants = {
      hidden: {},
      show: { transition: { staggerChildren: 0.12, delayChildren: delay } },
    };
    const item: Variants = {
      hidden: { opacity: 0, y },
      show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_LUX } },
    };
    return (
      <motion.div
        className={className}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        {React.Children.map(children, (child, i) => (
          <motion.div key={i} variants={item}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, ease: EASE_LUX, delay }}
    >
      {children}
    </motion.div>
  );
}
