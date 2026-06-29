import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const TopProgressBar = () => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip on first render (already handled by preloader)
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    // Show bar on route change
    setVisible(true);
    setProgress(0);

    const t1 = setTimeout(() => setProgress(30), 50);
    const t2 = setTimeout(() => setProgress(60), 200);
    const t3 = setTimeout(() => setProgress(85), 400);
    const t4 = setTimeout(() => setProgress(100), 600);
    const t5 = setTimeout(() => setVisible(false), 900);

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 inset-x-0 z-[999] h-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-full"
            style={{
              background: 'linear-gradient(90deg, #2d6a2d, #5cb85c, #7de87d)',
              boxShadow: '0 0 10px rgba(92,184,92,0.8)',
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
          {/* Glow dot at progress end */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3
              rounded-full bg-[#5cb85c]"
            style={{
              left: `${progress}%`,
              boxShadow: '0 0 8px rgba(92,184,92,1)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
