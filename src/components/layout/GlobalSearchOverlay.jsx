import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/lib/LanguageContext';
import PremiumSearchBar from '../ui/PremiumSearchBar';

export default function GlobalSearchOverlay() {
  const { isGlobalSearchOpen, setIsGlobalSearchOpen } = useApp();
  const { lang } = useLanguage();

  // Keyboard listener: Ctrl+K or '/' to toggle search, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && e.key.toLowerCase() === 'k') || 
        (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')
      ) {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }

      if (e.key === 'Escape') {
        setIsGlobalSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsGlobalSearchOpen]);

  // Lock scroll when overlay is active
  useEffect(() => {
    if (!isGlobalSearchOpen) return;
    const prevScroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevScroll;
    };
  }, [isGlobalSearchOpen]);

  return (
    <AnimatePresence>
      {isGlobalSearchOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 sm:pt-28 md:pt-36 px-4 select-none">
          {/* Backdrop Glass Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsGlobalSearchOpen(false)}
            className="absolute inset-0 bg-[#02140c]/45 backdrop-blur-[12px] cursor-pointer"
          />

          {/* Centered Spotlight Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-full max-w-2xl relative z-10"
          >
            {/* Close Button above the search card */}
            <div className="absolute right-4 -top-12 z-20">
              <button
                type="button"
                onClick={() => setIsGlobalSearchOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-lg hover:rotate-90 duration-200"
                aria-label="Close Spotlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Premium Search Input inside Spotlight */}
            <PremiumSearchBar
              mode="global"
              isExpandable={false}
              onCloseOverlay={() => setIsGlobalSearchOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
