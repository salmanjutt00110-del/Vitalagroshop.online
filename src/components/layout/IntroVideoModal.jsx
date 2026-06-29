import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function IntroVideoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const closeButtonRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsLoading(true);
    };
    window.addEventListener('open-intro-video', handleOpen);
    return () => window.removeEventListener('open-intro-video', handleOpen);
  }, []);

  // Auto-focus the close button and start playback when modal opens
  useEffect(() => {
    if (isOpen) {
      if (closeButtonRef.current) {
        setTimeout(() => {
          closeButtonRef.current.focus();
        }, 100);
      }
      
      // Programmatic video playback trigger
      setTimeout(() => {
        if (videoRef.current) {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn("Autoplay block bypass triggered:", error);
            });
          }
        }
      }, 300);
    }
  }, [isOpen]);

  // GPU-accelerated smooth simple transitions to bypass lag
  const backdropVariants = {
    hidden: { 
      opacity: 0,
      backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    visible: { 
      opacity: 1, 
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      transition: { duration: 0.25, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      backgroundColor: 'rgba(0, 0, 0, 0)',
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  const modalVariants = {
    hidden: { scale: 0.96, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.25, ease: 'easeOut' }
    },
    exit: { 
      scale: 0.96, 
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 md:p-10 select-none overflow-hidden"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Container */}
          <motion.div
            variants={modalVariants}
            className="relative w-full max-w-4xl rounded-[32px] overflow-hidden border border-white/12 shadow-[0_30px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(16,185,129,0.1)] aspect-video select-none transform-gpu flex flex-col justify-center items-center bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient inner soft glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-white/5 pointer-events-none" />

            {/* Premium video area with reflection zone */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-[32px] border border-emerald-900/5">
              
              {/* Skeleton Loader overlay */}
              {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 gap-4">
                  {/* Pulse neon logo or spinner */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
                    <div className="w-12 h-12 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-emerald-500 border-l-transparent animate-spin" />
                  </div>
                  <div className="w-48 h-3 bg-white/60 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-[#8AD65A] rounded-full animate-pulse" />
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400/70 uppercase animate-pulse">Syncing Intro Video Ledger...</span>
                </div>
              )}

              {/* Video Tag */}
              <video
                ref={videoRef}
                src="/vital_intro.mp4"
                className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                controls
                playsInline
                preload="auto"
                onCanPlayThrough={() => setIsLoading(false)}
                onPlay={() => setIsLoading(false)}
              />
            </div>

            {/* Apple styled glass Close Button */}
            <button
              ref={closeButtonRef}
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center
                bg-emerald-950/5 backdrop-blur-md border border-emerald-900/15 text-neutral-600 
                hover:text-emerald-950 hover:bg-black/70 hover:border-emerald-500/40 hover:rotate-90 hover:scale-115
                shadow-[0_4px_12px_rgba(0,0,0,0.5),0_0_15px_rgba(16,185,129,0.1)] 
                transition-all duration-300 ease-out cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/80"
              aria-label="Close intro video"
              autoFocus
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
