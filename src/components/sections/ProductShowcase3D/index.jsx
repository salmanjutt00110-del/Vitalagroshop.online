'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { PRODUCTS_DATA } from '@/data/productsData';
import { useApp } from '@/contexts/AppContext';

const AUTO_MS = 7000;

const PRODUCT_THEMES = {
  'conference-gold': {
    theme: '#c41e3a',
    themeBg: '#200308',
    tagline: 'Dual-Action Systemic Protection',
    badge: 'BEST SELLER',
    crops: ['Cotton', 'Sugarcane', 'Potato', 'Chilli']
  },
  'conference-gold-fs': {
    theme: '#c41e3a',
    themeBg: '#200308',
    tagline: 'Dual-Action Systemic Protection',
    badge: 'BEST SELLER',
    crops: ['Cotton', 'Sugarcane', 'Potato', 'Chilli']
  },
  'fatty': {
    theme: '#0d8b5e',
    themeBg: '#011510',
    tagline: 'Premium Bio-Stimulant Formula',
    badge: 'NEW',
    crops: ['All Crops']
  },
  'easy-grow': {
    theme: '#8b0a50',
    themeBg: '#1c0210',
    tagline: 'Elite Vegetative Stimulator',
    badge: 'POPULAR',
    crops: ['Rice', 'Wheat', 'Sugarcane']
  },
  'easy-grow-sc': {
    theme: '#8b0a50',
    themeBg: '#1c0210',
    tagline: 'Elite Vegetative Stimulator',
    badge: 'POPULAR',
    crops: ['Rice', 'Wheat', 'Sugarcane']
  },
  'easy-grow-gold': {
    theme: '#8b0a50',
    themeBg: '#1c0210',
    tagline: 'Elite Vegetative Stimulator',
    badge: 'POPULAR',
    crops: ['Rice', 'Wheat', 'Sugarcane']
  },
  'vac-zinc': {
    theme: '#2D5A1B',
    themeBg: '#091305',
    tagline: 'Chelated Micronutrient Fertilizer',
    crops: ['Rice', 'Wheat', 'Cotton']
  },
  'output': {
    theme: '#1A1A4E',
    themeBg: '#05051a',
    tagline: 'Elite Fruiting & Sizing Catalyst',
    crops: ['Cotton', 'Citrus', 'Mango']
  },
  'super-4g': {
    theme: '#8B4A00',
    themeBg: '#1a0d00',
    tagline: 'Soil Granular Protection Elite',
    crops: ['Sugarcane', 'Maize', 'Rice']
  },
  'aaqaab': {
    theme: '#0A2A7A',
    themeBg: '#02091c',
    tagline: 'Advanced Lepidoptera Specialist',
    crops: ['Cotton', 'Rice', 'Vegetables']
  },
  'aaqab': {
    theme: '#0A2A7A',
    themeBg: '#02091c',
    tagline: 'Advanced Lepidoptera Specialist',
    crops: ['Cotton', 'Rice', 'Vegetables']
  },
  'sector': {
    theme: '#4A0A6B',
    themeBg: '#0f0217',
    tagline: 'Selective Pre & Post Herbicide',
    crops: ['Wheat', 'Maize', 'Sugarcane']
  },
  'purifizin-extra': {
    theme: '#6B3A0A',
    themeBg: '#170c02',
    tagline: 'Premium Broad Spectrum Fungicide',
    crops: ['Potato', 'Tomato', 'Wheat']
  },
  'dr-pp': {
    theme: '#0A4A5A',
    themeBg: '#020f12',
    tagline: 'Elite Stress Relieving Formula',
    crops: ['All Crops']
  },
  'farbasin': {
    theme: '#a78bfa',
    themeBg: '#130a1c',
    tagline: 'Systemic Fungicide Powder',
    crops: ['Vegetables', 'Citrus', 'Mango']
  },
  'vac-sop': {
    theme: '#0d4a8a',
    themeBg: '#010c1a',
    tagline: '100% Water Soluble Sulphate of Potash',
    badge: 'NEW · IMPORTED',
    crops: ['Cotton', 'Sugarcane', 'Vegetables', 'Fruits']
  },
  'vac-map': {
    theme: '#1a3a9a',
    themeBg: '#010618',
    tagline: 'Technical Grade · 81% Phosphorus',
    badge: 'NEW · IMPORTED',
    crops: ['All Crops', 'Wheat', 'Cotton', 'Vegetables']
  },
  'defeater-soil-conditioner': {
    theme: '#1a5a1a',
    themeBg: '#010e01',
    tagline: 'Advanced Soil Conditioning Formula',
    badge: 'EXFET TECHNOLOGY',
    crops: ['Cotton', 'Sugarcane', 'Potato', 'Vegetables', 'Fruits', 'Rice']
  },
  'sonehri-potash-30': {
    theme: '#0d5a8a',
    themeBg: '#010c18',
    tagline: 'Premium Potash 30% — Crop Supplement+',
    badge: 'EXFET TECHNOLOGY',
    crops: ['Cotton', 'Sugarcane', 'Potato', 'Chilli', 'Fruits', 'Vegetables']
  },
  'defeater-potassium-humate': {
    theme: '#2a1a5a',
    themeBg: '#08050f',
    tagline: 'Potassium Humate Liquid — Soil Conditioner+',
    badge: 'EXFET TECHNOLOGY',
    crops: ['All Crops', 'Cotton', 'Wheat', 'Rice', 'Vegetables', 'Fruits']
  },
  'setting-npk': {
    theme: '#2a4a1a',
    themeBg: '#050a03',
    tagline: 'Complete Balanced NPK Nutrition',
    badge: 'BEST QUALITY · IMPORTED',
    crops: ['All Crops', 'Fruits', 'Vegetables', 'Cotton', 'Sugarcane']
  }
};

