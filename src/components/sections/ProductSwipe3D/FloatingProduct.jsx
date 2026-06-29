import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingProduct({ src, alt, isActive }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="relative flex items-center justify-center">
      {/* Product image — 3D float */}
      <motion.div
        animate={isActive && !isMobile ? {
          y: [0, -14, 0],
          rotateX: [0, 3, 0],
          rotateY: [0, 5, 0, -5, 0],
        } : {}}
        transition={{
          y:       { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
          rotateX: { duration: 5,   repeat: Infinity, ease: 'easeInOut' },
          rotateY: { duration: 8,   repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <img
          src={src}
          alt={alt}
          className="w-44 h-44 object-contain aspect-square"
          style={{
            filter: isMobile
              ? 'none'
              : isActive
                ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'
                : 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
            transition: 'filter 0.5s ease',
          }}
          loading="lazy"
        />
      </motion.div>
    </div>
  );
}
