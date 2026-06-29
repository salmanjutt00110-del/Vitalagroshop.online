import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroParticles from './HeroParticles';
import vitalBg from '@/assets/vital bg.mp4';
import vitalBgWebm from '@/assets/vital_bg.webm';
import vitalBgPoster from '@/assets/vital_bg_poster.webp';

export default function HeroBackground({ videoRef }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);
    
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-white">
      {/* 1. Background video loop */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={vitalBgPoster}
          className="absolute inset-0 w-full h-full object-cover opacity-90 z-0"
          style={{ objectFit: 'cover', transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
        >
          <source src={vitalBg} type="video/mp4" />
          <source src={vitalBgWebm} type="video/webm" />
        </video>
      </div>

      {/* 2. Minimal gradient overlay for text readability */}
      <div className="absolute inset-0 z-[1] bg-black/10" />

      {/* Premium Vignette / Depth */}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(16,36,21,0.1)_100%)]" />

      {/* 3. Cinematic Drifting Fog Layers (Optimized with natural gradient fades, no expensive blur filter) */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        {!isMobile && (
          <motion.div
            className="absolute bottom-[5%] left-[-20%] w-[140%] h-[35%] opacity-25"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(118,201,69,0.06) 0%, rgba(118,201,69,0) 70%)',
              willChange: 'transform, opacity',
            }}
            animate={{ 
              x: [0, 60, -30, 0],
              opacity: [0.15, 0.3, 0.1, 0.15]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* 4. Ambient Glowing Green Orb at Center/Right (Optimized with natural radial gradient fade) */}
      <div 
        className="absolute top-[20%] left-[55%] w-[450px] h-[450px] rounded-full z-[2] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at center, rgba(118, 201, 69, 0.15) 0%, rgba(118, 201, 69, 0) 70%)',
        }}
      />

      {/* 5. Noise Grain Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.02] z-[3] pointer-events-none noise-bg" />

      {/* 6. Fireflies and Floating Leaf Particles */}
      <HeroParticles />
    </div>
  );
}
