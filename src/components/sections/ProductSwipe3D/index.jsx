import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import SwipeCard3D from './SwipeCard3D';
import DotIndicator from './DotIndicator';
import SwipeArrows from './SwipeArrows';
import { useLanguage } from '@/lib/LanguageContext';
import { getProductImage } from '@/data/productsData';
import useMobile from '@/hooks/useMobile';
import './styles.css';

const PRODUCT_THEMES = {
  'conference-gold': {
    theme: '#c41e3a',
    themeBg: '#200308',
    tagline: 'Dual-Action Systemic Protection',
    badge: 'BEST SELLER',
  },
  'conference-gold-fs': {
    theme: '#c41e3a',
    themeBg: '#200308',
    tagline: 'Dual-Action Systemic Protection',
    badge: 'BEST SELLER',
  },
  'fatty': {
    theme: '#0d8b5e',
    themeBg: '#011510',
    tagline: 'Premium Bio-Stimulant Formula',
    badge: 'NEW',
  },
  'easy-grow': {
    theme: '#8b0a50',
    themeBg: '#1c0210',
    tagline: 'Elite Vegetative Stimulator',
    badge: 'POPULAR',
  },
  'easy-grow-sc': {
    theme: '#8b0a50',
    themeBg: '#1c0210',
    tagline: 'Elite Vegetative Stimulator',
    badge: 'POPULAR',
  },
  'easy-grow-gold': {
    theme: '#8b0a50',
    themeBg: '#1c0210',
    tagline: 'Elite Vegetative Stimulator',
    badge: 'POPULAR',
  },
  'vac-zinc': {
    theme: '#2D5A1B',
    themeBg: '#091305',
    tagline: 'Chelated Micronutrient Fertilizer',
  },
  'output': {
    theme: '#1A1A4E',
    themeBg: '#05051a',
    tagline: 'Elite Fruiting & Sizing Catalyst',
  },
  'super-4g': {
    theme: '#8B4A00',
    themeBg: '#1a0d00',
    tagline: 'Soil Granular Protection Elite',
  },
  'aaqaab': {
    theme: '#0A2A7A',
    themeBg: '#02091c',
    tagline: 'Advanced Lepidoptera Specialist',
  },
  'aaqab': {
    theme: '#0A2A7A',
    themeBg: '#02091c',
    tagline: 'Advanced Lepidoptera Specialist',
  },
  'sector': {
    theme: '#4A0A6B',
    themeBg: '#0f0217',
    tagline: 'Selective Pre & Post Herbicide',
  },
  'purifizin-extra': {
    theme: '#6B3A0A',
    themeBg: '#170c02',
    tagline: 'Premium Broad Spectrum Fungicide',
  },
  'dr-pp': {
    theme: '#0A4A5A',
    themeBg: '#020f12',
    tagline: 'Elite Stress Relieving Formula',
  },
  'farbasin': {
    theme: '#a78bfa',
    themeBg: '#130a1c',
    tagline: 'Systemic Fungicide Powder',
  }
};

/**
 * Enterprise horizontal momentum product slider with 3D perspective depth,
 * snap momentum, keyboard arrows support, trackpad/wheel support, and auto-centering.
 */
