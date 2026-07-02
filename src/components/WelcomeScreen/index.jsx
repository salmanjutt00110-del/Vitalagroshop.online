'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


// Premium rotating loading messages
const LOADING_MESSAGES = [
  "Preparing Premium Experience...",
  "Loading Smart Agriculture...",
  "Initializing Product Database...",
  "Optimizing Premium Assets...",
  "Almost Ready..."
];

export const WelcomeScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const chimePlayed = useRef(false);

  // Play a soft synthesized luxury chord chime when component mounts (Web Audio API)
  const playStartupChime = () => {
    if (chimePlayed.current) return;
    chimePlayed.current = true;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      // Ethereal pentatonic chord (F#3, C#4, F#4, G#4, C#5)
      const freqs = [185.00, 277.18, 369.99, 415.30, 554.37];
      
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        
        // Soft fade-in and decay
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.2 + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 2.2);
      });
    } catch (e) {
      console.warn("AudioContext chime blocked by autoplay policy.");
    }
  };

  // Smooth progress count loop (2.2s for optimal premium speed)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      const msgIdx = Math.min(
        LOADING_MESSAGES.length - 1,
        Math.floor((pct / 100) * LOADING_MESSAGES.length)
      );
      setMessageIndex(msgIdx);

      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        try {
          sessionStorage.setItem('vital_global_hydrated', 'true');
          sessionStorage.setItem('vitalAgro_loaded', 'true');
          sessionStorage.setItem('vital_agro_loaded', 'true');
          sessionStorage.setItem('vital_platform_loaded', 'true');
        } catch (e) {
          console.warn("sessionStorage failed:", e);
        }

        setTimeout(() => {
          setExiting(true);
        }, 150);
      }
    };

    requestAnimationFrame(tick);
    
    const triggerChime = () => {
      playStartupChime();
      window.removeEventListener('click', triggerChime);
      window.removeEventListener('touchstart', triggerChime);
    };
    window.addEventListener('click', triggerChime);
    window.addEventListener('touchstart', triggerChime);
    
    const timer = setTimeout(playStartupChime, 300);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', triggerChime);
      window.removeEventListener('touchstart', triggerChime);
    };
  }, []);

  // Pre-generate subtle green particles for 60 FPS performance
  const particles = useMemo(() => {
    return [...Array(32)].map((_, i) => ({
      id: i,
      left: `${3 + i * 3.1}%`,
      bottom: `${10 + Math.random() * 70}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${6 + Math.random() * 6}s`,
      scale: 0.2 + Math.random() * 0.6,
      opacity: 0.15 + Math.random() * 0.45,
    }));
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[99999] overflow-hidden flex flex-col items-center justify-center bg-[#010905] select-none font-sans"
      initial={{ opacity: 1 }}
      animate={exiting ? { opacity: 0, scale: 1.025, filter: 'blur(12px)' } : { opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => {
        if (exiting) {
          onComplete();
        }
      }}
    >
      {/* Google Web Fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes preloader-fog-drift {
          0%, 100% { transform: translate3d(-2%, -2%, 0) rotate(0deg); opacity: 0.25; }
          50% { transform: translate3d(2%, 2%, 0) rotate(180deg); opacity: 0.45; }
        }
        @keyframes preloader-particle-float {
          0% { transform: translate3d(0, 0, 0) scale(0.6); opacity: 0; }
          20% { opacity: var(--pt-op, 0.7); }
          80% { opacity: var(--pt-op, 0.7); }
          100% { transform: translate3d(25px, -150px, 0) scale(1.1); opacity: 0; }
        }
        @keyframes preloader-sweep-shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />

      {/* Layer 1: Cinematic Dark Jungle Background Artwork */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: 'url("/welcome_bg.png")',
          filter: exiting ? 'brightness(0.08) blur(24px)' : 'brightness(0.32) contrast(1.15) saturate(0.85)',
        }}
        animate={exiting ? { scale: 1.08 } : { scale: [1.02, 1.06] }}
        transition={{ duration: exiting ? 0.9 : 4.5, ease: 'easeOut' }}
      />

      {/* Volumetric Glowing Green Ambient Orbs */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#18C964]/[0.035] blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#0E7A43]/[0.035] blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
      
      {/* Soft Vignette Overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_20%,#010905_100%)] pointer-events-none" />
      
      {/* Cinematic Volumetric Fog */}
      <div 
        className="absolute inset-[-6%] z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(24,201,100,0.055)_0%,transparent_60%)] blur-[95px]"
        style={{ animation: 'preloader-fog-drift 28s infinite ease-in-out' }}
      />

      {/* Bioluminescent Floating Spores */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {particles.map((pt) => (
          <div
            key={pt.id}
            className="absolute w-1 h-1 rounded-full bg-[#18C964]/60"
            style={{
              left: pt.left,
              bottom: pt.bottom,
              animation: `preloader-particle-float ${pt.duration} infinite linear`,
              animationDelay: pt.delay,
              transform: `scale(${pt.scale})`,
              '--pt-op': pt.opacity,
              boxShadow: '0 0 8px rgba(24, 201, 100, 0.45)'
            }}
          />
        ))}
      </div>

      {/* Central Layout Container */}
      <div className="relative z-10 w-full max-w-[92%] sm:max-w-[540px] px-6 py-10 flex flex-col items-center justify-between min-h-[82vh]">
        
        {/* TOP: Elegant Typography */}
        <div className="text-center space-y-3 mt-4">
          <motion.p 
            className="text-[10px] sm:text-[11px] font-black tracking-[0.35em] text-emerald-400/80 uppercase select-none"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            ★ WELCOME TO ★
          </motion.p>
          
          <motion.h1 
            className="text-4xl sm:text-5xl font-black tracking-[0.1em] text-white select-none"
            style={{
              fontFamily: "'Outfit', 'Poppins', sans-serif",
              textShadow: '0 0 25px rgba(24,201,100,0.25)'
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            VITAL AGRO
          </motion.h1>

          <motion.div
            className="space-y-1.5 pt-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-[#A3EFC6] text-[10px] sm:text-xs font-black tracking-[0.25em] uppercase">
              Premium Agricultural Solutions
            </p>
            <p className="text-neutral-400 text-[10px] sm:text-xs italic tracking-wider opacity-80">
              Growing Together. Growing Better.
            </p>
          </motion.div>
        </div>

        {/* CENTER: Premium Floating Glass Logo Card with soft glow */}
        <motion.div
          className="relative my-8"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: exiting ? 0.96 : 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Soft Green Glow Behind Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#18C964]/10 rounded-full blur-[45px] pointer-events-none" />
          
          {/* Logo Card */}
          <motion.div 
            className="relative w-36 h-36 rounded-[28px] border border-white/10 flex items-center justify-center p-6 overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.035)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 16px 40px rgba(0,0,0,0.5)'
            }}
            animate={{
              y: [-4, 4, -4],
              rotate: [-1, 1, -1]
            }}
            transition={{
              y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            {/* Gloss reflection sweep */}
            <div 
              className="absolute inset-0 w-20 h-full bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12"
              style={{
                animation: 'preloader-sweep-shine 3.6s infinite ease-in-out',
                animationDelay: '0.8s'
              }}
            />
            
            <img
              src="/logo.webp"
              alt="Vital Agro Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(24,201,100,0.25)]"
            />
          </motion.div>
        </motion.div>

        {/* BOTTOM: Feature Cards & loading indicator */}
        <div className="w-full space-y-6">
          
          {/* 4 small glass feature cards */}
          <div className="grid grid-cols-2 gap-3.5 max-w-[480px] mx-auto">
            {[
              { title: "Premium Crop Protection", icon: "🛡️" },
              { title: "Trusted by Farmers", icon: "👨‍🌾" },
              { title: "High Performance Products", icon: "🌱" },
              { title: "Innovation & Research", icon: "🧪" }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 20px rgba(0,0,0,0.2)'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + idx * 0.08 }}
              >
                <div className="text-base sm:text-lg select-none">{card.icon}</div>
                <span className="text-neutral-200 text-[10px] sm:text-xs font-semibold tracking-wide text-left leading-tight">
                  {card.title}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Loading Section */}
          <div className="w-full max-w-[420px] mx-auto space-y-3 pt-5 border-t border-white/5">
            
            {/* Status Console & Smooth percentage counting */}
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono tracking-wider">
              <span className="text-[#18C964] font-black">
                {LOADING_MESSAGES[messageIndex]}
              </span>
              <span className="text-white/80 font-bold">{Math.round(progress)}%</span>
            </div>

            {/* Elegant ultra-thin progress bar */}
            <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden relative">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-[#18C964] via-[#0E7A43] to-[#18C964] relative shadow-[0_0_12px_rgba(24,201,100,0.65)]"
                style={{
                  width: `${progress}%`
                }}
              >
                {/* Glare sweep */}
                <div 
                  className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent"
                  style={{
                    animation: 'preloader-sweep-shine 1.4s infinite linear'
                  }}
                />
              </motion.div>
            </div>

            {/* Bottom Text */}
            <div className="text-center pt-0.5">
              <p className="text-[10px] font-mono text-neutral-500 tracking-wider">
                Loading Vital Agro...
              </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
