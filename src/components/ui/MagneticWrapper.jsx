import React from 'react';
import { motion } from 'framer-motion';
import useMagneticEffect from '@/hooks/useMagneticEffect';

export default function MagneticWrapper({ children, strength = 0.3, radius = 80 }) {
  const { ref, x, y } = useMagneticEffect(strength, radius);

  return (
    <motion.div ref={ref} style={{ x, y }} className="inline-block">
      {children}
    </motion.div>
  );
}
