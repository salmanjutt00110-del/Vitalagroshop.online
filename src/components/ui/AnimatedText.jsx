import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function AnimatedText({
  text,
  className = '',
  once = true,
  delay = 0,
}) {
  const { ref, inView } = useInView({ triggerOnce: once, threshold: 0.1 });

  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: delay },
    },
  };

  const child = {
    hidden: {
      y: '110%',
    },
    visible: {
      y: '0%',
      transition: {
        ease: [0.16, 1, 0.3, 1],
        duration: 0.8,
      },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap gap-x-[0.25em] gap-y-[0.05em] overflow-hidden py-1 ${className}`}
      variants={container}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {words.map((word, idx) => (
        <span key={idx} className="overflow-hidden inline-block h-fit">
          <motion.span variants={child} className="inline-block">
            {word === '' ? '\u00A0' : word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
