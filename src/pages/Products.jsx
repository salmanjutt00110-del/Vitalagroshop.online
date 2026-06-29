import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useSpring, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { Search, ShoppingCart, Info, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { PRODUCTS_DATA, getProductImage } from '@/data/productsData';
import SEOHead from '@/lib/seo/SEOHead';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useMobile } from '@/hooks/useMobile';
import { useApp } from '@/contexts/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import BlurUpImage from '@/components/ui/BlurUpImage';
import allProductBgPhoto from '@/assets/all_product_bg_photo.png';

// Custom skeletons matching hero slider
const HeroSliderSkeleton = () => (
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative z-10">
    <div className="grid lg:grid-cols-12 gap-10 items-center">
      {/* Left Column: Skeletons */}
      <div className="lg:col-span-7 flex flex-col space-y-5 order-2 lg:order-1 text-left">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-32 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <Skeleton className="h-14 w-3/4 rounded-xl" />
        <Skeleton className="h-24 w-5/6 rounded-2xl" />
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        <div className="flex gap-4 pt-6">
          <Skeleton className="h-12 w-36 rounded-full" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </div>
      </div>
      {/* Right Column: Skeletons */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center order-1 lg:order-2 h-72 sm:h-96 relative">
        <Skeleton className="w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] rounded-full animate-pulse" />
        <Skeleton className="w-[180px] h-[30px] mt-6 rounded-full" />
      </div>
    </div>
  </div>
);

// Custom skeletons matching grid cards
const ProductGridCardSkeleton = () => (
  <div className="rounded-[22px] overflow-hidden flex flex-col premium-glass-card h-full p-5 border border-emerald-900/5 space-y-4">
    <div className="flex gap-2 mb-2">
      <Skeleton className="h-5 w-20 rounded-lg" />
      <Skeleton className="h-5 w-16 rounded-lg" />
    </div>
    <div className="aspect-[4/3] w-full flex items-center justify-center bg-white/60 border border-emerald-900/5 rounded-2xl relative p-4">
      <Skeleton className="h-[75%] w-[55%] rounded-xl" />
    </div>
    <div className="space-y-3 pt-2">
      <Skeleton className="h-6 w-1/2 mx-auto rounded-lg" />
      <Skeleton className="h-5 w-2/3 mx-auto rounded-lg" />
      <Skeleton className="h-4 w-5/6 mx-auto rounded-lg" />
    </div>
    <div className="border-t border-emerald-900/5 pt-4 space-y-3 mt-auto">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-12 rounded-lg" />
        <Skeleton className="h-6 w-12 rounded-lg" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-12 flex-1 rounded-full animate-pulse" />
        <Skeleton className="h-12 flex-1 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

// Category label mappings
const getCategoryLabel = (category) => {
  switch (category) {
    case 'insecticide': return 'INSECTICIDE';
    case 'herbicide': return 'HERBICIDE';
    case 'fungicide': return 'FUNGICIDE';
    case 'plant_nutrition':
    case 'plant-nutrition': return 'PLANT NUTRITION';
    case 'seed-treatment': return 'SEED TREATMENT';
    case 'growth_promoter': return 'GROWTH PROMOTER';
    case 'soil_conditioner': return 'SOIL CONDITIONER';
    default: return 'SPECIAL PRODUCT';
  }
};

// Motion variants for synchronized scroll entrance
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1
    }
  }
};

const imageVariants = {
  hidden: { opacity: 0, x: -50, scale: 0.8, rotate: -5 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 60, damping: 12, duration: 0.8 }
  }
};

const detailsVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 60, damping: 12, duration: 0.8 }
  }
};

const priceVariants = {
  hidden: { opacity: 0, scale: 0.7, y: 25 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 12, duration: 0.7 }
  }
};

