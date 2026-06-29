import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import vitalAgroLogo from '@/assets/vital agro logo.webp';

export default function AdminLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Admin Dashboard...');

  const loadingMessages = [
    'Initializing Admin Dashboard...',
    'Syncing Live Orders...',
    'Connecting Secure Database...',
    'Preparing Analytics...',
    'Loading Control Center...'
  ];

  useEffect(() => {
    let currentProgress = 0;
    let messageIndex = 0;
    
    // Total loading time: ~1.8 seconds to hit 100%
    const interval = setInterval(() => {
      currentProgress += Math.random() * 8 + 4; // Add 4-12% every 50ms
      
      if (currentProgress > 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300); // Small delay at 100% before firing completion
      }
      
      setProgress(currentProgress);

      // Change text periodically
      if (currentProgress > (messageIndex + 1) * 20 && messageIndex < loadingMessages.length - 1) {
        messageIndex++;
        setLoadingText(loadingMessages[messageIndex]);
      }
      
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#050C07] text-emerald-950 overflow-hidden">
      {/* Jungle Ambient Lighting */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-black/90 via-[#0a1a10] to-[#10b981]/15 pointer-events-none" />
      
      {/* Animated Fog (Simulated via glowing blurred orbs) */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[30%] -left-[20%] w-[80vw] h-[80vw] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none"
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[30%] -right-[20%] w-[70vw] h-[70vw] rounded-full bg-[#8AD65A]/10 blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-12 w-full max-w-sm px-6">
        
        {/* 3D Vital Agro Logo Animation (CSS Simulated 3D) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex items-center justify-center w-36 h-36"
        >
          {/* Inner glowing ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-[#10B981]/50"
          />
          {/* Outer spin ring */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 rounded-full border-2 border-t-[#8AD65A] border-r-transparent border-b-[#10B981] border-l-transparent opacity-30"
          />
          {/* Center Logo Icon */}
          <div className="w-24 h-24 flex items-center justify-center p-2">
             <img src={vitalAgroLogo} alt="Vital Agro Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(16,185,129,0.7)] animate-pulse" />
          </div>
        </motion.div>

        {/* Dynamic Progress Bar & Text */}
        <div className="w-full space-y-4 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-[#10B981] text-xs sm:text-sm font-bold uppercase tracking-[0.2em]"
            >
              {loadingText}
            </motion.p>
          </AnimatePresence>
          
          <div className="h-1.5 w-full bg-emerald-950/10 rounded-full overflow-hidden border border-emerald-900/5 backdrop-blur-sm relative">
            <motion.div 
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#10B981] to-[#8AD65A] shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
            <span>SECURE.ADMIN</span>
            <span>{Math.floor(progress)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
