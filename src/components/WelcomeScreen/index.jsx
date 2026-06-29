'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import vitalAgroLogo from '@/assets/vital agro logo.webp';

const LOADING_TEXTS = [
  "Preparing Premium Agricultural Experience...",
  "Initializing Premium Interface...",
  "Loading Biotechnology Solutions...",
  "Welcome to Vital Agro"
];

export const WelcomeScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  // 1.5 seconds smooth linear progress simulation
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1500; // 1.5 seconds loading time

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      // Rotate loading texts based on progress percentage
      if (pct < 25) {
        setTextIndex(0);
      } else if (pct < 55) {
        setTextIndex(1);
      } else if (pct < 85) {
        setTextIndex(2);
      } else {
        setTextIndex(3);
      }

      if (elapsed < duration) {
        requestAnimationFrame(updateProgress);
      } else {
        // Safe sessionStorage markers
        try {
          sessionStorage.setItem('vital_global_hydrated', 'true');
          sessionStorage.setItem('vitalAgro_loaded', 'true');
          sessionStorage.setItem('vital_agro_loaded', 'true');
          sessionStorage.setItem('vital_platform_loaded', 'true');
        } catch (e) {
          console.warn("sessionStorage write failed in WelcomeScreen:", e);
        }
        
        // Brief settle delay then exit transition
        setTimeout(() => {
          setExiting(true);
        }, 150);
      }
    };

    requestAnimationFrame(updateProgress);
  }, []);

  // Pre-generate leaf particle positions for efficiency
  const leaves = useMemo(() => {
    return [...Array(10)].map((_, i) => ({
      id: i,
      left: `${5 + i * 11}%`,
      top: `${10 + Math.random() * 80}%`,
      delay: `${i * 0.7}s`,
      duration: `${12 + Math.random() * 8}s`,
      scale: 0.4 + Math.random() * 0.6,
    }));
  }, []);

  // Pre-generate fireflies positions for efficiency
  const fireflies = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: `${8 + i * 9}%`,
      bottom: `${5 + Math.random() * 30}%`,
      delay: `${i * 0.5}s`,
      duration: `${8 + Math.random() * 6}s`,
      scale: 0.5 + Math.random() * 0.7,
    }));
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[1000] overflow-hidden flex flex-col items-center justify-center bg-[#010402] select-none"
      initial={{ opacity: 1 }}
      animate={exiting ? { opacity: 0, scale: 1.05, filter: 'blur(10px)' } : { opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => {
        if (exiting) {
          onComplete();
        }
      }}
    >
      {/* Keyframe animations for cinematic background layers */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fog-drift-preloader-1 {
          0%, 100% { transform: translate3d(-5%, -5%, 0) scale(1.0); opacity: 0.25; }
          50% { transform: translate3d(5%, 5%, 0) scale(1.15); opacity: 0.45; }
        }
        @keyframes fog-drift-preloader-2 {
          0%, 100% { transform: translate3d(5%, 5%, 0) scale(1.15); opacity: 0.15; }
          50% { transform: translate3d(-5%, -5%, 0) scale(1.0); opacity: 0.35; }
        }
        @keyframes firefly-float-preloader {
          0% { transform: translate3d(0, 0, 0) scale(0.8); opacity: 0; }
          25% { opacity: 0.8; }
          75% { opacity: 0.8; }
          100% { transform: translate3d(30px, -150px, 0) scale(1.2); opacity: 0; }
        }
        @keyframes leaf-fall-preloader {
          0% { transform: translate3d(0, -100px, 0) rotate(0deg) scale(0.6); opacity: 0; }
          15% { opacity: 0.7; }
          85% { opacity: 0.7; }
          100% { transform: translate3d(120px, 120vh, 0) rotate(320deg) scale(0.5); opacity: 0; }
        }
        @keyframes logo-sheen {
          0% { left: -150%; }
          50%, 100% { left: 150%; }
        }
      `}} />

      {/* Layer 1: Cinematic Jungle Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-45 scale-102 transition-transform duration-1000"
        style={{
          backgroundImage: 'url("/jungle_bg.webp")',
          filter: 'brightness(0.3) contrast(1.1) saturate(1.15) blur(1px)'
        }}
      />

      {/* Layer 2: Premium Green Lighting (Ambient Vignette & Pulse) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#010402]/95 via-transparent to-[#010402]/98 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.08] rounded-full blur-[140px] pointer-events-none" />

      {/* Layer 3: Animated Green Fog */}
      <div 
        className="absolute inset-[-10%] z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.09)_0%,transparent_60%)] blur-[80px]"
        style={{ animation: 'fog-drift-preloader-1 16s infinite ease-in-out' }}
      />
      <div 
        className="absolute inset-[-10%] z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.06)_0%,transparent_70%)] blur-[100px]"
        style={{ animation: 'fog-drift-preloader-2 22s infinite ease-in-out' }}
      />

      {/* Layer 4: Ambient Particles / Fireflies */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {fireflies.map((ff) => (
          <div
            key={ff.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#4ade80]"
            style={{
              left: ff.left,
              bottom: ff.bottom,
              animation: `firefly-float-preloader ${ff.duration} infinite linear`,
              animationDelay: ff.delay,
              transform: `scale(${ff.scale})`
            }}
          />
        ))}
      </div>

      {/* Layer 5: Floating Leaves */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {leaves.map((lf) => (
          <div
            key={lf.id}
            className="absolute w-3.5 h-3.5 bg-gradient-to-tr from-emerald-600/30 to-[#4ade80]/20 rounded-full blur-[0.5px]"
            style={{
              left: lf.left,
              top: lf.top,
              animation: `leaf-fall-preloader ${lf.duration} infinite linear`,
              animationDelay: lf.delay,
              transform: `scale(${lf.scale})`
            }}
          />
        ))}
      </div>

      {/* Layer 6: Glassmorphism Card Wrapper Container */}
      <div 
        className="relative z-10 w-[90%] max-w-[420px] rounded-[36px] border border-white/10 p-8 sm:p-10 flex flex-col items-center gap-8 text-center"
        style={{
          background: 'rgba(5, 15, 8, 0.45)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        {/* Soft Bloom Glow behind Logo */}
        <div className="absolute top-10 w-24 h-24 bg-[#4ade80]/15 rounded-full blur-2xl pointer-events-none" />

        {/* 3D-effect Rotating Logo with light sweep shine */}
        <motion.div
          className="relative w-28 h-28 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center p-4 overflow-hidden"
          animate={{
            rotateY: [0, 15, 0, -15, 0],
            rotateX: [0, 8, 0, -8, 0],
            y: [-3, 3, -3]
          }}
          transition={{
            rotateY: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
            rotateX: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{ transformStyle: 'preserve-3d', perspective: 600 }}
        >
          {/* Reflective Sheen Sweep */}
          <div 
            className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            style={{
              animation: 'logo-sheen 3.2s infinite ease-in-out',
              animationDelay: '0.5s'
            }}
          />

          <img
            src={vitalAgroLogo}
            alt="Vital Agro Logo"
            className="h-20 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(74,222,128,0.35)]"
            style={{ transform: 'translateZ(20px)' }}
          />
        </motion.div>

        {/* Brand Text Header */}
        <div className="space-y-1">
          <h1 className="text-white font-extrabold tracking-[0.25em] text-lg uppercase font-heading">
            Vital Agro
          </h1>
          <p className="text-[#4ade80] text-[9px] tracking-[0.3em] uppercase font-bold">
            Biotech Innovation
          </p>
        </div>

        {/* Loader Progress & Dynamic Console */}
        <div className="w-full space-y-4 pt-4 border-t border-white/5">
          {/* Smooth Progress Bar */}
          <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden relative">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#10b981] via-[#4ade80] to-[#a7f3d0] transition-all duration-100 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: '0 0 10px rgba(74,222,128,0.7), 0 0 5px rgba(74,222,128,0.4)'
              }}
            />
          </div>

          {/* Dynamic Loading Text Console */}
          <div className="min-h-[20px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="text-[#4ade80] font-bold text-[10px] sm:text-xs font-mono tracking-wider uppercase text-center filter drop-shadow-[0_0_8px_rgba(74,222,128,0.25)]"
              >
                {LOADING_TEXTS[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
