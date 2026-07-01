'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { useLanguage } from '@/lib/LanguageContext';
import { PRODUCTS_DATA, PENDING_IMAGES } from '@/data/productsData';
import CheckoutPage from '@/pages/Checkout';
import toast from 'react-hot-toast';
import { ShoppingBag, ChevronRight, Download, Package, Check, CreditCard, Truck } from 'lucide-react';

const AUTO_SLIDE_INTERVAL = 7000; // 7 seconds

const SHOWCASE_PRODUCTS = [
  {
    ...PRODUCTS_DATA['conference-gold-fs'],
    themeColor: '#8B1A1A',
    themeDark: '#1a0308',
    badge: 'BEST SELLER',
    tagline: 'Dual-Action Systemic Protection',
  },
  {
    ...PRODUCTS_DATA['fatty'],
    themeColor: '#0D6E5B',
    themeDark: '#01130e',
    badge: 'NEW',
    tagline: 'Premium Bio-Stimulant Formula',
  },
  {
    ...PRODUCTS_DATA['easy-grow-sc'],
    themeColor: '#8B0A50',
    themeDark: '#1c0210',
    tagline: 'Elite Vegetative Stimulator',
  },
  {
    ...PRODUCTS_DATA['vac-zinc'],
    themeColor: '#2D5A1B',
    themeDark: '#091305',
    tagline: 'Chelated Micronutrient Fertilizer',
  },
  {
    ...PRODUCTS_DATA['output'],
    themeColor: '#1A1A4E',
    themeDark: '#05051a',
    tagline: 'Elite Fruiting & Sizing Catalyst',
  },
  {
    ...PRODUCTS_DATA['super-4g'],
    themeColor: '#8B4A00',
    themeDark: '#1a0d00',
    tagline: 'Soil Granular Protection Elite',
  },
  {
    ...PRODUCTS_DATA['aaqab'],
    themeColor: '#0A2A7A',
    themeDark: '#02091c',
    tagline: 'Advanced Lepidoptera Specialist',
  },
  {
    ...PRODUCTS_DATA['sector'],
    themeColor: '#4A0A6B',
    themeDark: '#0f0217',
    tagline: 'Selective Pre & Post Herbicide',
  },
  {
    ...PRODUCTS_DATA['purifizin-extra'],
    themeColor: '#6B3A0A',
    themeDark: '#170c02',
    tagline: 'Premium Broad Spectrum Fungicide',
  },
  {
    ...PRODUCTS_DATA['dr-pp'],
    themeColor: '#0A4A5A',
    themeDark: '#020f12',
    tagline: 'Elite Stress Relieving Formula',
  },
  {
    ...PRODUCTS_DATA['farbasin'],
    themeColor: '#a78bfa',
    themeDark: '#130a1c',
    tagline: 'Systemic Fungicide Powder',
  }
].filter((p) => p.id && !PENDING_IMAGES.includes(p.slug || p.id));

