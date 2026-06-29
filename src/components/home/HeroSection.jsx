import React, { useRef } from 'react';
import useVideoAutoplay from '@/hooks/useVideoAutoplay';
import HeroBackground from '../sections/Hero/HeroBackground';
import HeroContent from '../sections/Hero/HeroContent';

export default function HeroSection() {
  const videoRef = useRef(null);
  useVideoAutoplay(videoRef);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background loop video, gradients, noise, and 3D leaf simulation canvas */}
      <HeroBackground videoRef={videoRef} />

      {/* Apple-style typography reveals, magnetic calls-to-action, and counters */}
      <HeroContent />

      {/* Decorative bottom transition wave */}
      <div className="absolute bottom-0 left-0 right-0 z-[5] pointer-events-none">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path
            d="M0 120L48 108C96 96 192 72 288 60C384 48 480 48 576 54C672 60 768 72 864 78C960 84 1056 84 1152 78C1248 72 1344 60 1392 54L1440 48V120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}