// Premium 3D Product Card
const ProductGridCard = React.memo(({ product, openCheckout, lang }) => {
  const { isMobile } = useMobile();
  const { setActiveDetailsProduct } = useApp();
  const [qty, setQty] = useState(1);
  const [activeSizeIdx, setActiveSizeIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const cardRef = useRef(null);

  const activeSize = product?.sizes?.[activeSizeIdx] || {};
  const activePrice = typeof activeSize === 'object' ? (activeSize?.price || product?.price || 0) : (product?.price || 0);
  const activeSizeName = typeof activeSize === 'object' ? activeSize?.size : (product?.packaging || '100ML');
  const activeOriginalPrice = typeof activeSize === 'object' ? (activeSize?.oldPrice || product?.originalPrice) : null;
  const oldPrice = activeOriginalPrice || null;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 180, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const desc = product.shortDesc?.[lang] || product.shortDesc?.en || product.tagline || "";
  const nameEn = product.name_en || (typeof product.name === 'object' ? product.name.en : product.name);
  const nameUr = product.name_ur || (typeof product.name === 'object' ? product.name.ur : '');

  return (
    <div style={{ perspective: '1200px' }} className="w-full h-full">
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        style={isMobile ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative rounded-[24px] overflow-hidden flex flex-col premium-glass-card cursor-default select-none border border-emerald-900/10 shadow-2xl h-full justify-between"
        whileHover={{ scale: 1.025, y: -6 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {/* === CINEMATIC GLASS BACKGROUND === */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Top spotlight */}
          <div className="absolute -top-[30%] left-[20%] w-[60%] h-[60%] bg-[radial-gradient(ellipse,rgba(16,185,129,0.2),transparent_70%)] blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
          {/* Bottom ambient */}
          <div className="absolute -bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(16,185,129,0.12),transparent_70%)] blur-2xl" />
          {/* Noise grain overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* === GLARE SWEEP on hover === */}
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden rounded-[24px]">
          <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        </div>

        {/* === PREMIUM PRICE TAG COUPON === */}
        <div className="absolute top-3 right-3 z-30 pointer-events-none">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="px-3 py-1.5 rounded-xl bg-[#10b981]/25 border border-[#10b981]/40 text-[#34d399] text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-[0_4px_12px_rgba(16,185,129,0.25)] flex items-center gap-1.5"
            style={{
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
            {activePrice === 0 ? 'Request' : `₨ ${activePrice.toLocaleString()}`}
          </motion.div>
        </div>

        {/* ======= PRODUCT IMAGE ZONE ======= */}
        <motion.div variants={imageVariants} className="relative w-full pt-5 pb-2 px-4 z-10">
          {/* Category label at top-left */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[8px] font-black tracking-[0.15em] px-2.5 py-1 rounded-lg border border-[#0F7B3B]/15 bg-[#0F7B3B]/10 text-[#0F7B3B] uppercase">
              {getCategoryLabel(product.category)}
            </span>
            <span className="text-[8px] font-black tracking-[0.15em] px-2.5 py-1 rounded-lg border border-[#102415]/10 bg-[#F8FAF8] text-[#5A5A5A] uppercase">
              {product.status?.en || 'PREMIUM'}
            </span>
          </div>

          {/* 3D Product Image Container */}
          <div className="relative aspect-square w-full flex items-center justify-center p-4 sm:p-5 overflow-hidden rounded-[20px] bg-white/70 border border-emerald-900/10">
            <div className="absolute w-32 h-32 rounded-full bg-emerald-500/10 blur-[30px] group-hover:bg-emerald-400/20 group-hover:blur-[40px] transition-all duration-700 pointer-events-none" />
            <div className="absolute bottom-2 w-[70%] pointer-events-none z-0">
              <div className="absolute inset-x-4 -bottom-1 h-3 rounded-full bg-black/60 blur-[6px]" />
              <div className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="h-2 rounded-full bg-gradient-to-b from-emerald-900/30 to-transparent border-t border-emerald-500/10" />
            </div>

            <motion.div
              animate={{
                y: isHovered ? [0, -8, -2, -8, 0] : [0, -5, 0],
                rotateY: isHovered ? [0, 6, -6, 6, 0] : 0,
              }}
              transition={{ repeat: Infinity, duration: isHovered ? 3 : 5, ease: "easeInOut" }}
              className="relative z-10 flex items-center justify-center w-full h-full max-h-[92%]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <BlurUpImage
                src={getProductImage(product)}
                alt={nameEn}
                loading="eager"
                className="max-h-full max-w-[95%] object-contain mx-auto transition-transform duration-500"
                style={{
                  filter: isHovered
                    ? 'drop-shadow(0 15px 25px rgba(0,0,0,0.65)) drop-shadow(0 0 15px rgba(16,185,129,0.3))'
                    : 'drop-shadow(0 8px 12px rgba(0,0,0,0.45)) drop-shadow(0 0 6px rgba(16,185,129,0.12))',
                  transition: 'filter 0.5s ease'
                }}
              />
            </motion.div>

            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[55%] h-8 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-500"
              style={{
                transform: 'rotateX(180deg) translateY(-4px) scaleY(0.6)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 70%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 70%)',
                filter: 'blur(1.5px)'
              }}
            >
              <img src={getProductImage(product)} alt="" className="w-full h-full object-contain" />
            </div>
          </div>
        </motion.div>

        {/* ======= INFO + ACTIONS ZONE ======= */}
        <motion.div
          variants={detailsVariants}
          className="relative flex-1 flex flex-col justify-between z-20 px-3 sm:px-5 pb-3 sm:pb-5 pt-1.5 sm:pt-2"
        >
          <div className="space-y-2.5 sm:space-y-4">
            {nameUr && (lang === 'ur' || lang === 'pb') && (
              <h3 className="text-[#0F7B3B] font-extrabold text-sm sm:text-2xl leading-normal text-center select-none min-h-[1.25rem] sm:min-h-[1.75rem]" style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }} dir="rtl">
                {nameUr}
              </h3>
            )}
            
            <h4 className="text-[#1E1E1E] font-extrabold text-xs sm:text-lg leading-tight group-hover:text-[#0F7B3B] transition-colors duration-300 text-center line-clamp-1">
              {nameEn}
            </h4>

            <div className="flex justify-center">
              <span className="text-[7.5px] sm:text-[10px] font-mono font-black text-[#5A5A5A] uppercase bg-[#F8FAF8] border border-[#102415]/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg tracking-wider inline-block truncate max-w-full text-center">
                {product.genericName?.en || product.activeIngredient || 'BIOTECH FORMULA'}
              </span>
            </div>

            {/* Hidden description on mobile if not expanded */}
            {(!isMobile || isCardExpanded) && (
              <p className="text-neutral-500 text-[10px] sm:text-xs leading-relaxed line-clamp-2 text-center h-[28px] sm:h-[36px] overflow-hidden px-1 font-semibold">
                {desc}
              </p>
            )}
          </div>

          {/* Collapsible details zone on mobile */}
          {(!isMobile || isCardExpanded) ? (
            <motion.div 
              initial={isMobile ? { opacity: 0, height: 0 } : false}
              animate={isMobile ? { opacity: 1, height: 'auto' } : false}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-3 mt-auto pt-3 border-t border-emerald-900/5"
            >
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none">
                {product.sizes?.map((sz, idx) => {
                  const sizeName = typeof sz === 'object' ? sz.size : sz;
                  const isSelected = idx === activeSizeIdx;
                  return (
                    <button
                      key={sizeName}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveSizeIdx(idx); }}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black border transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                          : 'bg-white/90 border-emerald-900/10 text-emerald-950/45 hover:text-neutral-700 hover:bg-white/[0.08] hover:border-emerald-900/20'
                      }`}
                    >
                      {sizeName}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[#102415] font-black text-sm sm:text-xl font-mono leading-none tracking-tight">
                      {activePrice === 0 ? 'On Request' : `₨ ${activePrice.toLocaleString()}`}
                    </span>
                    {activePrice > 0 && oldPrice && oldPrice > activePrice && (
                      <span className="text-[#5A5A5A] line-through text-[9px] sm:text-[11px] font-mono leading-none">
                        ₨{oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {activePrice > 0 && oldPrice && oldPrice > activePrice && (
                    <span className="text-[8px] sm:text-[9px] text-[#0F7B3B] font-bold mt-1">
                      Save ₨{(oldPrice - activePrice).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-white/90 rounded-lg border border-emerald-900/5 px-1 py-0.5 sm:px-1.5 sm:py-1">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(q => Math.max(1, q - 1)); }}
                    className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded bg-white/60 hover:bg-white/15 text-emerald-950 text-xs flex items-center justify-center transition-all font-bold cursor-pointer active:scale-90"
                  >−</button>
                  <span className="text-emerald-950 text-[11px] sm:text-sm font-black w-4 sm:w-5 text-center font-mono">{qty}</span>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(q => q + 1); }}
                    className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center transition-all font-bold cursor-pointer active:scale-90"
                  >+</button>
                </div>
              </div>

              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openCheckout({ ...product, defaultQty: qty, defaultSize: activeSizeName });
                  }}
                  className="flex-1 btn-premium-primary py-2 text-[9px] sm:text-xs tracking-wider gap-1 sm:gap-1.5"
                >
                  <ShoppingCart size={11} /> Buy Now
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveDetailsProduct(product);
                  }}
                  className="flex-1 btn-premium-secondary py-2 text-[9px] sm:text-xs tracking-wider gap-1"
                >
                  <Info size={11} /> Details
                </button>
              </div>

              {isMobile && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsCardExpanded(false);
                  }}
                  className="w-full mt-1.5 py-1.5 rounded-lg text-[8px] font-black tracking-widest text-[#f87171] uppercase border border-red-500/20 bg-red-500/5 cursor-pointer active:scale-95 transition-all"
                >
                  ▲ Less Details
                </button>
              )}
            </motion.div>
          ) : (
            <div className="mt-3.5 pt-2 border-t border-emerald-900/5 flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCardExpanded(true);
                }}
                className="w-full py-2.5 rounded-xl text-[9px] font-black tracking-widest text-emerald-300 uppercase border border-emerald-500/25 bg-emerald-500/10 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1 backdrop-blur-md hover:bg-emerald-500/20"
                style={{
                  boxShadow: '0 0 10px rgba(16,185,129,0.1)'
                }}
              >
                ▼ Show More
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveDetailsProduct(product);
                }}
                className="w-full py-2 rounded-xl text-[8px] font-black tracking-widest text-neutral-500 uppercase border border-emerald-900/5 bg-white/70 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <Info size={10} /> Specifications
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
});

// CategorySection Component — compact mobile grid + desktop grid
const CategorySection = ({ categoryKey, title, subtitle, products, openCheckout, lang }) => {
  const [expanded, setExpanded] = useState(false);
  const { isMobile } = useMobile();
  const displayProducts = expanded ? products : products.slice(0, 10);
  const hasMore = products.length > 10;

  return (
    <div className="space-y-5 pt-10 first:pt-0">
      {/* Category Glass Banner (Portion Header) */}
      <div className="bg-[#050f0a]/40 border border-emerald-900/10 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-lg relative overflow-hidden select-none">
        {/* Ambient interior light glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-emerald-950 tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              {title}
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                {products.length} {lang === 'en' ? 'Products' : 'مصنوعات'}
              </span>
            </h2>
            <p className="text-neutral-600 text-[11px] md:text-xs leading-relaxed max-w-4xl font-medium">
              {subtitle}
            </p>
          </div>
          
          {hasMore && !isMobile && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] md:text-xs font-black text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500 px-4 py-2 rounded-xl transition-all bg-emerald-500/10 hover:bg-emerald-500/25 shrink-0 cursor-pointer shadow-sm active:scale-95"
            >
              {expanded 
                ? (lang === 'en' ? 'Show Less ↑' : 'کم دکھائیں ↑') 
                : (lang === 'en' ? `Show All ${products.length} ↓` : `تمام ${products.length} دیکھیں ↓`)}
            </button>
          )}
        </div>
      </div>

      <motion.div 
        layout 
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6" 
        style={{ perspective: 1000 }}
      >
        <AnimatePresence mode="popLayout">
          {displayProducts.map((product, idx) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, y: 40, rotateX: 6, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.55, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductGridCard product={product} openCheckout={openCheckout} lang={lang} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Mobile Glass "Show More" Button */}
      {hasMore && isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-2"
        >
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-6 py-3 rounded-2xl text-xs font-black tracking-wider border cursor-pointer active:scale-95 transition-all duration-300"
            style={{
              background: expanded
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(255,255,255,0.02) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(255,255,255,0.03) 100%)',
              backdropFilter: 'blur(20px)',
              borderColor: expanded ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.35)',
              color: expanded ? '#f87171' : '#6ee7b7',
              boxShadow: expanded ? '0 0 20px rgba(239,68,68,0.15)' : '0 0 20px rgba(16,185,129,0.15)',
            }}
          >
            {expanded 
              ? (lang === 'en' ? '▲ Show Less' : '▲ کم دکھائیں') 
              : (lang === 'en' ? `▼ Show All ${products.length} Products` : `▼ تمام ${products.length} مصنوعات دکھائیں`)}
          </button>
        </motion.div>
      )}
    </div>
  );
};

const SECTION_DETAILS = {
  'seed-treatment': {
    title: { en: 'Seed Treatment Solutions', ur: 'بیج کا علاج (سرائیت پذیری)' },
    subtitle: { 
      en: 'Premium seed dressing and treatment compounds designed for complete protection against early seed-borne and soil-borne diseases. Promotes rapid seedling emergence and early vigor.',
      ur: 'بیج کی ابتدائی حفاظت اور بہترین اگاؤ کے لیے بیج کی دھلائی اور صفائی کے خاص بائیوٹیک مرکبات۔'
    }
  },
  'fungicide': {
    title: { en: 'Fungicides Collection', ur: 'پھپھوند کاش ادویات' },
    subtitle: {
      en: 'Advanced systemic, protective, and curative contact fungicides. Formulated with key active compounds to shield crops from blights, downy mildew, powdery mildew, blast, and rusts.',
      ur: 'جھلساؤ، کنگی، پتا دھبہ اور فنگس کے دیگر حملوں کے خلاف حفاظتی و علاجی اثرات سے بھرپور سسٹمک زہریں۔'
    }
  },
  'herbicide': {
    title: { en: 'Herbicides Registry', ur: 'جڑی بوٹی مار ادویات' },
    subtitle: {
      en: 'Elite pre-emergence and post-emergence weed control solutions. Targets broadleaf, narrow-leaf, and grassy weeds, keeping your fields clean and optimizing main crop development.',
      ur: 'چوڑے اور نوکیلے پتوں والی جڑی بوٹیوں کے مکمل اور مؤثر خاتمے کے لیے طاقتور فارمولے کی حامل ادویات۔'
    }
  },
  'insecticide': {
    title: { en: 'Insecticides Registry', ur: 'کیڑے مار ادویات' },
    subtitle: {
      en: 'Highly potent systemic, contact, and translaminar pest control agents. Designed to combat sucking pests, chewing caterpillars, borers, and mites to secure absolute harvest health.',
      ur: 'فصلوں پر حملہ کرنے والے سنڈیوں، چست تیلے، جوؤں اور بوررز کے فوری خاتمے کے لیے تیز اثر کیڑے مار ادویات۔'
    }
  },
  'plant-nutrition': {
    title: { en: 'Plant Nutrition & Fertilisers', ur: 'پودوں کی غذائیت اور کھادیں' },
    subtitle: {
      en: 'Premium chelated micronutrients, balanced NPK mixtures, liquid potash, and organic stimulants. Restores soil biology, boots immunity, and guarantees maximum crop yield quality.',
      ur: 'زنک، ہیومک ایسڈ، متوازن این پی کے اور سلفیٹ آف پوٹاش جیسے سپلیمنٹس جو فصل کو سرسبز اور پیداوار کو بڑھاتے ہیں۔'
    }
  }
};

export default function Products() {
  const { lang, t } = useLanguage();
  const { catalogLoaded } = useApp();

  // Dynamic Translation of Products
  const translatedProducts = useMemo(() => {
    const result = {};
    Object.keys(PRODUCTS_DATA).forEach(key => {
      const p = PRODUCTS_DATA[key];
      const nameVal = typeof p.name === 'object' ? (p.name[lang] || p.name.en || '') : (p.name || '');
      const taglineVal = typeof p.tagline === 'object' ? (p.tagline[lang] || p.tagline.en || '') : (p.tagline || '');
      const activeIngredientVal = typeof p.activeIngredient === 'object' ? (p.activeIngredient[lang] || p.activeIngredient.en || '') : (p.activeIngredient || '');
      const usageVal = typeof p.usage === 'object' ? (p.usage[lang] || p.usage.en || '') : (p.usage || '');
      const dosageVal = typeof p.dosage === 'object' ? (p.dosage[lang] || p.dosage.en || '') : (p.dosage || '');
      const diseasesVal = typeof p.diseases === 'object' ? (p.diseases[lang] || p.diseases.en || '') : (p.diseases || '');

      result[key] = {
        ...p,
        name: nameVal,
        category: t.categories?.[p.category] || p.category,
        tagline: taglineVal,
        activeIngredient: activeIngredientVal,
        usage: usageVal,
        dosage: dosageVal,
        diseases: diseasesVal
      };
    });
    return result;
  }, [lang, t]);

  const { isMobile } = useMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const setCategory = (newCat) => {
    setSearchParams(newCat === 'all' ? {} : { category: newCat });
  };
  const [search, setSearch] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);
  const [productsList, setProductsList] = useState([]);
  const [heroActiveIdx, setHeroActiveIdx] = useState(0);
  const [heroQuantity, setHeroQuantity] = useState(1);
  const [heroActiveSizeIdx, setHeroActiveSizeIdx] = useState(0);
  const navigate = useNavigate();

  const handleSearchExpand = useCallback(() => {
    setIsSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 150);
  }, []);

  const handleSearchCollapse = useCallback(() => {
    if (!search) {
      setIsSearchExpanded(false);
    }
  }, [search]);

  const CATEGORY_LABELS = {
    all: lang === 'en' ? 'All Products' : 'تمام مصنوعات',
    insecticide: t?.categories?.insecticide || 'Insecticides',
    herbicide: t?.categories?.herbicide || 'Herbicides',
    fungicide: t?.categories?.fungicide || 'Fungicides',
    'seed-treatment': t?.categories?.['seed-treatment'] || 'Seed Treatment',
    'plant-nutrition': t?.categories?.['plant-nutrition'] || t?.categories?.plant_nutrition || 'Plant Nutrition'
  };

  useEffect(() => {
    const loadProducts = () => {
      const allProducts = Object.values(translatedProducts);
      const validProducts = allProducts.filter(p => {
        // Validation Checks:
        // 1. ID exists
        if (!p.id) return false;
        // 2. Product Name exists
        const nameVal = typeof p.name === 'object' ? (p.name.en || p.name.ur) : p.name;
        if (!nameVal || !nameVal.trim()) return false;
        // 3. Category exists
        if (!p.category || !p.category.trim()) return false;
        // 4. Price exists
        const hasPrice = p.price !== undefined || (p.sizes && p.sizes.some(s => s.price !== undefined));
        if (!hasPrice) return false;
        // 5. Image exists
        const img = getProductImage(p);
        if (!img) return false;

        return true;
      });
      setProductsList(validProducts);
    };
    loadProducts();
    window.addEventListener('vital_catalog_hydrated', loadProducts);
    return () => window.removeEventListener('vital_catalog_hydrated', loadProducts);
  }, [translatedProducts]);


  const openCheckout = (product) => {
    const sizeParam = product.defaultSize ? `&size=${encodeURIComponent(product.defaultSize)}` : '';
    const qtyParam = product.defaultQty ? `&qty=${product.defaultQty}` : '';
    navigate(`/checkout?product=${product.slug || product.id}${sizeParam}${qtyParam}`);
  };

  // Maps backend/local raw product data to UI structure
  const mappedProducts = useMemo(() => {
    return productsList.map(p => {
      const sizeInfo = p?.sizes?.[0] || {};
      const price = sizeInfo?.price || p?.price || 0;
      const originalPrice = sizeInfo?.oldPrice || null;
      const discount = sizeInfo?.discount || (originalPrice ? Math.round((1 - price / originalPrice) * 100) : null);
      const categoryLabel = getCategoryLabel(p?.category);

      return {
        ...p,
        name: typeof p?.name === 'object' ? (p.name[lang] || p.name.en) : p?.name,
        name_en: typeof p?.name === 'object' ? p.name.en : p?.name,
        name_ur: typeof p?.name === 'object' ? p.name.ur : '',
        formula: p?.activeIngredient || p?.formulation || p?.genericChemical || "",
        image: getProductImage(p),
        price,
        originalPrice,
        discount,
        categoryLabel,
        sizes: p?.sizes || [{ size: p?.packaging || '100ML', price: p?.price || 0, oldPrice: p?.oldPrice || null }],
      };
    });
  }, [productsList, lang]);

  // Rotate Hero slide every 3 seconds
  useEffect(() => {
    if (mappedProducts.length === 0) return;
    const interval = setInterval(() => {
      setHeroActiveIdx(prev => (prev + 1) % mappedProducts.length);
      setHeroQuantity(1); // Reset quantiy for new product
      setHeroActiveSizeIdx(0); // Reset size index for new product
    }, 3000);
    return () => clearInterval(interval);
  }, [mappedProducts]);

  const activeHeroProduct = mappedProducts[heroActiveIdx] || null;
  const heroActiveSize = activeHeroProduct?.sizes?.[heroActiveSizeIdx] || {};
  const heroActivePrice = typeof heroActiveSize === 'object' ? (heroActiveSize?.price || activeHeroProduct?.price || 0) : (activeHeroProduct?.price || 0);
  const heroActiveSizeName = typeof heroActiveSize === 'object' ? heroActiveSize?.size : (activeHeroProduct?.packaging || '100ML');
  const heroActiveOriginalPrice = typeof heroActiveSize === 'object' ? (heroActiveSize?.oldPrice || activeHeroProduct?.originalPrice) : null;
  const heroOldPrice = heroActiveOriginalPrice || null;

  // Real-time double-language search filtering
  const filtered = useMemo(() => {
    return mappedProducts.filter(p => {
      const matchCat = category === 'all' || 
        p?.category?.toLowerCase()?.replace(/_/g, '-')?.replace(/\s+/g, '-') === category.toLowerCase()?.replace(/_/g, '-')?.replace(/\s+/g, '-');
      
      const searchLower = search.toLowerCase();
      const matchSearch = !search || 
        p?.name_en?.toLowerCase()?.includes(searchLower) ||
        p?.name_ur?.includes(search) ||
        p?.description?.en?.toLowerCase()?.includes(searchLower) ||
        p?.description?.ur?.includes(searchLower) ||
        p?.shortDesc?.en?.toLowerCase()?.includes(searchLower) ||
        p?.shortDesc?.ur?.includes(searchLower) ||
        p?.activeIngredient?.toLowerCase()?.includes(searchLower) ||
        p?.formula?.toLowerCase()?.includes(searchLower);
      
      return matchCat && matchSearch;
    });
  }, [mappedProducts, category, search]);

  // Group filtered products dynamically by main chemical category
  const groupedProducts = useMemo(() => {
    return {
      'seed-treatment': filtered.filter(p => {
        const cat = p.category?.toLowerCase()?.replace(/_/g, '-')?.replace(/\s+/g, '-');
        return cat === 'seed-treatment';
      }),
      'fungicide': filtered.filter(p => {
        const cat = p.category?.toLowerCase()?.replace(/_/g, '-')?.replace(/\s+/g, '-');
        return cat === 'fungicide';
      }),
      'herbicide': filtered.filter(p => {
        const cat = p.category?.toLowerCase()?.replace(/_/g, '-')?.replace(/\s+/g, '-');
        return cat === 'herbicide';
      }),
      'insecticide': filtered.filter(p => {
        const cat = p.category?.toLowerCase()?.replace(/_/g, '-')?.replace(/\s+/g, '-');
        return cat === 'insecticide';
      }),
      'plant-nutrition': filtered.filter(p => {
        const cat = p.category?.toLowerCase()?.replace(/_/g, '-')?.replace(/\s+/g, '-');
        return cat === 'plant-nutrition';
      }),
    };
  }, [filtered]);

  const categoryCounts = useMemo(() => {
    const counts = {
      all: mappedProducts.length,
      insecticide: 0,
      herbicide: 0,
      fungicide: 0,
      'seed-treatment': 0,
      'plant-nutrition': 0,
    };
    mappedProducts.forEach(p => {
      const cat = p.category?.toLowerCase()?.replace(/_/g, '-')?.replace(/\s+/g, '-');
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });
    return counts;
  }, [mappedProducts]);

  return (
    <div 
      className="min-h-screen text-emerald-950 font-body overflow-x-hidden relative"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(2, 5, 2, 0.35) 0%, rgba(2, 8, 4, 0.25) 50%, rgba(2, 5, 2, 0.45) 100%), url("/jungle_bg.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Premium Agricultural Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-amber-500/[0.03] blur-[100px] animate-pulse" style={{ animationDuration: '16s' }} />
        <div className="absolute top-[60%] left-[50%] w-[350px] h-[350px] rounded-full bg-emerald-400/[0.03] blur-[90px] animate-pulse" style={{ animationDuration: '20s' }} />
      </div>
      <SEOHead
        title="Premium Agricultural Catalog | Vital Agro"
        description="Shop Vital Agro's elite chemical catalog: Herbicides, Insecticides, Fungicides, Seed Treatment & Plant Nutrients. High-quality chelated chemical compounds."
        url="https://vital-agro.vercel.app/products"
        keywords="agrochemicals Pakistan, buy fertilizers online, pesticide store Lahore, seed treatment chemicals"
      />

      {/* Global CSS Styles for particles and lighting */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drift-dust {
          0% { transform: translateY(110vh) translateX(0) scale(0.5); opacity: 0; }
          20% { opacity: 0.4; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-10vh) translateX(50px) scale(1.3); opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(118, 201, 69, 0.35)) drop-shadow(0 0 25px rgba(118, 201, 69, 0.1)); }
          50% { filter: drop-shadow(0 0 25px rgba(118, 201, 69, 0.65)) drop-shadow(0 0 45px rgba(118, 201, 69, 0.3)); }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
        }
        .volumetric-rays {
          background: linear-gradient(135deg, rgba(118, 201, 69, 0.22) 0%, transparent 60%);
          clip-path: polygon(0 0, 100% 0, 80% 100%, 0 80%);
        }
        .cinematic-fog {
          filter: blur(80px);
        }
      `}} />

      {/* HERO PRODUCT SHOWCASE CONTAINER */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 border-b border-emerald-900/5 select-none">
        
        {/* Clean Linear Grid System Background */}
        <div 
          className="absolute inset-0 z-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '45px 45px',
            backgroundPosition: 'center center',
          }}
        />
        
        {/* Forest Background image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.85]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url("/jungle_bg.webp")',
              filter: 'brightness(0.65) contrast(1.05) saturate(1.1)',
            }}
          />
        </div>
        
        {/* Subtle vignette overlay to ensure typography contrast */}
        <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-b from-[#020502]/40 via-transparent to-[#020502]" />
        
        {/* Floating Dust Particles */}
        <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={`dust-${i}`}
              className="absolute w-1 h-1 rounded-full bg-[#76C945]/40 blur-[0.5px]"
              style={{
                left: `${10 + i * 8}%`,
                bottom: '-20px',
                animation: `drift-dust ${10 + i * 3}s infinite linear`,
                animationDelay: `${i * 0.8}s`
              }}
            />
          ))}
        </div>

        {/* Carousel Content */}
        {!catalogLoaded ? (
          <HeroSliderSkeleton />
        ) : activeHeroProduct ? (
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10 py-10">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Product Info */}
              <div className="lg:col-span-7 flex flex-col space-y-4 sm:space-y-6 order-2 lg:order-1">
                
                {/* Header Category and Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-[#76C945]/10 border border-[#76C945]/30 text-emerald-600 text-[10px] tracking-[0.2em] font-black uppercase rounded-md shadow-[0_0_8px_rgba(118,201,69,0.15)]">
                    ✦ {getCategoryLabel(activeHeroProduct.category)}
                  </span>
                  {activeHeroProduct.activeIngredient && (
                    <span className="px-3 py-1 bg-white/60 border border-emerald-900/10 text-neutral-600 text-[10px] tracking-wide font-bold rounded-md">
                      {activeHeroProduct.activeIngredient}
                    </span>
                  )}
                </div>

                {/* Slider Transition wrapper for Name and Desc */}
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={activeHeroProduct.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-2 sm:space-y-4"
                  >
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-emerald-950 flex flex-wrap gap-x-4 items-center">
                      <span>{activeHeroProduct.name}</span>
                      {activeHeroProduct.name_ur && (lang === 'ur' || lang === 'pb') && (
                        <span className="text-emerald-400 text-2xl sm:text-4xl font-extrabold" style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }} dir="rtl">
                          {activeHeroProduct.name_ur}
                        </span>
                      )}
                    </h1>

                    <div className="inline-block text-[10px] sm:text-xs font-mono font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full">
                      INGREDIENTS: {activeHeroProduct.formula || 'Biotech Active Synthesis'}
                    </div>

                    <p className="text-emerald-950/75 text-xs sm:text-base max-w-2xl leading-relaxed">
                      {activeHeroProduct.description?.[lang] || activeHeroProduct.description?.en || activeHeroProduct.shortDesc?.[lang] || activeHeroProduct.shortDesc?.en}
                    </p>

                    {/* Recommended Crops list */}
                    {activeHeroProduct.crops && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <span className="text-[10px] text-neutral-500 block font-black uppercase tracking-wider">Recommended Crops:</span>
                        <div className="flex flex-wrap gap-2">
                          {activeHeroProduct.crops.slice(0, 5).map((cr, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/60 border border-emerald-900/5 text-[10px] sm:text-xs font-bold text-neutral-700 flex items-center gap-1">
                              <span>{cr.icon || '🌱'}</span>
                              <span>{typeof cr.name === 'object' ? cr.name[lang] : cr.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Sizing, Pricing, and Action Section */}
                <div className="bg-slate-50/50 border border-emerald-900/5 backdrop-blur-xl rounded-[24px] p-5 sm:p-6 space-y-4 sm:space-y-6">
                  
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Sizes Selection */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-neutral-500 block font-black uppercase tracking-wider">Pack Sizes:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeHeroProduct.sizes?.map((sz, idx) => {
                          const sizeName = typeof sz === 'object' ? sz.size : sz;
                          const active = heroActiveSizeIdx === idx;
                          return (
                            <button
                              key={sizeName}
                              onClick={() => setHeroActiveSizeIdx(idx)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                                active 
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-md shadow-emerald-500/10'
                                  : 'bg-white/60 border-emerald-900/5 text-neutral-500 hover:bg-white/80 hover:text-emerald-950'
                              }`}
                            >
                              {sizeName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantity Adjustment */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-neutral-500 block font-black uppercase tracking-wider">Quantity:</span>
                      <div className="flex items-center gap-2 bg-white/60 rounded-xl border border-emerald-900/5 p-1 h-[34px] sm:h-[38px]">
                        <button
                          onClick={() => setHeroQuantity(q => Math.max(1, q - 1))}
                          className="w-6 h-6 rounded-lg bg-white/60 hover:bg-white/80 flex items-center justify-center font-bold text-emerald-950 text-xs transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-black text-emerald-950 font-mono">{heroQuantity}</span>
                        <button
                          onClick={() => setHeroQuantity(q => q + 1)}
                          className="w-6 h-6 rounded-lg bg-white/60 hover:bg-white/80 flex items-center justify-center font-bold text-emerald-950 text-xs transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-emerald-900/5 pt-4">
                    
                    {/* Price with Orange/Red Discount Badge */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                            {heroActivePrice === 0 ? 'On Request' : `PKR ${heroActivePrice.toLocaleString()}`}
                          </span>
                          {heroActivePrice > 0 && heroOldPrice && heroOldPrice > heroActivePrice && (
                            <span className="text-neutral-400 line-through text-xs sm:text-sm font-mono">
                              PKR {heroOldPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {heroActivePrice > 0 && heroOldPrice && heroOldPrice > heroActivePrice && (
                          <span className="text-[9px] sm:text-xs text-emerald-700/80 font-bold">
                            Save PKR {(heroOldPrice - heroActivePrice).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Large floating glass discount badge */}
                      {heroActivePrice > 0 && heroOldPrice && heroOldPrice > heroActivePrice && (
                        <div 
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-emerald-950 text-xs font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(239,68,68,0.45)] border border-red-400/20 select-none z-10 shrink-0"
                          style={{ animation: 'float-badge 3s infinite ease-in-out' }}
                        >
                          {Math.round((1 - heroActivePrice / heroOldPrice) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => openCheckout({ ...activeHeroProduct, defaultQty: heroQuantity, defaultSize: heroActiveSizeName })}
                        className="flex-1 sm:flex-none btn-premium-primary text-xs tracking-wider gap-1.5"
                      >
                        <ShoppingCart size={13} /> BUY NOW (COD)
                      </button>
                      <Link
                        to={`/products/${activeHeroProduct.slug || activeHeroProduct.id}`}
                        className="flex-1 sm:flex-none btn-premium-secondary text-xs tracking-wider gap-1"
                      >
                        VIEW DETAILS <ChevronRight size={13} />
                      </Link>
                    </div>

                  </div>

                </div>

              </div>

              {/* Right Column: Hero Interactive 3D podium and Levitating product */}
              <div className="lg:col-span-5 flex items-center justify-center order-1 lg:order-2 h-72 xs:h-80 sm:h-96 md:h-[420px] relative select-none">
                
                {/* Volumetric Green Glow behind bottle */}
                <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[#76C945]/15 sm:bg-[#76C945]/20 rounded-full blur-[80px] pointer-events-none z-0" />

                {/* 3D Podium Oval Base */}
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[80%] max-w-[360px] h-[35px] sm:h-[45px] pointer-events-none z-0">
                  {/* Outer shadow under podium */}
                  <div className="absolute inset-x-4 -bottom-3 h-4 rounded-full bg-black/90 blur-[8px]" />
                  {/* Reflections underneath */}
                  <div 
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-24 pointer-events-none opacity-20 blur-[2px] transition-all duration-700" 
                    style={{ 
                      transform: 'rotateX(180deg) translateY(-25px)',
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)'
                    }}
                  >
                    <img src={activeHeroProduct.image} alt="" className="w-full h-full object-contain pointer-events-none mx-auto" />
                  </div>
                  {/* Glowing Green Bottom Ring */}
                  <div className="absolute inset-x-0 bottom-[-6px] h-[10px] rounded-full bg-[#76C945]/50 blur-[6px] shadow-[0_0_25px_rgba(118,201,69,0.85)]" />
                  {/* Podium Cylinder Wall */}
                  <div className="absolute inset-x-0 top-[6px] sm:top-[8px] bottom-0 bg-gradient-to-b from-[#0a200a] to-[#010401] border-x border-b border-[#76C945]/30 rounded-b-full shadow-[0_6px_20px_rgba(0,0,0,0.8)]" />
                  {/* Podium Lid Disk */}
                  <div className="absolute inset-x-0 top-0 h-[10px] sm:h-[15px] rounded-full bg-gradient-to-b from-[#0e240a] to-[#020602] border border-[#76C945]/40 shadow-[inset_0_0_15px_rgba(118,201,69,0.65)]" />
                </div>

                {/* Animated Levitating Product Image */}
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={activeHeroProduct.id}
                    initial={{ opacity: 0, y: 15, scale: 0.85 }}
                    animate={{ opacity: 1, y: -8, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.85 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-44 xs:h-52 sm:h-64 md:h-76 w-full flex items-center justify-center relative z-10"
                    style={isMobile ? {} : { animation: 'glow-pulse 6s infinite ease-in-out' }}
                  >
                    <BlurUpImage
                      src={activeHeroProduct.image}
                      alt={activeHeroProduct.name}
                      loading="eager"
                      className="h-44 xs:h-52 sm:h-64 md:h-76 max-w-full object-contain select-none pointer-events-none mx-auto"
                      style={{
                        filter: isMobile 
                          ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.6))'
                          : 'drop-shadow(0 15px 25px rgba(0,0,0,0.85)) drop-shadow(0 0 15px rgba(118,201,69,0.45))'
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Manual Navigation Controls for Hero */}
                <button
                  onClick={() => setHeroActiveIdx(prev => (prev - 1 + mappedProducts.length) % mappedProducts.length)}
                  className="absolute left-1 w-9 h-9 rounded-full bg-emerald-950/5 border border-emerald-900/10 flex items-center justify-center text-emerald-950 hover:bg-[#76C945]/20 hover:border-[#76C945]/40 transition-colors z-20 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setHeroActiveIdx(prev => (prev + 1) % mappedProducts.length)}
                  className="absolute right-1 w-9 h-9 rounded-full bg-emerald-950/5 border border-emerald-900/10 flex items-center justify-center text-emerald-950 hover:bg-[#76C945]/20 hover:border-[#76C945]/40 transition-colors z-20 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>

              </div>

            </div>
          </div>
        ) : null}

      </section>

      {/* FILTER PANEL AND PRODUCTS LIST */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 space-y-12">
        
        {/* Categories Navigation Header */}
        <div 
          className="flex flex-col items-center gap-6 border rounded-[32px] p-6 shadow-[0_0_50px_rgba(0,0,0,0.8),_0_0_40px_rgba(16,185,129,0.05)] relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
          
          {/* Animated Expanding Search Bar */}
          <div className="flex items-center justify-center w-full max-w-2xl select-none relative z-10">
            <AnimatePresence mode="wait">
              {!isSearchExpanded ? (
                <motion.button
                  key="search-icon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  onClick={handleSearchExpand}
                  className="w-12 h-12 rounded-2xl bg-white/80 border border-emerald-900/10 hover:border-emerald-500/40 flex items-center justify-center text-neutral-500 hover:text-emerald-400 backdrop-blur-xl transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/10 hover:bg-emerald-500/5 active:scale-95"
                  aria-label="Open search"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              ) : (
                <motion.div
                  key="search-bar"
                  initial={{ width: 48, opacity: 0.5 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 48, opacity: 0.5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="relative w-full group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-emerald-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={handleSearchCollapse}
                    placeholder={lang === 'en' ? 'Search by product name, ingredient, formulation or crop...' : 'نام، دوا کا فارمولا، کیمیکل یا فصل سے تلاش کریں...'}
                    className="w-full pl-12 pr-12 py-3 bg-white/80 border border-emerald-900/10 focus:border-emerald-500/60 rounded-2xl text-xs sm:text-sm text-emerald-950 placeholder-white/35 focus:outline-none focus:ring-1 focus:ring-emerald-500/35 transition-all backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                  />
                  <button
                    onMouseDown={(e) => { e.preventDefault(); setSearch(''); setIsSearchExpanded(false); }}
                    className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-emerald-950 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
 
          {/* Category Tabs */}
          <div className="w-full overflow-x-auto no-scrollbar select-none relative z-10">
            <div className="flex gap-2 min-w-max md:justify-center px-2 py-0.5">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const isActive = category === key;
                const count = categoryCounts[key] || 0;
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`px-3.5 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 border flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                        : 'bg-white/70 border-emerald-900/10 text-neutral-500 hover:bg-white/80 hover:border-emerald-900/20'
                    }`}
                  >
                    {label}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/80 text-neutral-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
 
        </div>

        {/* Grouped Category Listing or Flat Grid Search */}
        <section 
          className="relative z-10 pb-20 rounded-[32px] overflow-hidden px-4 sm:px-6 md:px-8 py-8 md:py-12 border shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: 'rgba(255, 255, 255, 0.08)'
          }}
        >
          {!catalogLoaded ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {[...Array(8)].map((_, idx) => (
                <ProductGridCardSkeleton key={`skeleton-${idx}`} />
              ))}
            </div>
          ) : category === 'all' && !search ? (
            <div className="space-y-16">
              {Object.entries(groupedProducts).map(([key, prods]) => {
                if (prods.length === 0) return null;
                return (
                  <CategorySection
                    key={key}
                    categoryKey={key}
                    title={SECTION_DETAILS[key].title[lang]}
                    subtitle={SECTION_DETAILS[key].subtitle[lang]}
                    products={prods}
                    openCheckout={openCheckout}
                    lang={lang}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-emerald-900/5 pb-4 select-none">
                <h2 className="text-xl md:text-2xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block" />
                  {search 
                    ? (lang === 'en' ? `Search Results for "${search}"` : `تلاش کے نتائج برائے "${search}"`)
                    : CATEGORY_LABELS[category]}
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-normal">
                    {filtered.length} {lang === 'en' ? 'Products' : 'مصنوعات'}
                  </span>
                </h2>
              </div>
              
              {filtered.length > 0 ? (
                <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6" style={{ perspective: 1000 }}>
                  <AnimatePresence mode="popLayout">
                    {filtered.map((product, idx) => (
                      <motion.div
                        layout
                        key={product.id}
                        initial={{ opacity: 0, y: 45, rotateX: 8, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.65, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <ProductGridCard product={product} openCheckout={openCheckout} lang={lang} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="text-center py-20 bg-white/70 border border-emerald-900/5 rounded-[32px] p-8 max-w-2xl mx-auto shadow-2xl backdrop-blur-md flex flex-col items-center gap-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
                  <div className="w-20 h-20 rounded-full bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400/80 shadow-lg shadow-emerald-500/5">
                    <Search className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-emerald-950">
                      {lang === 'en' ? 'No Agrochemicals Found' : 'کوئی زرعی مصنوعات نہیں ملیں'}
                    </h3>
                    <p className="text-neutral-500 text-xs max-w-md leading-relaxed font-semibold">
                      {lang === 'en' 
                        ? "We couldn't find any premium products matching your query. Try checking your spelling or selecting another category filter." 
                        : "ہمیں آپ کی تلاش کے مطابق کوئی مصنوعات نہیں ملیں۔ براہ کرم ہجے چیک کریں یا دوسری کیٹیگری منتخب کریں۔"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearch('');
                      setCategory('all');
                    }}
                    className="btn-premium-primary text-xs tracking-wider font-extrabold"
                  >
                    {lang === 'en' ? 'Clear Search & Filters' : 'تلاش صاف کریں'}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
