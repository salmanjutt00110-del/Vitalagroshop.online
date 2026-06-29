import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  MessageCircle, 
  Download, 
  Check, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { gsap } from 'gsap';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';
import { PRODUCTS_DATA } from '@/data/productsData';
import { useApp } from '@/contexts/AppContext';

// List of exact 11 featured products requested
const FEATURED_SLUGS = [
  "conference-gold-fs",
  "easy-grow-sc",
  "fatty",
  "output",
  "aaqab",
  "vac-zinc",
  "sector",
  "purifizin",
  "dr-pp",
  "farbasin",
  "super-4g"
];

// Falling leaf SVG paths for the nature ambience
const LEAF_PATHS = [
  "M17 2s-5 1.5-8 5-3 8-3 8 4-1 7-4 5-8 5-8z M6 22c0-3 2.5-6.5 5-9",
  "M12 2C8 6.5 6 11 6 15c0 4 3 6.5 6 6.5s6-2.5 6-6.5c0-4-2-8.5-6-13zm0 17.5c-2.2 0-4-1.8-4-4 0-2.5 2-5.5 4-8.2 2 2.7 4 5.7 4 8.2 0 2.2-1.8 4-4 4z",
  "M21 2c-4 0-9 4.5-10.5 8.5C9.5 12.5 7 17 7 17s3.5-1 6-3.5c3.5-3.5 8-11.5 8-11.5z M4 20c0-2 2-4.5 4.5-6.5"
];

// Psychological Pricing Helper: Disabled to show real prices
const formatPsychologicalPrice = (price) => {
  return price;
};

