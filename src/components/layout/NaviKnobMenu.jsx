'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  FlaskConical, 
  Dna, 
  FileText, 
  Home, 
  Search, 
  Star, 
  ShoppingBag,
  ArrowRight,
  Send,
  Check
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';
import { PRODUCTS_DATA } from '@/data/productsData';
import vitalAgroLogo from '@/assets/vital agro logo.webp';

export default function NaviKnobMenu({ isOpen, onClose, setIsMenuOpen }) {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { addToCart } = useCart();

  // Active node index: 0 = HOME, 1 = ABOUT US, 2 = PRODUCTS, 3 = WHY VITAL, 4 = GET A QUOTE
  const [activeIndex, setActiveIndex] = useState(2); // Default to PRODUCTS
  const [rotation, setRotation] = useState(270 - 144); // Align PRODUCTS (144deg) at top (270deg)
  const [isDragging, setIsDragging] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  
  // Interactive quote form states
  const [quoteName, setQuoteName] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // Responsive radius state
  const [R, setR] = useState(130);

  // 5 Navigation Nodes configuration with specific angles
  // HOME (0deg), ABOUT US (72deg), PRODUCTS (144deg), WHY VITAL (216deg), GET A QUOTE (288deg)
  const menuItems = [
    { 
      label: t.nav.home.toUpperCase(), 
      angle: 0,
      path: '/',
      icon: Home 
    },
    { 
      label: t.nav.about.toUpperCase(), 
      angle: 72,
      path: '/about', 
      icon: Users 
    },
    { 
      label: t.nav.products.toUpperCase(), 
      angle: 144,
      path: '/products', 
      icon: FlaskConical 
    },
    { 
      label: t.nav.whyUs.toUpperCase(), 
      angle: 216,
      path: '/why-us', 
      icon: Dna 
    },
    { 
      label: t.nav.getQuote.toUpperCase(), 
      angle: 288,
      path: '/contact', 
      icon: FileText
    }
  ];

  const containerRef = useRef(null);
  const touchStartAngleRef = useRef(0);
  const startRotationRef = useRef(0);
  
  const handleCloseMenu = () => {
    if (setIsMenuOpen) {
      setIsMenuOpen(false);
    } else if (onClose) {
      onClose();
    }
  };

  const initialPathRef = useRef(pathname);

  // Close overlay on path change
  useEffect(() => {
    if (pathname !== initialPathRef.current) {
      handleCloseMenu();
    }
  }, [pathname]);

  // Responsive radius effect
  useEffect(() => {
    const updateRadius = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 380) {
        setR(95);
      } else if (window.innerWidth < 640) {
        setR(110);
      } else {
        setR(130);
      }
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // Helper to get pointer angle relative to dial center
  const getPointerAngle = (clientX, clientY, rect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  // Touch handlers for manual rotation
  const handleTouchStart = (e) => {
    if (!containerRef.current) return;
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    touchStartAngleRef.current = getPointerAngle(touch.clientX, touch.clientY, rect);
    startRotationRef.current = rotation;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const angle = getPointerAngle(touch.clientX, touch.clientY, rect);
    const deltaAngle = angle - touchStartAngleRef.current;
    setRotation(startRotationRef.current + deltaAngle);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Find the nearest node to snap to the top center position (270 degrees absolute)
    let nearestIndex = 0;
    let minDiff = Infinity;

    menuItems.forEach((item, index) => {
      // absolute angle on screen is (item.angle + rotation)
      const absAngle = ((item.angle + rotation) % 360 + 360) % 360;
      let diff = Math.abs(absAngle - 270);
      if (diff > 180) diff = 360 - diff;

      if (diff < minDiff) {
        minDiff = diff;
        nearestIndex = index;
      }
    });

    // Snap to the nearest node top position
    const targetNode = menuItems[nearestIndex];
    let targetRot = 270 - targetNode.angle;

    // Calculate shortest delta rotation path to prevent complete loops
    const currentRotMod = ((rotation % 360) + 360) % 360;
    const targetRotMod = ((targetRot % 360) + 360) % 360;
    let delta = targetRotMod - currentRotMod;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    setRotation(rotation + delta);
    setActiveIndex(nearestIndex);
  };

  // Mouse handlers for desktop manual rotation dragging
  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    touchStartAngleRef.current = getPointerAngle(e.clientX, e.clientY, rect);
    startRotationRef.current = rotation;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const angle = getPointerAngle(e.clientX, e.clientY, rect);
    const deltaAngle = angle - touchStartAngleRef.current;
    setRotation(startRotationRef.current + deltaAngle);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleTouchEnd();
    }
  };

  // Node direct click rotation alignment
  const handleNodeClick = (index, item) => {
    let targetRot = 270 - item.angle;
    const currentRotMod = ((rotation % 360) + 360) % 360;
    const targetRotMod = ((targetRot % 360) + 360) % 360;
    let delta = targetRotMod - currentRotMod;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    setRotation(rotation + delta);
    setActiveIndex(index);
  };

  // Dynamic products list mapping
  const allProducts = Object.values(PRODUCTS_DATA).filter(p => p && p.id && p.name && p.name.en);
  const filteredProducts = allProducts.filter(p => 
    p.name.en.toLowerCase().includes(productSearch.toLowerCase()) || 
    (p.genericName?.en || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  // Elastic snap-rotation transition
  const transitionStyle = isDragging 
    ? 'none' 
    : 'transform 0.75s cubic-bezier(0.19, 1, 0.22, 1)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#060906]/95 backdrop-blur-2xl pointer-events-auto"
    >
      
      {/* Dynamic Ambient Biological Backdrop Grid & Cells */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="knob-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#knob-grid)" />
        </svg>
      </div>

      {/* Floating high-tech bio spores */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              y: [-10, -80, -10],
              opacity: [0.15, 0.7, 0.15]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Main Premium iOS/Android Native Phone-Sized Shell Canvas */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.94, opacity: 0, rotate: 2 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full h-full max-w-md bg-transparent relative flex flex-col justify-between overflow-hidden p-6 z-10"
      >
        
        {/* iOS Native Status Bar (9:41 AM, 4G, 100% Battery) */}
        <div className="flex justify-between items-center text-neutral-400 text-[10px] font-mono tracking-widest uppercase py-2">
          <span>9:41 AM</span>
          <div className="flex items-center gap-1.5">
            <span>4G</span>
            <div className="w-5.5 h-2.5 border border-emerald-900/20 rounded-sm p-[1px] flex items-center">
              <div className="w-full h-full bg-white/600 rounded-[1px]" />
            </div>
            <span>100%</span>
          </div>
        </div>

        {/* Brand Header Bar */}
        <div className="flex items-center justify-between border-b border-emerald-900/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-white/60 rounded-lg p-1 border border-emerald-900/10">
              <img src={vitalAgroLogo} alt="Vital Agro" className="h-5 w-auto object-contain" />
            </div>
            <div>
              <p className="text-emerald-950 font-black text-xs leading-none tracking-widest font-mono uppercase">VITAL AGRO</p>
              <p className="text-[#10b981] text-[7px] tracking-widest uppercase font-mono mt-0.5">BIO-AGRICULTURE ENGINE</p>
            </div>
          </div>
          <button 
            onClick={handleCloseMenu}
            className="w-7 h-7 rounded-xl bg-white/60 border border-emerald-900/10 hover:border-emerald-900/20 text-neutral-600 hover:text-emerald-950 flex items-center justify-center text-xs font-mono transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Central Dynamic Translucent Content Panel (Above the bottom knob) */}
        <div className="flex-1 flex items-center justify-center py-4 relative z-30">
          <AnimatePresence mode="wait">
            {activeIndex === 0 && (
              <motion.div
                key="home"
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="w-full rounded-3xl border border-emerald-900/10 bg-white/60 backdrop-blur-2xl p-6 shadow-2xl space-y-4 text-center flex flex-col justify-center min-h-[260px]"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Home className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-emerald-950 font-black text-sm tracking-wider font-mono uppercase">VITAL AGRO HOME</h3>
                <p className="text-emerald-950/55 text-[11px] leading-relaxed max-w-xs mx-auto">
                  Premium agricultural bio-stimulants, chelated foliar micronutrients, and crop yield protection blocks engineered for optimal soil health.
                </p>
                <button 
                  onClick={() => { navigate('/'); handleCloseMenu(); }}
                  className="mx-auto px-5 py-2.5 bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-emerald-300 font-mono text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 transition-all glow-action-trigger cursor-pointer"
                >
                  Enter Main Site <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {activeIndex === 1 && (
              <motion.div
                key="about"
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="w-full rounded-3xl border border-emerald-900/10 bg-white/60 backdrop-blur-2xl p-6 shadow-2xl space-y-4 text-center flex flex-col justify-center min-h-[260px]"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-emerald-950 font-black text-sm tracking-wider font-mono uppercase">ABOUT OUR LABORATORY</h3>
                <p className="text-emerald-950/55 text-[11px] leading-relaxed max-w-xs mx-auto">
                  Pioneering bio-stimulants and foliar crop nutrition. We formulate research-based solutions that bypass standard metadata metabolic pathways for plants.
                </p>
                <button 
                  onClick={() => { navigate('/about'); handleCloseMenu(); }}
                  className="mx-auto px-5 py-2.5 bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-emerald-300 font-mono text-[10px] font-black tracking-widest uppercase transition-all glow-action-trigger cursor-pointer"
                >
                  Read Profiles
                </button>
              </motion.div>
            )}

            {activeIndex === 2 && (
              <motion.div
                key="products"
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="w-full rounded-3xl border border-emerald-900/10 bg-white/60 backdrop-blur-2xl p-5 shadow-2xl flex flex-col justify-between min-h-[300px] space-y-3"
              >
                {/* Search Bar */}
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="search pesticide catalog..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 border border-emerald-900/10 text-emerald-950 text-xs font-mono outline-none placeholder:text-emerald-950/20 focus:border-emerald-500/40 transition-all"
                  />
                </div>

                {/* Horizontal Swipe Carousel of products */}
                <div className="flex-1 w-full flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2 gap-4">
                  {filteredProducts.length === 0 ? (
                    <div className="w-full text-center text-emerald-950/20 font-mono text-[10px] py-12">
                      NO PRODUCTS FOUND
                    </div>
                  ) : (
                    filteredProducts.map((p) => (
                      <div 
                        key={p.id}
                        className="flex-shrink-0 w-[210px] snap-center rounded-2xl border border-emerald-900/10 bg-slate-50/80 backdrop-blur-xl p-3.5 space-y-3 shadow-lg relative group overflow-hidden flex flex-col justify-between"
                      >
                        {/* High-res bottle showcase */}
                        <div className="aspect-[4/3] rounded-xl bg-black/30 border border-emerald-900/5 flex items-center justify-center p-2 relative">
                          <img 
                            src={p.pngUrl || p.imageUrl} 
                            alt={p.name.en} 
                            className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                          <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[8px] bg-emerald-500/15 text-emerald-600 border border-emerald-500/25 px-1.5 py-0.5 rounded font-black font-mono">
                            <Star className="w-2.5 h-2.5 fill-emerald-400 stroke-none" />
                            {p.rating || '4.9'}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="text-left space-y-1">
                          <h4 className="text-emerald-950 text-xs font-bold font-mono tracking-wider truncate">{p.name.en}</h4>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-500 text-[9px] font-mono">
                              {p.sizes?.[0]?.size || '500ml'}
                            </span>
                            <span className="text-emerald-600 text-xs font-black font-mono">
                              PKR {p.sizes?.[0]?.price || p.price || '750'}
                            </span>
                          </div>
                        </div>

                        {/* CTA Buy Now button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(p, p.sizes?.[0] || { size: "500ml", price: p.price || 750 }, 1);
                            handleCloseMenu();
                          }}
                          className="w-full py-2 bg-[#10b981] hover:bg-[#8ad65a] text-neutral-950 rounded-xl font-mono text-[9px] font-black tracking-widest uppercase flex items-center justify-center gap-1 transition-all cursor-pointer glow-action-trigger"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          BUY NOW (COD)
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeIndex === 3 && (
              <motion.div
                key="why-us"
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="w-full rounded-3xl border border-emerald-900/10 bg-white/60 backdrop-blur-2xl p-6 shadow-2xl space-y-4 text-center flex flex-col justify-center min-h-[260px]"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Dna className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-emerald-950 font-black text-sm tracking-wider font-mono uppercase">WHY VITAL CHEMICALS</h3>
                <div className="space-y-2 text-left max-w-xs mx-auto text-[10px] font-mono text-neutral-600">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    Foliar absorption under 48 hours
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    Zero crop metabolic waste blocks
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    Enhanced stress & drought resistance
                  </p>
                </div>
                <button 
                  onClick={() => { navigate('/why-us'); handleCloseMenu(); }}
                  className="mx-auto px-5 py-2.5 bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-emerald-300 font-mono text-[10px] font-black tracking-widest uppercase transition-all glow-action-trigger cursor-pointer"
                >
                  Verify Technology
                </button>
              </motion.div>
            )}

            {activeIndex === 4 && (
              <motion.div
                key="quote"
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="w-full rounded-3xl border border-emerald-900/10 bg-white/60 backdrop-blur-2xl p-5 shadow-2xl flex flex-col justify-center min-h-[260px] space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-emerald-950 font-black text-xs tracking-wider font-mono uppercase">REQUEST CARTON QUOTE</h3>
                  <p className="text-neutral-500 text-[9px] font-mono uppercase mt-0.5">Submit Farm Bulk Pricing Inquiries</p>
                </div>

                <AnimatePresence mode="wait">
                  {!quoteSubmitted ? (
                    <motion.form 
                      key="quote-form"
                      onSubmit={e => {
                        e.preventDefault();
                        if (quoteName && quotePhone) {
                          setQuoteSubmitted(true);
                          setTimeout(() => {
                            setQuoteSubmitted(false);
                            setQuoteName('');
                            setQuotePhone('');
                            handleCloseMenu();
                          }, 3000);
                        }
                      }}
                      className="space-y-3"
                    >
                      <input
                        type="text"
                        placeholder="Your Name"
                        required
                        value={quoteName}
                        onChange={e => setQuoteName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-emerald-900/10 text-emerald-950 text-xs font-mono outline-none focus:border-emerald-500/40 transition-all"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        required
                        value={quotePhone}
                        onChange={e => setQuotePhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-emerald-900/10 text-emerald-950 text-xs font-mono outline-none focus:border-emerald-500/40 transition-all"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#10b981] hover:bg-[#8ad65a] text-neutral-950 rounded-xl font-mono text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer glow-action-trigger"
                      >
                        <Send className="w-3.5 h-3.5" />
                        SUBMIT INQUIRY
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="quote-success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6 space-y-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider font-extrabold">Quote Request Received</p>
                      <p className="text-neutral-500 text-[9px] font-mono">Our specialists will contact you shortly.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3D Rotating Radial Knob Menu Section (Centered bottom half) */}
        <div className="h-[220px] relative flex items-center justify-center mt-auto py-4">
          <div 
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="absolute w-[320px] h-[320px] bottom-[-130px] rounded-full flex items-center justify-center touch-none select-none z-20 pointer-events-auto"
          >
            {/* Orbital struts linking core to nodes */}
            <svg className="absolute w-full h-full pointer-events-none z-10">
              <g transform="translate(160, 160)">
                {menuItems.map((item, index) => {
                  const rad = ((item.angle + rotation) * Math.PI) / 180;
                  const x2 = R * Math.cos(rad);
                  const y2 = R * Math.sin(rad);
                  return (
                    <line 
                      key={index}
                      x1="0" 
                      y1="0" 
                      x2={x2} 
                      y2={y2} 
                      stroke="rgba(16, 185, 129, 0.15)" 
                      strokeWidth="1" 
                      strokeDasharray="3 6"
                    />
                  );
                })}
              </g>
            </svg>

            {/* Rotating Dotted Ring Dial */}
            <div 
              className="absolute w-[290px] h-[290px] rounded-full border border-dashed border-white/[0.04]"
              style={{ transform: `rotate(${-rotation}deg)`, transition: transitionStyle }}
            />

            {/* Outer Compass Genetic Dial Ring */}
            <div 
              className="absolute w-[260px] h-[260px] rounded-full border border-dotted border-emerald-500/10 flex items-center justify-center"
              style={{ transform: `rotate(${rotation}deg)`, transition: transitionStyle }}
            >
              <span className="absolute text-[5px] font-mono text-emerald-950/10 select-none tracking-[0.2em] uppercase">
                VITAL-AGRO-DNA-STRUT-PATHWAY
              </span>
            </div>

            {/* Concentric glassmorphic base ring */}
            <div className="absolute w-[220px] h-[220px] rounded-full bg-slate-50/15 border border-emerald-900/5 backdrop-blur-[1px]" />

            {/* Rotating nodes wheel container */}
            <div 
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transition: transitionStyle
              }}
              className="absolute w-full h-full rounded-full flex items-center justify-center pointer-events-none"
            >
              {menuItems.map((item, index) => {
                const rad = (item.angle * Math.PI) / 180;
                const x = R * Math.cos(rad);
                const y = R * Math.sin(rad);

                const Icon = item.icon;
                const isActive = activeIndex === index;

                return (
                  <div
                    key={index}
                    className="absolute pointer-events-auto cursor-pointer focus:outline-none"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(index, item);
                      navigate(item.path);
                      handleCloseMenu();
                    }}
                  >
                    <div 
                      style={{ 
                        transform: `rotate(${-rotation}deg)`,
                        transition: transitionStyle
                      }}
                      className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl border transition-all duration-300 min-w-[75px] ${
                        isActive
                          ? 'bg-slate-50/90 border-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-105'
                          : 'backdrop-blur-md bg-white/60 border-emerald-900/5 hover:border-emerald-900/15 scale-90 opacity-60'
                      }`}
                    >
                      <div className={`p-1 rounded-lg ${isActive ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-white/60 text-neutral-600'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[8px] font-black font-mono tracking-wider ${isActive ? 'text-[#10b981]' : 'text-neutral-600'}`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Central Dial core knob (Close Overlay button with VITAL AGRO logo) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseMenu();
              }}
              className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-[#051c0c] to-[#0d0d0d] border-2 border-emerald-900/10 hover:border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center pointer-events-auto z-[999] group overflow-hidden"
            >
              {/* Inner animated rotating needle */}
              <div 
                className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transition: transitionStyle
                }}
              >
                <div className="w-[2px] h-[30px] bg-[#10b981] rounded-full -translate-y-[12px] shadow-[0_0_8px_#10b981]" />
              </div>

              {/* Central Logo Core */}
              <div className="relative z-10 w-14 h-14 rounded-full bg-black/80 border border-emerald-900/5 flex flex-col items-center justify-center p-1.5 shadow-inner">
                <img src={vitalAgroLogo} alt="Logo" className="w-6 h-auto object-contain animate-pulse" />
                <span className="text-[5px] font-mono text-neutral-400 tracking-wider mt-0.5 group-hover:text-[#10b981] transition-colors">
                  CLOSE
                </span>
              </div>
            </button>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