export default function ProductSwipe3D({ products: rawProducts, openCheckout, autoplay = false }) {
  const { lang } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);
  const lastWheelTime = useRef(0);
  
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Map products
  const products = useMemo(() => {
    if (!rawProducts) return [];
    return rawProducts.map(p => {
      const sizeInfo = p.sizes?.[0] || {};
      const price = typeof sizeInfo === 'object' ? (sizeInfo.price || p.price || 999) : (p.price || 999);
      const originalPrice = typeof sizeInfo === 'object' ? (sizeInfo.oldPrice || p.originalPrice || null) : (p.originalPrice || null);
      const discount = sizeInfo.discount || (originalPrice ? Math.round((1 - price / originalPrice) * 100) : null);
      
      const categoryLabel = p.category ? p.category.replace('_', ' ').toUpperCase() : '';
      const themeInfo = PRODUCT_THEMES[p.slug || p.id] || {
        theme: '#5cb85c',
        themeBg: '#020c02',
        tagline: 'Premium Agricultural Solution'
      };
      
      return {
        ...p,
        name: typeof p.name === 'object' ? (p.name[lang] || p.name.en) : p.name,
        formula: p.activeIngredient || p.formulation || "",
        image: getProductImage(p),
        price,
        originalPrice,
        discount,
        category: categoryLabel,
        ...themeInfo,
      };
    });
  }, [rawProducts, lang]);

  const total = products.length;

  const { isMobile, width: viewportWidth } = useMobile();
  const cardWidth = isMobile ? 290 : 340;
  const enable3D = !isMobile;
  const ANIM_DURATION = isMobile ? 0.45 : 0.6;
  const gap = 20;

  // Center offset calculated dynamically using actual viewport width to align the active card perfectly
  const currentViewportWidth = viewportWidth || (typeof window !== 'undefined' ? window.innerWidth : 375);
  const centerOffset = currentViewportWidth / 2 - cardWidth / 2;

  const goNext = () => {
    setCurrentIndex(prev => (prev < total - 1 ? prev + 1 : 0));
  };

  const goPrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : total - 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total]);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || paused || !inView || total <= 1) return;

    timerRef.current = setInterval(() => {
      goNext();
    }, 3500);

    return () => clearInterval(timerRef.current);
  }, [autoplay, paused, inView, currentIndex, total]);

  // Trackpad/mousewheel scroll handler
  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 450) return; // 450ms throttle

    if (Math.abs(e.deltaX) > 18 || Math.abs(e.deltaY) > 18) {
      if (e.deltaX > 0 || e.deltaY > 0) {
        goNext();
      } else {
        goPrev();
      }
      lastWheelTime.current = now;
    }
  };

  // Drag physics implementation
  const dragX = useMotionValue(0);
  const handleDragEnd = (event, info) => {
    const threshold = 50;
    const velocityThreshold = 350;
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -threshold || velocity < -velocityThreshold) {
      goNext();
    } else if (offset > threshold || velocity > velocityThreshold) {
      goPrev();
    }
    dragX.set(0); // Reset local drag position
  };

  const prod = products[currentIndex];

  if (total === 0) return null;

  return (
    <section 
      ref={sectionRef}
      onWheel={handleWheel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      dir="ltr"
      className="product-swipe-section relative overflow-hidden bg-[#020c02] py-20 px-4 min-h-[90vh] flex flex-col items-center justify-center select-none transition-colors duration-1000"
    >
      {/* Dynamic fluid background gradient */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${prod?.theme || '#2d6a2d'}15 0%, ${prod?.themeBg || '#020c02'} 55%, #020c02 100%)`,
        }}
      />

      {/* Section Header */}
      <motion.div
        className="section-header text-center mb-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
          bg-[rgba(45,106,45,0.2)] border border-[rgba(92,184,92,0.3)]
          text-[#5cb85c] text-xs tracking-[0.15em] uppercase font-semibold mb-5 shadow-inner"
        >
          ✦ {lang === 'en' ? 'OUR PRODUCTS' : 'ہماری مصنوعات'}
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
          {lang === 'en' ? 'Premium Collection' : 'پریمیئم کلیکشن'}
        </h2>
        <p className="text-[#5cb85c] mt-3 text-xs tracking-widest uppercase font-bold">
          {lang === 'en' ? 'Drag or Swipe to explore ←→' : 'دیکھنے کے لیے سوائپ یا ڈریگ کریں ←→'}
        </p>
      </motion.div>

      {/* 3D Snap Drag Stage - Aligned to justify-start to map animation offsets correctly */}
      <div 
        className="relative w-full overflow-hidden py-6 flex items-center justify-start z-10"
        style={{ perspective: '1500px', perspectiveOrigin: '50% 50%' }}
      >
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ 
            x: dragX,
            transformStyle: 'preserve-3d'
          }}
          animate={{ x: centerOffset - currentIndex * (cardWidth + gap) }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
          className="flex gap-5 cursor-grab active:cursor-grabbing"
        >
          {products.map((product, idx) => {
            const isActive = idx === currentIndex;
            const diff = Math.abs(idx - currentIndex);
            
            return (
              <motion.div
                key={product.id}
                style={{
                  width: cardWidth,
                  flexShrink: 0,
                  transformStyle: 'preserve-3d',
                }}
                animate={{
                  scale: isActive ? 1.05 : 0.88,
                  filter: enable3D ? (isActive ? 'blur(0px)' : 'blur(2.0px)') : 'none',
                  opacity: isActive ? 1 : 0.45,
                  z: isActive ? 0 : -120,
                  rotateY: enable3D ? (isActive ? 0 : idx < currentIndex ? 18 : -18) : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
              >
                <SwipeCard3D
                  product={product}
                  isActive={isActive}
                  isPeek={diff > 0}
                  openCheckout={openCheckout}
                  onActivate={() => setCurrentIndex(idx)}
                  isMobile={isMobile}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Dots navigation */}
      <div className="mt-8 z-10 flex flex-col items-center gap-3">
        <DotIndicator
          total={total}
          current={currentIndex}
          onChange={(i) => {
            setCurrentIndex(i);
          }}
        />
        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider font-mono">
          {currentIndex + 1} / {total} {lang === 'en' ? 'products' : 'مصنوعات'}
        </p>
      </div>

      {/* Control Arrows */}
      <SwipeArrows
        onPrev={goPrev}
        onNext={goNext}
        canPrev={true}
        canNext={true}
      />
    </section>
  );
}