const CROP_TRANSLATIONS = {
  ur: {
    'Cotton': 'کپاس',
    'Sugarcane': 'کماد',
    'Potato': 'آلو',
    'Chilli': 'مرچ',
    'Rice': 'دھان',
    'Wheat': 'گندم',
    'Vegetables': 'سبزیاں',
    'Citrus': 'ترشاوہ پھل',
    'Mango': 'آم',
    'Maize': 'مکئی',
    'All Crops': 'تمام فصلیں',
    'Tomato': 'ٹماٹر'
  }
};

const PRODUCTS = Object.values(PRODUCTS_DATA).map((p) => {
  const themeInfo = PRODUCT_THEMES[p.slug] || {
    theme: '#5cb85c',
    themeBg: '#020c02',
    tagline: 'Premium Agricultural Solution',
    crops: ['All Crops']
  };

  const sizeInfo = p.sizes?.[0] || {};
  const price = sizeInfo.price || p.price || 999;
  const image = p.pngUrl || p.imageUrl || `/products/${p.slug}.webp`;

  return {
    id: p.slug,
    name: p.name,
    category: p.category ? p.category.toUpperCase().replace('_', ' ') : 'AGRICULTURE',
    formula: p.activeIngredient || p.formulation || '',
    desc: p.shortDesc || p.description,
    price,
    slug: p.slug,
    image,
    ...themeInfo
  };
}).filter((p) => p.id);

