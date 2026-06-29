import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SwipeArrows({ onPrev, onNext, canPrev, canNext }) {
  return (
    <>
      {/* Left Arrow */}
      <motion.button
        onClick={onPrev}
        disabled={!canPrev}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="
          absolute left-2 md:left-4 top-[40%] md:top-1/2 -translate-y-1/2
          w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center
          bg-black/30 md:bg-white/5 border border-white/10
          text-white/80 md:text-white/60 hover:text-white hover:bg-white/10
          disabled:opacity-20 disabled:cursor-not-allowed
          transition-all duration-300 z-20
          backdrop-blur-md md:backdrop-blur-xl
        "
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </motion.button>

      {/* Right Arrow */}
      <motion.button
        onClick={onNext}
        disabled={!canNext}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="
          absolute right-2 md:left-auto md:right-4 top-[40%] md:top-1/2 -translate-y-1/2
          w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center
          bg-black/30 md:bg-white/5 border border-white/10
          text-white/80 md:text-white/60 hover:text-white hover:bg-white/10
          disabled:opacity-20 disabled:cursor-not-allowed
          transition-all duration-300 z-20
          backdrop-blur-md md:backdrop-blur-xl
        "
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </motion.button>
    </>
  );
}