export default function PremiumGlassShowcase() {
  const { lang, t } = useLanguage();
  const { addToCart, setIsCartOpen } = useCart();
  const { setActiveDetailsProduct } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Track selected pack size index per product slug (key = slug, value = sizeIndex)
  const [selectedSizes, setSelectedSizes] = useState({});

  // Autoplay control state
  const [isPlaying, setIsPlaying] = useState(true);

  // Refs for animations
  const leftPanelRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const rollingPriceRef = useRef(null);
  const priceValObj = useRef({ val: 0 });
  const canvasRef = useRef(null);



  // Map slugs dynamically from data
  const featuredProducts = useMemo(() => {
    return FEATURED_SLUGS.map(slug => PRODUCTS_DATA[slug]).filter(Boolean);
  }, []);

  const activeProduct = featuredProducts[currentIndex];
  const activeSizeIdx = activeProduct ? (selectedSizes[activeProduct.slug] || 0) : 0;
  const activeSize = activeProduct?.sizes?.[activeSizeIdx] || activeProduct?.pricing?.[0] || { size: "1 LTR", price: 999, oldPrice: 1299, sku: "VA-GEN-01", stockStatus: "In Stock" };

  const displayedPrice = formatPsychologicalPrice(activeSize.price || activeSize.rate || 999);
  const displayedOldPrice = activeSize.oldPrice ? formatPsychologicalPrice(activeSize.oldPrice) : null;

  // Initialize first sizes
  useEffect(() => {
    if (activeProduct && selectedSizes[activeProduct.slug] === undefined) {
      setSelectedSizes(prev => ({ ...prev, [activeProduct.slug]: 0 }));
    }
  }, [activeProduct, selectedSizes]);

  // Rolling Number Counter Animation using GSAP
  useEffect(() => {
    const targetPrice = displayedPrice;
    
    // Smooth scroll numerical tick
    gsap.to(priceValObj.current, {
      val: targetPrice,
      duration: 0.65,
      ease: "power2.out",
      onUpdate: () => {
        if (rollingPriceRef.current) {
          rollingPriceRef.current.innerText = `PKR ${Math.round(priceValObj.current.val)}`;
        }
      }
    });
  }, [displayedPrice]);

  // Synchronized GSAP animations on product change
  useEffect(() => {
    if (!leftPanelRef.current) return;

    // Elastic ease fade ups
    const elements = leftPanelRef.current.querySelectorAll('.animate-gsap');
    gsap.fromTo(elements, 
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)', 
        duration: 0.8, 
        stagger: 0.04, 
        ease: "power3.out"
      }
    );
  }, [currentIndex]);

  // Magnetic Button Hover Effects
  const handleMagneticHover = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(btn, {
      x: x * 0.35,
      y: y * 0.35,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMagneticLeave = (e) => {
    const btn = e.currentTarget;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.45)"
    });
  };



  // Navigations
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  // Autoplay Timer (7 seconds)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, featuredProducts]);

  // Interactive Sizing select
  const selectSize = (idx) => {
    setSelectedSizes(prev => ({
      ...prev,
      [activeProduct.slug]: idx
    }));
  };

  // Add to cart integrations
  const triggerAddToCart = () => {
    addToCart(activeProduct, activeSize, 1);
  };

  const triggerBuyNow = () => {
    addToCart(activeProduct, activeSize, 1);
    setIsCartOpen(true);
  };

  // Dynamic Background glow highlights based on active product category
  const activeGlowColors = useMemo(() => {
    if (!activeProduct) return { from: 'rgba(118, 201, 69, 0.12)', to: 'rgba(138, 214, 90, 0.04)' };
    switch (activeProduct.category) {
      case 'insecticide':
        return { from: 'rgba(59, 130, 246, 0.12)', to: 'rgba(96, 165, 250, 0.04)' }; // Blue
      case 'fungicide':
      case 'herbicide':
        return { from: 'rgba(245, 158, 11, 0.12)', to: 'rgba(197, 160, 89, 0.04)' }; // Amber / Gold
      case 'plant_nutrition':
      case 'plant-nutrition':
      case 'seed-treatment':
      case 'growth_promoter':
      default:
        return { from: 'rgba(118, 201, 69, 0.12)', to: 'rgba(138, 214, 90, 0.04)' }; // Green
    }
  }, [activeProduct]);

  // GPU Canvas nature particle rendering system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let isRunning = false;
    let isVisible = true;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    const count = typeof window !== 'undefined' && window.innerWidth < 768 ? 12 : 30;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -(Math.random() * 0.4 + 0.1),
        opacity: Math.random() * 0.4 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01
      });
    }

    const drawLeafParticle = (x, y, size, angle, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size / 1.5, 0, 0, size);
      ctx.quadraticCurveTo(-size / 1.5, 0, 0, -size);
      ctx.fillStyle = `rgba(118, 201, 69, ${opacity * 0.65})`;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        drawLeafParticle(p.x, p.y, p.size * 2, p.rotation, p.opacity);
      });

      frameId = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        render();
      }
    };

    const stopLoop = () => {
      if (isRunning) {
        cancelAnimationFrame(frameId);
        isRunning = false;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    return () => {
      stopLoop();
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [currentIndex]);

  // Swiping support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 60) handleNext();
    if (diff < -60) handlePrev();
  };

  // Download simulation
  const handlePdfDownload = () => {
    alert(lang === 'en' ? `Downloading ${activeProduct.name.en} Product Catalogue PDF...` : `ڈاؤن لوڈ بروشر پی ڈی ایف...`);
  };

  const getWhatsAppMsgUrl = () => {
    const phone = "923011837160";
    const pName = activeProduct.name[lang] || activeProduct.name.en;
    const catLabel = t.categories[activeProduct.category] || activeProduct.category;
    const sizeName = activeSize.size;
    const priceStr = `PKR ${displayedPrice}`;
    const skuCode = activeSize.sku || activeProduct.productCode;

    const message = `Assalam-o-Alaikum Vital Agro Team,
I want to purchase the following product.
Product Name: ${pName}
Category: ${catLabel}
Selected Pack Size: ${sizeName}
Price: ${priceStr}
Product Code: ${skuCode}
Quantity: 1
Please guide me regarding availability.
Thank You.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Helper arrays for rendering Left and Right cards peaking
  const prevIdx = (currentIndex - 1 + featuredProducts.length) % featuredProducts.length;
  const nextIdx = (currentIndex + 1) % featuredProducts.length;

  const leftCardProduct = featuredProducts[prevIdx];
  const rightCardProduct = featuredProducts[nextIdx];

  const labels = {
    en: {
      organic: 'Imported Formula',
      research: 'Research Based',
      crops: 'Suitable Crops',
      benefits: 'Key Benefits',
      features: 'Features',
      app: 'Application Method',
      sizes: 'Available Pack Sizes',
      sku: 'Product SKU',
      buyNow: 'Buy Now',
      cart: 'Add to Cart',
      whatsapp: 'WhatsApp Order',
      pdf: 'Download PDF',
      inStock: 'In Stock',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock'
    },
    ur: {
      organic: 'درآمد شدہ فارمولا',
      research: 'تحقیق شدہ فارمولا',
      crops: 'موزوں فصلیں',
      benefits: 'بنیادی فوائد',
      features: 'خصوصیات',
      app: 'طریقہ استعمال',
      sizes: 'دستیاب پیکنگ سائز',
      sku: 'پروڈکٹ کوڈ',
      buyNow: 'ابھی خریدیں',
      cart: 'کارٹ میں ڈالیں',
      whatsapp: 'واٹس ایپ آرڈر',
      pdf: 'بروشر ڈاؤن لوڈ',
      inStock: 'اسٹاک دستیاب ہے',
      lowStock: 'اسٹاک محدود ہے',
      outOfStock: 'ختم ہو گیا'
    }
  };

  const l = labels[lang] || labels.en;

  if (!activeProduct) return null;

  return (
    <section 
      className="relative py-24 bg-[#020502]/90 overflow-hidden select-none border-b border-white/5"
      onTouchStart={(e) => {
        setIsPlaying(false);
        handleTouchStart(e);
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={(e) => {
        setIsPlaying(true);
        handleTouchEnd(e);
      }}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Immersive Jungle Background Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'linear-gradient(to bottom, rgba(2, 5, 2, 0.88) 0%, rgba(2, 5, 2, 0.78) 50%, rgba(2, 5, 2, 0.92) 100%), url("/jungle_bg.webp")',
            backgroundAttachment: 'fixed',
            filter: 'brightness(0.55) contrast(1.15) saturate(1.05)',
          }}
        />
      </div>

      {/* Dynamic Mesh Aurora Glow blobs changing based on Category */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div 
          className="absolute w-[500px] h-[500px] -top-30 -left-30 rounded-full filter blur-[120px] opacity-75 transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${activeGlowColors.from} 0%, transparent 70%)` }}
        />
        <div 
          className="absolute w-[450px] h-[450px] bottom-10 right-10 rounded-full filter blur-[100px] opacity-70 transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${activeGlowColors.to} 0%, transparent 70%)` }}
        />
      </div>

      {/* Grid Pattern Mesh */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-[1]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-[#76C945]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            {t.showcase.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
            {lang === 'en' ? 'Our Flagship Solutions' : 'وائٹل کی فلیگ شپ پروڈکٹس'}
          </h2>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            {lang === 'en' 
              ? 'Explore our world-class crop protection and biotechnology formulations, designed for maximum efficiency and yield.' 
              : 'جدید ترین ریسرچ اور بائیوٹیکنالوجی فارمولیشنز کی تفصیلات دریافت کریں۔'}
          </p>
        </div>

        {/* Master Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Panel: Rich Dynamic Product Specifications */}
          <div ref={leftPanelRef} className="lg:col-span-5 flex flex-col justify-center space-y-6">
            
            {/* Category & Badge */}
            <div className="space-y-2.5 animate-gsap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#76C945]/15 text-[#8AD65A] border border-[#76C945]/20 uppercase tracking-widest">
                {t.categories[activeProduct.category] || activeProduct.category}
              </span>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight mt-2">
                {activeProduct.name[lang] || activeProduct.name.en}
              </h3>
              <p className="text-[#C5A059] font-black text-xs sm:text-sm tracking-wider uppercase">
                {activeProduct.genericName[lang] || activeProduct.genericName.en}
              </p>
            </div>

            {/* Tagline / Short Description */}
            <p className="text-white/70 text-sm sm:text-base leading-relaxed border-l-2 border-[#76C945] pl-3 animate-gsap">
              {activeProduct.shortDesc ? (activeProduct.shortDesc[lang] || activeProduct.shortDesc.en) : (activeProduct.description[lang]?.split('.')[0] + '.')}
            </p>

            {/* Suitable crops */}
            <div className="space-y-2 animate-gsap">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-wider block">{l.crops}</span>
              <div className="flex flex-wrap gap-2">
                {activeProduct.crops?.slice(0, 4).map((crop, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-xs text-white/80 font-bold">
                    <span>{crop.icon}</span>
                    <span>{crop.name[lang]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Benefits row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-white/5 py-4 animate-gsap">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-[#8AD65A] uppercase tracking-wider block">{l.benefits}</span>
                <ul className="space-y-1">
                  {activeProduct.benefits[lang]?.slice(0, 2).map((b, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-1.5 leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-[#76C945] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-[#8AD65A] uppercase tracking-wider block">{l.features}</span>
                <ul className="space-y-1">
                  {activeProduct.features[lang]?.slice(0, 2).map((f, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-1.5 leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Size Selector */}
            {activeProduct.sizes && activeProduct.sizes.length > 0 && (
              <div className="space-y-2 animate-gsap">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-wider block">{l.sizes}</span>
                <div className="flex flex-wrap gap-2">
                  {activeProduct.sizes.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSize(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all duration-300 ${
                        idx === activeSizeIdx
                          ? 'bg-[#76C945]/20 text-[#8AD65A] border-[#76C945]'
                          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Prices & SKU Block */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-gsap">
              <div>
                <div className="flex items-baseline gap-2">
                  {/* Rolling Price Counter Display */}
                  <span ref={rollingPriceRef} className="text-2xl sm:text-3xl font-black text-white font-mono">
                    PKR {displayedPrice}
                  </span>
                  {displayedOldPrice && displayedOldPrice > displayedPrice && (
                    <>
                      <span className="line-through text-white/40 text-sm sm:text-base font-mono">
                        PKR {displayedOldPrice}
                      </span>
                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-black rounded">
                        Save {Math.round((1 - activeSize.price / activeSize.oldPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
                <div className="flex gap-3 text-[10px] text-white/40 mt-1 font-bold">
                  <span>SKU: <span className="text-white/60 font-semibold">{activeSize.sku}</span></span>
                  <span className="flex items-center gap-1">
                    <span className={`w-1 h-1 rounded-full ${activeSize.stockStatus === 'In Stock' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    <span className={activeSize.stockStatus === 'In Stock' ? 'text-emerald-400' : 'text-amber-400'}>
                      {activeSize.stockStatus === 'In Stock' ? l.inStock : activeSize.stockStatus === 'Low Stock' ? l.lowStock : l.outOfStock}
                    </span>
                  </span>
                </div>
              </div>

              {/* Specs Badge */}
              {activeProduct.formulation && (
                <div className="text-right">
                  <span className="text-xs text-white/60 block">{activeProduct.formulation}</span>
                  <span className="text-[10px] text-white/40 block mt-0.5 truncate max-w-[120px]">{activeProduct.activeIngredient}</span>
                </div>
              )}
            </div>

            {/* Magnetic Interaction Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 animate-gsap">
              <button
                onMouseMove={handleMagneticHover}
                onMouseLeave={handleMagneticLeave}
                onClick={triggerBuyNow}
                className="w-full py-3.5 bg-[#76C945] hover:bg-[#8AD65A] text-[#0A2E1F] rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#76C945]/15"
              >
                <span>{l.buyNow}</span>
              </button>

              <button
                onMouseMove={handleMagneticHover}
                onMouseLeave={handleMagneticLeave}
                onClick={triggerAddToCart}
                className="w-full py-3.5 bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-[#76C945]" />
                <span>{l.cart}</span>
              </button>

              <a
                onMouseMove={handleMagneticHover}
                onMouseLeave={handleMagneticLeave}
                href={getWhatsAppMsgUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                <span>{l.whatsapp}</span>
              </a>

              <button
                onMouseMove={handleMagneticHover}
                onMouseLeave={handleMagneticLeave}
                onClick={handlePdfDownload}
                className="w-full py-3.5 bg-white/[0.02] border border-white/5 backdrop-blur-md hover:bg-white/[0.05] text-white/80 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-4.5 h-4.5 text-white/50" />
                <span>{l.pdf}</span>
              </button>
            </div>

          </div>

          {/* Right Panel: Cinematic Awwwards 3-Card Carousel Arena */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center h-[380px] sm:h-[480px] lg:h-[500px] xl:h-[550px] relative overflow-hidden">
            
            {/* Canvas Particle Overlay (leaves/dust) */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

            <div 
              ref={cardsContainerRef}
              className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl h-full flex items-center justify-center"
            >
              {/* Left card peak (peaking from left boundary) */}
              {leftCardProduct && (
                <div 
                  onClick={handlePrev}
                  className="absolute left-[-12%] sm:left-[-8%] lg:left-[-10%] xl:left-[-12%] z-10 w-[160px] sm:w-[180px] lg:w-[200px] xl:w-[220px] h-[260px] sm:h-[300px] lg:h-[320px] xl:h-[360px] rounded-2xl border border-white/5 p-4 flex flex-col justify-between items-center opacity-30 filter blur-[3px] scale-80 cursor-pointer hover:opacity-50 transition-all duration-500 hidden sm:flex"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                  }}
                >
                  <img 
                    src={leftCardProduct.pngUrl} 
                    alt={leftCardProduct.name.en} 
                    className="max-h-24 sm:max-h-32 lg:max-h-36 w-auto object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)]"
                  />
                  <span className="text-[10px] font-black text-white/30 truncate block max-w-full">
                    {leftCardProduct.name[lang]?.split(' ')[0]}
                  </span>
                </div>
              )}

              {/* Active Center Hero Card (Pinterest glass card showcase style) */}
              <ProductGlassCard 
                activeProduct={activeProduct}
                lang={lang}
                displayedPrice={displayedPrice}
                setActiveDetailsProduct={setActiveDetailsProduct}
              />

              {/* Right card peak (peaking from right boundary) */}
              {rightCardProduct && (
                <div 
                  onClick={handleNext}
                  className="absolute right-[-12%] sm:right-[-8%] lg:right-[-10%] xl:right-[-12%] z-10 w-[160px] sm:w-[180px] lg:w-[200px] xl:w-[220px] h-[260px] sm:h-[300px] lg:h-[320px] xl:h-[360px] rounded-2xl border border-white/5 backdrop-blur-md p-4 flex flex-col justify-between items-center opacity-30 filter blur-[3px] scale-80 cursor-pointer hover:opacity-50 transition-all duration-500 hidden sm:flex"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                  }}
                >
                  <img 
                    src={rightCardProduct.pngUrl} 
                    alt={rightCardProduct.name.en} 
                    className="max-h-24 sm:max-h-32 lg:max-h-36 w-auto object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)]"
                  />
                  <span className="text-[10px] font-black text-white/30 truncate block max-w-full">
                    {rightCardProduct.name[lang]?.split(' ')[0]}
                  </span>
                </div>
              )}

            </div>

            {/* Slider navigation Indicators underneath */}
            <div className="flex items-center gap-3 mt-4 z-20">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:text-[#76C945] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-1.5">
                {featuredProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-6 bg-[#76C945]' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:text-[#76C945] transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

// Isolated Glass Card Component to prevent mouse-move state from re-rendering the heavy showcase parent
function ProductGlassCard({ activeProduct, lang, displayedPrice, setActiveDetailsProduct }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const tiltX = -(y / (rect.height / 2)) * 12; // Max 12deg
    const tiltY = (x / (rect.width / 2)) * 12;  // Max 12deg

    setTilt({ x: tiltX, y: tiltY });
    setParallax({ x: x * 0.15, y: y * 0.15 });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setParallax({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative z-20 w-[230px] xs:w-[250px] sm:w-[280px] lg:w-[300px] xl:w-[340px] h-[320px] xs:h-[350px] sm:h-[400px] lg:h-[420px] xl:h-[460px] flex items-center justify-center"
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
    >
      {/* Glowing Refraction Glass platform at bottom */}
      <div className="absolute bottom-[-10px] w-[80%] h-6 bg-white/5 border border-white/10 rounded-full filter blur-[2px] backdrop-blur-md z-0 scale-x-110 shadow-[0_15px_30px_rgba(118,201,69,0.25)]" />

      {/* Glassmorphic card frame */}
      <motion.div
        onClick={() => setActiveDetailsProduct(activeProduct)}
        style={{
          transformStyle: 'preserve-3d',
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)'
        }}
        className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col justify-between items-center shadow-[0_35px_80px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05)] overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-300"
      >
        {/* Sheen sheen reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none skew-y-12 translate-y-[-50%]" />

        {/* Top card info */}
        <div className="w-full flex justify-between items-center text-[10px] font-black text-white/30 tracking-widest uppercase z-10">
          <span>VITAL SHOWROOM</span>
          <span className="text-[#76C945]">{activeProduct.formulation}</span>
        </div>

        {/* Main Product PNG floating outside boundaries */}
        <div 
          className="relative flex items-center justify-center w-full h-3/5 z-20"
          style={{
            transform: `translate3d(${parallax.x}px, ${parallax.y}px, 60px)`,
            transition: 'transform 0.2s ease-out'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeProduct.slug}
              src={activeProduct.pngUrl}
              alt={activeProduct.name.en}
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1.05, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-h-[200px] xs:max-h-[220px] sm:max-h-[260px] lg:max-h-[280px] xl:max-h-[300px] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.65)] hover:scale-110 transition-transform duration-500"
            />
          </AnimatePresence>
        </div>

        {/* Bottom details inside glass */}
        <div className="w-full flex justify-between items-center z-10">
          <span className="text-[10px] font-bold text-white/40 tracking-wider">
            {activeProduct.activeIngredient}
          </span>
          <span className="text-[10px] font-black text-[#76C945] font-mono">
            PKR {displayedPrice}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