// 60FPS High Performance Rolling Number Price Counter
const RollingPrice = ({ price }) => {
  const [displayVal, setDisplayVal] = useState(price);

  useEffect(() => {
    let start = displayVal;
    const end = price;
    if (start === end) return;

    const duration = 500; // ms
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // easeOutQuad
      const current = Math.round(start + (end - start) * ease);
      setDisplayVal(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [price]);

  return <span>PKR {displayVal.toLocaleString()}</span>;
};

export default function ProductShowcase() {
  const [currentIdx, setIdx] = useState(0);
  const [direction, setDir] = useState(1); // 1=right, -1=left
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const timerRef = useRef();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  const current = SHOWCASE_PRODUCTS[currentIdx];

  // Auto-advance every 7 seconds
  useEffect(() => {
    if (isPaused || isCheckoutOpen) return;
    timerRef.current = setInterval(() => {
      setDir(1);
      setIdx((i) => (i + 1) % SHOWCASE_PRODUCTS.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [isPaused, currentIdx, isCheckoutOpen]);

  // Reset selected size when sliding products
  useEffect(() => {
    setSelectedSizeIdx(0);
  }, [currentIdx]);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setDir(idx > currentIdx ? 1 : -1);
    setIdx(idx);
  };

  const openCheckout = (product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  // Swipe gesture support
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goTo((currentIdx + 1) % SHOWCASE_PRODUCTS.length),
    onSwipedRight: () => goTo((currentIdx - 1 + SHOWCASE_PRODUCTS.length) % SHOWCASE_PRODUCTS.length),
    trackMouse: false,
    preventScrollOnSwipe: true,
  });

  const handleDownload = () => {
    const activeLabels = labels[lang] || labels.en;
    const prodName = current.name[lang] || current.name.en || current.name;
    toast.success(`${activeLabels.downloadStarted}: ${activeLabels.downloadDesc} ${prodName}`);
  };

  const labels = {
    en: {
      formula: "Chemical Formula",
      benefits: "Key Benefits",
      sizes: "Available Sizes",
      stock: "Stock Status",
      delivery: "Delivery Information",
      payment: "Payment Methods",
      codNotice: "COD Notice",
      freeShipping: "FREE Shipping on Full Bank Advance Payment! 🎁",
      codCharges: "COD order requires PKR 299 delivery fee paid up front.",
      codAvailable: "Remaining balance paid at your door on delivery.",
      checkout: "Quick Checkout",
      viewProfile: "View Product Profile",
      downloadBrochure: "Download Brochure",
      downloadStarted: "Brochure download started",
      downloadDesc: "Downloading technical sheet for "
    },
    ur: {
      formula: "کیمیکل فارمولا",
      benefits: "اہم فوائد",
      sizes: "دستیاب سائز",
      stock: "اسٹاک کی صورتحال",
      delivery: "شپنگ کی تفصیلات",
      payment: "ادائیگی کے طریقے",
      codNotice: "سی او ڈی نوٹس",
      freeShipping: "مکمل پیشگی ادائیگی پر فری ڈلیوری! 🎁",
      codCharges: "سی او ڈی آرڈر کے لیے 299 روپے کی ڈلیوری فیس پیشگی ادا کرنا لازمی ہے۔",
      codAvailable: "باقی رقم ڈیلیوری کے وقت وصول کی جائے گی۔",
      checkout: "فوری آرڈر (COD)",
      viewProfile: "تفصیلات دیکھیں",
      downloadBrochure: "بروشر ڈاؤن لوڈ کریں",
      downloadStarted: "ڈاؤن لوڈ شروع ہو گیا ہے",
      downloadDesc: "بروشر ڈاؤن لوڈ کیا جا رہا ہے برائے "
    }
  };

  const activeLabels = labels[lang] || labels.en;

  const currentSizeObj = current.sizes?.[selectedSizeIdx] || {
    size: current.packaging || '100ML',
    price: current.price || 999,
    stockStatus: 'In Stock'
  };

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between select-none z-10 py-16 lg:py-24"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 60% 40%, ${current.themeColor}18 0%, ${current.themeDark} 60%, #020702 100%)`,
        transition: 'background 1.2s ease-in-out',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      {...swipeHandlers}
    >
      {/* ANIMATED GRAIN TEXTURE OVERLAY */}
      <div
        className="absolute inset-0 z-1 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: 'url(/noise.png)', backgroundRepeat: 'repeat' }}
      />

      {/* FLOATING PARTICLES — tinted to product theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-2">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`particle-${currentIdx}-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 3 + Math.random() * 4,
              height: 3 + Math.random() * 4,
              background: current.themeColor,
              opacity: 0.35,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              filter: `blur(1px) drop-shadow(0 0 5px ${current.themeColor})`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.35, 0.7, 0.35],
            }}
            transition={{
              duration: 3.5 + Math.random() * 2.5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-12 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6">

          {/* LEFT — Product info (Col-span 6) */}
          <div className="lg:col-span-6 flex flex-col order-2 lg:order-1 text-left relative z-20">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`text-${current.id}`}
                custom={direction}
                variants={{
                  enter: (d) => ({ x: d > 0 ? -100 : 100, opacity: 0, filter: 'blur(10px)' }),
                  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
                  exit: (d) => ({ x: d > 0 ? 100 : -100, opacity: 0, filter: 'blur(10px)' }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col space-y-3.5 sm:space-y-4 max-h-[85vh] lg:max-h-none overflow-y-auto scrollbar-hide"
              >
                {/* Category badge */}
                <span
                  className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase mb-1 w-fit"
                  style={{
                    background: `${current.themeColor}22`,
                    border: `1px solid ${current.themeColor}40`,
                    color: current.themeColor,
                    boxShadow: `0 0 20px ${current.themeColor}15`,
                  }}
                >
                  {current.badge && <span>{current.badge}</span>}
                  {current.badge && <span className="opacity-50">·</span>}
                  {current.category ? current.category.toUpperCase().replace('_', ' ') : 'AGRICULTURE'}
                </span>

                {/* Product name — large */}
                <h2
                  className="text-4xl sm:text-5xl lg:text-7.5xl font-black text-emerald-950 leading-none tracking-tight"
                  style={{ textShadow: `0 0 40px ${current.themeColor}20` }}
                >
                  {current.name[lang] || current.name}
                </h2>

                {/* Chemical Formula */}
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">
                    {activeLabels.formula}
                  </span>
                  <p className="text-neutral-700 text-xs sm:text-sm font-semibold tracking-wide font-mono mt-0.5">
                    {current.activeIngredient || current.formulation}
                  </p>
                </div>

                {/* Short Description */}
                <p
                  className="text-neutral-600 text-xs sm:text-sm leading-relaxed max-w-md border-l-2 pl-3"
                  style={{ borderColor: `${current.themeColor}50` }}
                >
                  {current.shortDesc?.[lang] || current.description[lang]?.split('۔')[0] + '۔' || current.description}
                </p>

                {/* Key Benefits */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">
                    {activeLabels.benefits}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    {(current.benefits?.[lang] || []).slice(0, 4).map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 text-neutral-700 text-xs font-semibold">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: `${current.themeColor}20`, border: `1px solid ${current.themeColor}40` }}>
                          <Check className="w-2.5 h-2.5" style={{ color: current.themeColor }} />
                        </div>
                        <span className="truncate">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Sizes */}
                {current.sizes && current.sizes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">
                      {activeLabels.sizes}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {current.sizes.map((sz, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSizeIdx(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all duration-300 ${
                            selectedSizeIdx === idx
                              ? 'text-emerald-950 border-white bg-white/80 scale-102 shadow-sm'
                              : 'text-neutral-500 border-emerald-900/10 bg-white/60 hover:border-emerald-900/20'
                          }`}
                          style={{ borderColor: selectedSizeIdx === idx ? current.themeColor : '' }}
                        >
                          {sz.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price, Stock and Notices */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-emerald-900/5">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black font-mono tracking-tight" style={{ color: current.themeColor }}>
                      <RollingPrice price={currentSizeObj.price} />
                    </span>
                    {/* Stock Status */}
                    <span className="flex items-center gap-1.5 text-[10px] mt-1 font-bold">
                      <span className={`w-1.5 h-1.5 rounded-full ${currentSizeObj.stockStatus === 'In Stock' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                      <span className={currentSizeObj.stockStatus === 'In Stock' ? 'text-emerald-400' : 'text-amber-400'}>
                        {currentSizeObj.stockStatus === 'In Stock' ? (lang === 'en' ? 'IN STOCK' : 'دستیاب ہے') : (lang === 'en' ? 'LOW STOCK' : 'محدود اسٹاک')}
                      </span>
                    </span>
                  </div>

                  {/* Delivery / Payment / COD Notice */}
                  <div className="flex flex-col space-y-1.5 max-w-xs text-[10px] text-neutral-500 leading-relaxed font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-emerald-400">{activeLabels.freeShipping}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      <span>{activeLabels.codCharges}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 shrink-0" />
                      <span>{activeLabels.codAvailable}</span>
                    </div>
                  </div>
                </div>

                {/* Primary & Secondary Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => openCheckout(current)}
                    className="flex-1 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm text-emerald-950 uppercase tracking-wider relative overflow-hidden transition-all duration-300 hover:scale-102 active:scale-98 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${current.themeColor}cc, ${current.themeColor})`,
                      boxShadow: `0 8px 30px ${current.themeColor}35`,
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/80"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.4 }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      {activeLabels.checkout}
                    </span>
                  </button>

                  <button
                    onClick={() => navigate(`/products/${current.slug}`)}
                    className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm border transition-all duration-300 bg-white/60 flex items-center justify-center gap-1.5 hover:bg-white/80"
                    style={{
                      borderColor: `${current.themeColor}40`,
                      color: current.themeColor,
                    }}
                  >
                    <span>{activeLabels.viewProfile}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-4 py-3.5 rounded-2xl font-bold text-xs sm:text-sm border border-emerald-900/10 hover:border-emerald-900/20 transition-all text-neutral-600 hover:text-emerald-950 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">{activeLabels.downloadBrochure}</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT — 3D Floating Product Image (Col-span 6) */}
          <div className="lg:col-span-6 flex items-center justify-center order-1 lg:order-2 relative py-4 lg:py-0" style={{ perspective: '1000px' }}>
            {/* Glow behind product */}
            <div
              className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full blur-[80px] opacity-25 transition-all duration-1000 z-0"
              style={{ background: current.themeColor }}
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`image-${current.id}`}
                custom={direction}
                variants={{
                  enter: (d) => ({ x: d > 0 ? 150 : -150, opacity: 0, scale: 0.75, rotateY: d > 0 ? 45 : -45 }),
                  center: { x: 0, opacity: 1, scale: 1, rotateY: 0 },
                  exit: (d) => ({ x: d > 0 ? -150 : 150, opacity: 0, scale: 0.75, rotateY: d > 0 ? -45 : 45 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex items-center justify-center"
              >
                {/* GLASS CARD around product */}
                <div
                  className="relative flex items-center justify-center w-56 h-64 sm:w-72 sm:h-80 md:w-80 md:h-[400px] rounded-[36px]"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
                    backdropFilter: 'blur(24px)',
                    border: `1px solid ${current.themeColor}35`,
                    boxShadow: `0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)`,
                  }}
                >
                  {/* Bottom glass glow */}
                  <div
                    className="absolute bottom-0 inset-x-0 h-24 rounded-b-[36px]"
                    style={{
                      background: `linear-gradient(to top, ${current.themeColor}15, transparent)`,
                    }}
                  />

                  {/* Ground shadow & glow directly under bottle */}
                  <motion.div
                    className="absolute bottom-6 w-36 h-6 rounded-full blur-xl"
                    style={{ background: `${current.themeColor}` }}
                    animate={{ scaleX: [1, 1.15, 1], opacity: [0.45, 0.7, 0.45] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Product image — floating 3D */}
                  <motion.img
                    src={current.pngUrl || current.imageUrl}
                    alt={current.name[lang] || current.name}
                    className="relative z-10 object-contain"
                    style={{
                      height: '75%',
                      filter: `drop-shadow(0 25px 45px rgba(0,0,0,0.65)) drop-shadow(0 0 30px ${current.themeColor}30)`,
                    }}
                    animate={{
                      y: [0, -14, 0],
                      rotateY: [0, 4, 0, -4, 0],
                      rotateX: [0, 1.5, 0],
                    }}
                    transition={{
                      y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
                      rotateY: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                      rotateX: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                    }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* BOTTOM: Progress dots + auto-timer bar */}
      <div className="relative z-20 flex flex-col items-center gap-3">
        {/* Auto-progress bar */}
        {!isPaused && !isCheckoutOpen && (
          <motion.div
            key={`progress-${currentIdx}`}
            className="h-[2px] rounded-full"
            style={{ background: current.themeColor, width: '120px' }}
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: 1 }}
            transition={{ duration: AUTO_SLIDE_INTERVAL / 1000, ease: 'linear' }}
          />
        )}

        {/* Dots */}
        <div className="flex gap-2 items-center">
          {SHOWCASE_PRODUCTS.map((product, i) => (
            <button
              key={product.id}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300 h-2"
              style={{
                width: i === currentIdx ? 24 : 8,
                background: i === currentIdx ? current.themeColor : 'rgba(255,255,255,0.2)',
                boxShadow: i === currentIdx ? `0 0 10px ${current.themeColor}a0` : 'none',
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Product count */}
        <p className="text-neutral-400 text-[10px] tracking-wider font-mono">
          {currentIdx + 1} / {SHOWCASE_PRODUCTS.length}
        </p>
      </div>

      {/* Checkout Page Overlay */}
      {isCheckoutOpen && checkoutProduct && (
        <AnimatePresence>
          <CheckoutPage
            product={checkoutProduct}
            defaultSize={checkoutProduct.sizes?.[selectedSizeIdx]?.size || checkoutProduct.packaging || '100ML'}
            defaultQuantity={1}
            onClose={() => setIsCheckoutOpen(false)}
          />
        </AnimatePresence>
      )}
    </section>
  );
}
