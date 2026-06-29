import React from 'react';
import { motion } from 'framer-motion';

/**
 * ScrollReveal component to animate child elements when they enter the viewport.
 * Uses an elegant spring animation matching award-winning creative frontend standards.
 * 
 * @param {React.ReactNode} children - The elements to wrap and animate.
 * @param {number} delay - Animation delay in seconds.
 * @param {number} yOffset - The initial y translation offset.
 * @param {number} duration - Fallback duration in seconds.
 * @param {number} stiffness - Spring stiffness.
 * @param {number} damping - Spring damping coefficient.
 * @param {boolean} once - If true, animation fires only once.
 * @param {string} margin - Viewport boundary margins.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  yOffset = 50,
  duration = 0.85,
  stiffness = 90,
  damping = 16,
  once = true,
  margin = '-8% 0px'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin }}
      transition={{
        type: 'spring',
        stiffness,
        damping,
        delay,
        duration
      }}
    >
      {children}
    </motion.div>
  );
}