export const ProductShowcase3D = () => {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1); // 1=forward, -1=backward
  const [paused, setPaused] = useState(false);
  const timerRef = useRef();
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { setActiveDetailsProduct } = useApp();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const prod = PRODUCTS[idx];

  const goTo = useCallback((newIdx, direction = 1) => {
    setDir(direction);
    setIdx(newIdx);
    clearInterval(timerRef.current);
    if (!paused) startTimer();
  }, [paused]);

  const next = () => goTo((idx + 1) % PRODUCTS.length, 1);
  const prev = () => goTo((idx - 1 + PRODUCTS.length) % PRODUCTS.length, -1);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTO_MS);
  }, [idx]);

  useEffect(() => {
    if (!paused && inView) {
      startTimer();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [idx, paused, inView, startTimer]);

  // Product enter/exit variants
  const productVariants = {
    enter: (d) => ({
      x: d > 0 ? '100%' : '-100%',
      rotateY: d > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.7,
      filter: 'blur(8px)',
    }),
    center: {
      x: 0,
      rotateY: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (d) => ({
      x: d > 0 ? '-100%' : '100%',
      rotateY: d > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.7,
      filter: 'blur(8px)',
    }),
  };

  const textVariants = {
    enter: (d) => ({
      x: d > 0 ? '-80px' : '80px',
      opacity: 0,
      filter: 'blur(6px)',
    }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (d) => ({
      x: d > 0 ? '80px' : '-80px',
      opacity: 0,
      filter: 'blur(6px)',
    }),
  };

  const buttonVariants = {
    enter: { y: 60, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: 60, opacity: 0 },
  };

  const getTranslatedCrop = (cropName) => {
    if (lang === 'ur' && CROP_TRANSLATIONS.ur[cropName]) {
      return CROP_TRANSLATIONS.ur[cropName];
    }
    return cropName;
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden flex flex-col justify-center"
      style={{ minHeight: '100svh' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Dynamic background per product */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${idx}`}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0 }}
          style={{
            background: `radial-gradient(ellipse 70% 60% at 65% 40%, ${prod.theme}20 0%, ${prod.themeBg} 55%, #020c02 100%)`,
          }}
        />
      </AnimatePresence>

      {/* Grid lines overlay — tech feel */}
      <div
        className="absolute inset-0 z-1 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(92,184,92,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(92,184,92,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* MAIN CONTENT */}
      <div className="relative z-10 min-h-screen flex items-center max-w-7xl mx-auto w-full px-4 md:px-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-20 lg:py-0">
          
          {/* LEFT SIDE — Text content */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`text-${idx}`}
              custom={dir}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="order-2 lg:order-1 flex flex-col text-left"
            >
              {/* Category + Badge */}
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{
                    background: `${prod.theme}20`,
                    border: `1px solid ${prod.theme}45`,
                    color: prod.theme,
                  }}
                >
                  {prod.category}
                </span>
                {prod.badge && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/8 border border-white/15 text-white/60">
                    {prod.badge}
                  </span>
                )}
              </div>

              {/* Name */}
              <h2
                className="text-5xl md:text-6xl font-black text-white leading-none mb-3"
                style={{ textShadow: `0 0 50px ${prod.theme}25` }}
              >
                {prod.name[lang] || prod.name.en || prod.name}
              </h2>

              {/* Tagline */}
              <p className="text-lg font-semibold mb-2" style={{ color: prod.theme }}>
                {prod.tagline}
              </p>

              {/* Formula */}
              <p className="text-white/35 text-xs tracking-widest uppercase mb-5 font-mono">
                {prod.formula}
              </p>

              {/* Description */}
              <p
                className="text-white/55 text-sm leading-relaxed mb-6 border-l-2 pl-4 max-w-md"
                style={{ borderColor: `${prod.theme}50` }}
              >
                {prod.desc[lang] || prod.desc.en || prod.desc}
              </p>

              {/* Crops */}
              <div className="flex gap-2 flex-wrap mb-8">
                {prod.crops?.map((crop) => (
                  <span
                    key={crop}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white/55 flex items-center gap-1"
                  >
                    🌾 {getTranslatedCrop(crop)}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-4xl font-black font-mono animate-pulse" style={{ color: prod.theme }}>
                  PKR {prod.price.toLocaleString()}
                </span>
                <span className="text-white/25 text-xs font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'per unit' : 'فی یونٹ'}
                </span>
              </div>

              {/* BUTTONS — animate from bottom */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`btns-${idx}`}
                  variants={buttonVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  {/* BUY NOW COD — goes to /checkout page */}
                  <motion.button
                    onClick={() => navigate(`/checkout?product=${prod.slug}`)}
                    whileTap={{ scale: 0.97 }}
                    className="relative px-8 py-4 rounded-2xl font-bold text-sm text-white overflow-hidden flex-1 sm:flex-none"
                    style={{
                      background: `linear-gradient(135deg, ${prod.theme}cc, ${prod.theme})`,
                      boxShadow: `0 0 30px ${prod.theme}35, 0 8px 20px rgba(0,0,0,0.3)`,
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      initial={{ x: '-110%', skewX: '-20deg' }}
                      whileHover={{ x: '110%' }}
                      transition={{ duration: 0.4 }}
                    />
                    <span className="relative">{lang === 'en' ? '🛒 Buy Now (COD)' : '🛒 ابھی خریدیں (COD)'}</span>
                  </motion.button>

                  {/* VIEW DETAILS */}
                  <motion.button
                    onClick={() => setActiveDetailsProduct(PRODUCTS_DATA[prod.slug])}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-4 rounded-2xl font-bold text-sm border transition-all duration-300 flex-1 sm:flex-none bg-white/5"
                    style={{
                      borderColor: `${prod.theme}40`,
                      color: prod.theme,
                    }}
                    whileHover={{
                      borderColor: `${prod.theme}80`,
                      background: `${prod.theme}10`,
                    }}
                  >
                    {lang === 'en' ? 'View Details →' : 'تفصیلات دیکھیں ←'}
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* RIGHT SIDE — 3D Product Image */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`img-${idx}`}
              custom={dir}
              variants={productVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center order-1 lg:order-2"
              style={{ perspective: '1000px' }}
            >
              {/* Outer glow */}
              <div
                className="absolute w-80 h-80 rounded-full blur-[100px] opacity-25 pointer-events-none"
                style={{ background: prod.theme }}
              />

              {/* Glass card */}
              <motion.div
                className="relative flex items-center justify-center w-72 h-80 md:w-80 md:h-[400px] rounded-[40px]"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)`,
                  backdropFilter: isMobile ? 'none' : 'blur(24px)',
                  WebkitBackdropFilter: isMobile ? 'none' : 'blur(24px)',
                  border: `1px solid ${prod.theme}25`,
                  boxShadow: isMobile 
                    ? '0 15px 35px rgba(0,0,0,0.4)'
                    : `0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10)`,
                }}
                animate={inView && !isMobile ? {
                  rotateX: [0, 1, 0, -1, 0],
                  rotateY: [0, 2, 0, -2, 0],
                } : {}}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Bottom glow inside glass */}
                <div
                  className="absolute bottom-0 inset-x-0 h-32 rounded-b-[40px]"
                  style={{
                    background: `linear-gradient(to top, ${prod.theme}18, transparent)`,
                  }}
                />

                {/* Ground shadow beneath product */}
                <motion.div
                  className="absolute bottom-8 w-40 h-8 rounded-full blur-2xl"
                  style={{ background: prod.theme }}
                  animate={inView && !isMobile ? { scaleX: [1, 1.25, 1], opacity: [0.3, 0.55, 0.3] } : {}}
                  transition={{ duration: 3.5, repeat: Infinity }}
                />

                {/* Product image — 3D float */}
                <motion.img
                  src={prod.image}
                  alt={prod.name[lang] || prod.name.en || prod.name}
                  className="relative z-10 object-contain"
                  style={{
                    height: '76%',
                    filter: isMobile 
                      ? 'none' 
                      : `drop-shadow(0 32px 64px rgba(0,0,0,0.6)) drop-shadow(0 0 48px ${prod.theme}20)`,
                  }}
                  animate={inView && !isMobile ? {
                    y: [0, -18, 0],
                    rotateY: [0, 6, 0, -6, 0],
                    rotateX: [0, 2, 0],
                  } : {}}
                  transition={{
                    y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
                    rotateY: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
                    rotateX: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                  }}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* NAVIGATION CONTROLS */}
      {/* Prev/Next arrows */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center justify-between pointer-events-none">
        {[
          { fn: prev, label: '‹' },
          { fn: next, label: '›' },
        ].map(({ fn, label }) => (
          <motion.button
            key={label}
            onClick={fn}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center text-3xl font-black pb-1.5 transition-all duration-300 select-none"
            style={{
              background: 'rgba(6,20,6,0.8)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${prod.theme}30`,
              color: prod.theme,
              boxShadow: `0 0 20px ${prod.theme}15`,
            }}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* BOTTOM: Dots + timer bar */}
      <div className="absolute bottom-8 inset-x-0 z-20 flex flex-col items-center gap-3">
        {/* 5s progress bar */}
        {!paused && (
          <motion.div
            key={`timer-${idx}`}
            className="h-[2px] rounded-full"
            style={{ background: prod.theme, boxShadow: `0 0 8px ${prod.theme}` }}
            initial={{ width: 0 }}
            animate={{ width: 100 }}
            transition={{ duration: AUTO_MS / 1000, ease: 'linear' }}
          />
        )}

        {/* Product dots */}
        <div className="flex gap-2 items-center">
          {PRODUCTS.map((p, i) => (
            <motion.button
              key={p.id}
              onClick={() => goTo(i, i > idx ? 1 : -1)}
              animate={{
                width: i === idx ? 28 : 8,
                background: i === idx ? prod.theme : 'rgba(255,255,255,0.2)',
                boxShadow: i === idx ? `0 0 12px ${prod.theme}80` : 'none',
              }}
              className="h-2 rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          ))}
        </div>

        <p className="text-white/25 text-[10px] tracking-widest font-mono">
          {idx + 1} / {PRODUCTS.length} · {paused ? 'Paused' : 'Auto'}
        </p>
      </div>
    </section>
  );
};
