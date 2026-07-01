import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/lib/LanguageContext';
import PremiumSearchBar from '../ui/PremiumSearchBar';

export default function GlobalSearchOverlay() {
  const { isGlobalSearchOpen, setIsGlobalSearchOpen } = useApp();
  const { lang } = useLanguage();
  const cardRef = useRef(null);

  // Stable close handler
  const closeOverlay = useCallback(() => {
    setIsGlobalSearchOpen(false);
  }, [setIsGlobalSearchOpen]);

  // Keyboard: Ctrl+K or '/' to toggle, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && e.key.toLowerCase() === 'k') ||
        (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')
      ) {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }

      if (e.key === 'Escape' && isGlobalSearchOpen) {
        e.preventDefault();
        e.stopPropagation();
        closeOverlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsGlobalSearchOpen, isGlobalSearchOpen, closeOverlay]);

  // Lock scroll when overlay is active
  useEffect(() => {
    if (!isGlobalSearchOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isGlobalSearchOpen]);

  // Backdrop animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Spotlight card animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.92, y: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 28, stiffness: 350, mass: 0.8 }
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      y: -30,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  return (
    <AnimatePresence>
      {isGlobalSearchOpen && (
        <div className="fixed inset-0 z-[9999] select-none">
          {/* Backdrop — click anywhere to close */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            onClick={closeOverlay}
            className="absolute inset-0 bg-[#02140c]/50 backdrop-blur-[14px] cursor-pointer"
          />

          {/* Content container — centered */}
          <div className="relative z-10 flex flex-col items-center pt-20 sm:pt-28 md:pt-36 px-4 h-full pointer-events-none">
            {/* Close Button — always above the card, fully clickable */}
            <motion.button
              type="button"
              onClick={closeOverlay}
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ delay: 0.1, type: 'spring', damping: 20, stiffness: 300 }}
              className="pointer-events-auto mb-4 p-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white/90 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-lg hover:shadow-xl hover:rotate-90 duration-300 active:scale-90 backdrop-blur-md"
              aria-label="Close Search"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Spotlight Card — draggable for swipe-down-to-close on mobile */}
            <motion.div
              ref={cardRef}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.85 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) {
                  closeOverlay();
                }
              }}
              className="w-full max-w-2xl pointer-events-auto cursor-grab active:cursor-grabbing"
            >
              {/* Drag Handle Indicator (mobile) */}
              <div className="flex sm:hidden justify-center mb-2">
                <div className="w-10 h-1 rounded-full bg-white/30" />
              </div>

              {/* Premium Search Input */}
              <PremiumSearchBar
                mode="global"
                isExpandable={false}
                onCloseOverlay={closeOverlay}
              />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
