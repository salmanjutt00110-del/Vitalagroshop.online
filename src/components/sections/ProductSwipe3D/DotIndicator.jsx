import React from 'react';
import { motion } from 'framer-motion';

export default function DotIndicator({ total, current, onChange }) {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onChange(i)}
          className="rounded-full bg-white/20 overflow-hidden relative"
          animate={{
            width:   i === current ? 24 : 8,
            height:  8,
            opacity: i === current ? 1 : 0.4,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        >
          {i === current && (
            <motion.div
              className="h-full rounded-full bg-[#5cb85c] absolute inset-0"
              layoutId="active-dot"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
