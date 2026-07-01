import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useSpring, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { Search, ShoppingCart, Info, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { PRODUCTS_DATA, getProductImage, PENDING_IMAGES } from '@/data/productsData';
import SEOHead from '@/lib/seo/SEOHead';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useMobile } from '@/hooks/useMobile';
import { useApp } from '@/contexts/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import BlurUpImage from '@/components/ui/BlurUpImage';
import PremiumSearchBar from '@/components/ui/PremiumSearchBar';
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

const normalizeCategory = (c) => {
  if (!c) return '';
  let clean = c.toLowerCase().trim().replace(/_/g, '-').replace(/\s+/g, '-');
  // Normalize plural to singular
  if (clean === 'herbicides') return 'herbicide';
  if (clean === 'insecticides') return 'insecticide';
  if (clean === 'fungicides') return 'fungicide';
  if (clean === 'seed-treatments') return 'seed-treatment';
  if (clean === 'plant-nutrients' || clean === 'plant-nutritions') return 'plant-nutrition';
  if (clean === 'micronutrient') return 'micronutrients';
  if (clean === 'plant-growths') return 'plant-growth';
  if (clean === 'special-products' || clean === 'specials') return 'special-product';
  return clean;
};

// Category label mappings
const getCategoryLabel = (category) => {
  const norm = normalizeCategory(category);
  switch (norm) {
    case 'insecticide': return 'INSECTICIDE';
    case 'herbicide': return 'HERBICIDE';
    case 'fungicide': return 'FUNGICIDE';
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

const HighlightText = React.memo(({ text, search }) => {
  if (!search || !text) return <span>{text}</span>;
  const searchTrimmed = search.trim();
  if (!searchTrimmed) return <span>{text}</span>;
  
  try {
    const regex = new RegExp(`(${searchTrimmed.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-emerald-500/20 text-[#0E7A43] font-bold px-0.5 rounded border-b border-emerald-500/30">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  } catch (e) {
    return <span>{text}</span>;
  }
});

const AnimatedPrice = React.memo(({ price, oldPrice, lang }) => {
  const [displayPrice, setDisplayPrice] = useState(price);
  
  useEffect(() => {
    let start = displayPrice;
    const end = price;
    if (start === end) return;
    
    const duration = 350; // ms
    const startTime = performance.now();
    
    let animationFrame;
    const updatePrice = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress);
      const current = Math.round(start + (end - start) * ease);
      setDisplayPrice(current);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updatePrice);
      } else {
        setDisplayPrice(end);
      }
    };
    
    animationFrame = requestAnimationFrame(updatePrice);
    return () => cancelAnimationFrame(animationFrame);
  }, [price]);

  if (price === 0) {
    return <span className="text-[10px] sm:text-xs font-black text-[#0E7A43] font-mono leading-none">{lang === 'en' ? 'On Request' : 'قیمت طلب کریں'}</span>;
  }
  
  return (
    <div className="flex flex-col">
      <span className="text-[10px] sm:text-xs font-black text-[#0E7A43] font-mono leading-none">
        Rs. {displayPrice.toLocaleString()}
      </span>
      {oldPrice && oldPrice > price && (
        <span className="text-neutral-400 line-through text-[9px] font-mono mt-0.5">
          Rs. {oldPrice.toLocaleString()}
        </span>
      )}
    </div>
  );
});

// Mockup-matched row layout card
const ProductGridCard = React.memo(({ product, openCheckout, lang, index = 0, searchQuery = '' }) => {
  const navigate = useNavigate();
  const { isMobile } = useMobile();
  const { setActiveDetailsProduct } = useApp();
  const [qty, setQty] = useState(1);
  const [activeSizeIdx, setActiveSizeIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const activeSize = product?.sizes?.[activeSizeIdx] || {};
  const activePrice = typeof activeSize === 'object' ? (activeSize?.price || product?.price || 0) : (product?.price || 0);
  const activeSizeName = typeof activeSize === 'object' ? activeSize?.size : (product?.packaging || '100ML');
  const oldPrice = typeof activeSize === 'object' ? (activeSize?.oldPrice || product?.originalPrice) : null;

  const desc = product.shortDesc?.[lang] || product.shortDesc?.en || product.tagline || "";
  const nameEn = product.name_en || (typeof product.name === 'object' ? product.name.en : product.name);
  const nameUr = product.name_ur || (typeof product.name === 'object' ? product.name.ur : '');

  // Alternate badges based on index
  const badges = ["BEST SELLER", "POPULAR", "TRENDING"];
  const badgeText = product.status?.en || badges[index % badges.length];

  // Helper to match category with label & icon
  const getCategoryDetails = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'insecticide':
        return { label: lang === 'en' ? 'Pesticide' : 'کیڑے مار دوا', icon: '🛡️' };
      case 'herbicide':
        return { label: lang === 'en' ? 'Herbicide' : 'جڑی بوٹی مار', icon: '🌿' };
      case 'fungicide':
        return { label: lang === 'en' ? 'Fungicide' : 'پھپھوند کش', icon: '🛡️' };
      case 'seed-treatment':
        return { label: lang === 'en' ? 'Seed Treatment' : 'بیج کا علاج', icon: '🌱' };
      case 'plant-nutrition':
      case 'plant_nutrition':
        return { label: lang === 'en' ? 'Plant Growth Regulator' : 'پودوں کی نشوونما', icon: '🔋' };
      default:
        return { label: lang === 'en' ? 'Bio Stimulant' : 'بائیوٹیک فارمولا', icon: '🧪' };
    }
  };

  const catDetails = getCategoryDetails(product.category);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/products/${product.slug || product.id}`)}
      className="group relative rounded-[24px] overflow-hidden flex flex-row bg-white border border-[#0E7A43]/10 hover:border-[#0E7A43]/20 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 items-stretch gap-4 cursor-pointer"
    >
      {/* Glare sweep */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[24px]">
        <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </div>

      {/* LEFT COLUMN: Image container */}
      <div className="w-[35%] shrink-0 rounded-2xl bg-[#EAFBF3] border border-[#0E7A43]/5 flex items-center justify-center p-3 relative aspect-square overflow-hidden select-none">
        {/* Floating badge */}
        <span className="absolute top-2 left-2 z-10 text-[7px] font-black uppercase tracking-wider bg-[#0E7A43]/8 text-[#0E7A43] px-1.5 py-0.5 rounded-md">
          {badgeText}
        </span>
        
        {/* Levitating product image */}
        <motion.div
          animate={{
            y: isHovered ? [0, -5, 0] : [0, -2.5, 0],
            rotate: isHovered ? [0, 1.2, -1.2, 0] : [0, 0.6, -0.6, 0]
          }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          className="w-full h-full flex items-center justify-center"
        >
          <BlurUpImage
            src={product.image}
            alt={nameEn}
            className="max-h-[90%] max-w-[90%] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)] group-hover:scale-103 transition-transform duration-500"
          />
        </motion.div>
      </div>

      {/* RIGHT COLUMN: Info & actions */}
      <div className="flex-1 flex flex-col justify-between py-1 text-left select-none">
        <div>
          {/* Category/Type with icon */}
          <div className="flex items-center gap-1 text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            <span>{catDetails.icon}</span>
            <span>{catDetails.label}</span>
          </div>

          {/* Product Names */}
          {nameUr && (
            <h3 
              className="text-[#0E7A43] font-extrabold text-sm leading-tight line-clamp-1 font-urdu"
              style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}
              dir="rtl"
            >
              <HighlightText text={nameUr} search={searchQuery} />
            </h3>
          )}
          <h4 className="text-[#0a331c] font-black text-xs sm:text-sm leading-tight group-hover:text-[#0E7A43] transition-colors duration-300 line-clamp-1">
            <HighlightText text={nameEn} search={searchQuery} />
          </h4>

          {/* Chemical/Formula name */}
          <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-wider block mt-0.5 truncate">
            <HighlightText text={product.genericName?.en || product.activeIngredient || 'BIOTECH FORMULA'} search={searchQuery} />
          </span>

          {/* Short description */}
          <p className="text-neutral-500 text-[9px] sm:text-xs leading-relaxed line-clamp-2 mt-1.5 font-medium">
            <HighlightText text={desc} search={searchQuery} />
          </p>
        </div>

        {/* Pricing, Quantity, and Actions */}
        <div className="space-y-2 mt-2">
          {/* Packaging chips */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar select-none">
            {product.sizes?.map((sz, idx) => {
              const sizeName = typeof sz === 'object' ? sz.size : sz;
              const isSelected = idx === activeSizeIdx;
              return (
                <button
                  key={sizeName}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveSizeIdx(idx); }}
                  className={`px-2 py-0.5 rounded-lg text-[8px] font-bold border transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#0E7A43] text-white border-[#0E7A43]'
                      : 'bg-[#EAFBF3] border-[#0E7A43]/10 text-neutral-500 hover:text-[#0a331c]'
                  }`}
                >
                  {sizeName}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-neutral-100 pt-2 gap-2 flex-wrap sm:flex-nowrap">
            {/* Price */}
            <AnimatedPrice price={activePrice} oldPrice={oldPrice} lang={lang} />

            {/* Action buttons */}
            <div className="flex gap-1.5 items-center shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/products/${product.slug || product.id}`);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-[#0E7A43]/20 hover:border-[#0E7A43]/40 text-[#0E7A43] text-[9px] font-extrabold uppercase tracking-wide cursor-pointer active:scale-95 transition-all bg-white hover:bg-neutral-50"
              >
                View Details
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openCheckout({ ...product, defaultQty: qty, defaultSize: activeSizeName });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#0E7A43] hover:bg-[#18C964] text-white text-[9px] font-extrabold uppercase tracking-wide cursor-pointer active:scale-95 transition-all shadow-sm shadow-[#0E7A43]/10"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
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
        rawCategory: p.category,
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
    const currentParams = {};
    if (newCat !== 'all') {
      currentParams.category = newCat;
    }
    if (debouncedSearch) {
      currentParams.search = debouncedSearch;
    }
    setSearchParams(currentParams);
  };
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const [productsList, setProductsList] = useState([]);
  const [heroActiveIdx, setHeroActiveIdx] = useState(0);
  const [heroQuantity, setHeroQuantity] = useState(1);
  const [heroActiveSizeIdx, setHeroActiveSizeIdx] = useState(0);
  const navigate = useNavigate();

  // Debouncing effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Synchronize URL search params with debounced search query
  useEffect(() => {
    const currentParams = {};
    if (category && category !== 'all') {
      currentParams.category = category;
    }
    if (debouncedSearch) {
      currentParams.search = debouncedSearch;
    }
    setSearchParams(currentParams);
  }, [debouncedSearch, category, setSearchParams]);

  // Sync search input if URL changes directly
  useEffect(() => {
    const q = searchParams.get('search') || '';
    if (q !== searchQuery) {
      setSearchQuery(q);
      setDebouncedSearch(q);
    }
  }, [searchParams]);

  const handleSearchExpand = useCallback(() => {
    setIsSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 150);
  }, []);

  const handleSearchCollapse = useCallback(() => {
    if (!searchQuery) {
      setIsSearchExpanded(false);
    }
  }, [searchQuery]);



  useEffect(() => {
    const loadProducts = () => {
      const allProducts = Object.values(translatedProducts);
      const validProducts = allProducts.filter(p => {
        // Validation Checks:
        // 1. ID exists
        if (!p.id) return false;
        // 2. Exclude products in PENDING_IMAGES
        if (PENDING_IMAGES.includes(p.slug || p.id)) return false;
        // 3. Product Name exists
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
      const categoryLabel = getCategoryLabel(p?.rawCategory || p?.category);

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
        rawCategory: p?.rawCategory || p?.category,
        sizes: p?.sizes || [{ size: p?.packaging || '100ML', price: p?.price || 0, oldPrice: p?.oldPrice || null }],
      };
    });
  }, [productsList, lang]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return mappedProducts.filter(p => 
      p.name_en?.toLowerCase().includes(q) || 
      p.name_ur?.includes(q) ||
      p.formula?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [mappedProducts, searchQuery]);

  // Rotate Hero slide every 3 seconds
  useEffect(() => {
    if (mappedProducts.length === 0) return;
    const interval = setInterval(() => {
      setHeroActiveIdx(prev => (prev + 1) % mappedProducts.length);
      setHeroQuantity(1); // Reset quantity for new product
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

  // Voice Search setup
  const [isListening, setIsListening] = useState(false);
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please use Chrome/Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsSearchExpanded(true);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Rotating placeholder system
  const placeholders = useMemo(() => [
    lang === 'en' ? "Search for 'Fatty'..." : "تلاش کریں 'Fatty'...",
    lang === 'en' ? "Search for 'AAQAAB'..." : "تلاش کریں 'AAQAAB'...",
    lang === 'en' ? "Search by target crops (Cotton, Rice)..." : "فصل کے لحاظ سے تلاش کریں...",
    lang === 'en' ? "Search for active ingredient..." : "دوا کا نام یا فارمولا درج کریں..."
  ], [lang]);

  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const CATEGORY_LABELS = {
    all: lang === 'en' ? 'All Products' : 'تمام مصنوعات',
    'seed-treatment': lang === 'en' ? 'Seed Treatment' : 'بیج کا علاج',
    herbicide: lang === 'en' ? 'Herbicides' : 'جڑی بوٹی مار',
    fungicide: lang === 'en' ? 'Fungicides' : 'پھپھوند کاش',
    insecticide: lang === 'en' ? 'Insecticides' : 'کیڑے مار',
    micronutrients: lang === 'en' ? 'Micronutrients' : 'غذائی اجزاء',
    'plant-growth': lang === 'en' ? 'Plant Growth' : 'نشوونما',
    'special-product': lang === 'en' ? 'Special Products' : 'خصوصی مصنوعات'
  };

  // Real-time double-language search filtering with granular sub-categories
  const filtered = useMemo(() => {
    return mappedProducts.filter(p => {
      let matchCat = true;
      if (!debouncedSearch && category !== 'all') {
        const cat = normalizeCategory(p?.rawCategory || p?.category);
        const targetCat = normalizeCategory(category);
        
        if (targetCat === 'micronutrients') {
          const isNutr = cat === 'plant-nutrition' || cat === 'micronutrients';
          const hasNutrKeyword = p.name_en?.toLowerCase()?.includes('zinc') || 
                                 p.name_en?.toLowerCase()?.includes('boron') ||
                                 p.formula?.toLowerCase()?.includes('zinc') ||
                                 p.formula?.toLowerCase()?.includes('boron') ||
                                 p.name_en?.toLowerCase()?.includes('map') ||
                                 p.name_en?.toLowerCase()?.includes('sop');
          matchCat = isNutr && hasNutrKeyword;
        } else if (targetCat === 'plant-growth') {
          const isNutr = cat === 'plant-nutrition' || cat === 'plant-growth';
          const hasGrowthKeyword = p.name_en?.toLowerCase()?.includes('grow') || 
                                   p.name_en?.toLowerCase()?.includes('potash') ||
                                   p.name_en?.toLowerCase()?.includes('humate') ||
                                   p.name_en?.toLowerCase()?.includes('fatty') ||
                                   p.name_en?.toLowerCase()?.includes('conference') ||
                                   p.name_en?.toLowerCase()?.includes('output') ||
                                   p.name_en?.toLowerCase()?.includes('dr.pp');
          matchCat = isNutr && hasGrowthKeyword;
        } else if (targetCat === 'special-product') {
          matchCat = cat === 'special-product' || cat === 'special' || cat === 'special_products' || 
                     (!['seed-treatment', 'fungicide', 'herbicide', 'insecticide', 'plant-nutrition'].includes(cat));
        } else {
          matchCat = cat === targetCat;
        }
      }
      
      if (!debouncedSearch) return matchCat;

      const searchLower = debouncedSearch.toLowerCase().trim();
      
      // Cross-referencing raw database/catalog properties to make search cross-language
      const rawProduct = PRODUCTS_DATA[p.id] || p;
      const rawNameEn = typeof rawProduct.name === 'object' ? (rawProduct.name.en || '') : (rawProduct.name || '');
      const rawNameUr = typeof rawProduct.name === 'object' ? (rawProduct.name.ur || '') : '';
      
      const nameMatch = p?.name_en?.toLowerCase()?.includes(searchLower) || 
                        p?.name_ur?.includes(searchLower) || 
                        p?.name?.toLowerCase()?.includes(searchLower) ||
                        rawNameEn.toLowerCase().includes(searchLower) ||
                        rawNameUr.includes(searchLower);
      
      const activeMatch = p?.activeIngredient?.toLowerCase()?.includes(searchLower) || 
                          p?.formula?.toLowerCase()?.includes(searchLower) ||
                          (typeof rawProduct.genericName === 'object' && (
                            rawProduct.genericName.en?.toLowerCase()?.includes(searchLower) ||
                            rawProduct.genericName.ur?.includes(searchLower)
                          ));
      
      const categoryMatch = p?.category?.toLowerCase()?.includes(searchLower) || 
                            p?.categoryLabel?.toLowerCase()?.includes(searchLower) ||
                            rawProduct.category?.toLowerCase()?.includes(searchLower);
      
      // Safety and fallback checks for crops list
      const rawCrops = Array.isArray(rawProduct.crops) ? rawProduct.crops : (Array.isArray(p?.crops) ? p.crops : []);
      const cropsMatch = rawCrops.some(c => {
        if (!c) return false;
        const cropEn = typeof c === 'object' ? (c.name && typeof c.name === 'object' ? c.name.en : c.name) : c;
        const cropUr = typeof c === 'object' ? (c.name && typeof c.name === 'object' ? c.name.ur : '') : '';
        return String(cropEn).toLowerCase().includes(searchLower) || String(cropUr).includes(searchLower);
      });
      
      // Cross-referencing descriptions, target pests, features, benefits across translations
      const rawDescEn = typeof rawProduct.description === 'object' ? (rawProduct.description.en || '') : '';
      const rawDescUr = typeof rawProduct.description === 'object' ? (rawProduct.description.ur || '') : '';
      
      const diseasesMatch = p?.diseases?.toLowerCase()?.includes(searchLower) || 
                            p?.usage?.toLowerCase()?.includes(searchLower) ||
                            p?.description?.en?.toLowerCase()?.includes(searchLower) ||
                            p?.description?.ur?.toLowerCase()?.includes(searchLower) ||
                            p?.shortDesc?.en?.toLowerCase()?.includes(searchLower) ||
                            p?.shortDesc?.ur?.toLowerCase()?.includes(searchLower) ||
                            rawDescEn.toLowerCase().includes(searchLower) ||
                            rawDescUr.includes(searchLower);

      return matchCat && (nameMatch || activeMatch || categoryMatch || cropsMatch || diseasesMatch);
    });
  }, [mappedProducts, category, debouncedSearch]);

  // Group filtered products dynamically by main chemical category
  const groupedProducts = useMemo(() => {
    return {
      'seed-treatment': filtered.filter(p => {
        const cat = normalizeCategory(p.rawCategory || p.category);
        return cat === 'seed-treatment';
      }),
      'fungicide': filtered.filter(p => {
        const cat = normalizeCategory(p.rawCategory || p.category);
        return cat === 'fungicide';
      }),
      'herbicide': filtered.filter(p => {
        const cat = normalizeCategory(p.rawCategory || p.category);
        return cat === 'herbicide';
      }),
      'insecticide': filtered.filter(p => {
        const cat = normalizeCategory(p.rawCategory || p.category);
        return cat === 'insecticide';
      }),
      'plant-nutrition': filtered.filter(p => {
        const cat = normalizeCategory(p.rawCategory || p.category);
        return cat === 'plant-nutrition';
      }),
    };
  }, [filtered]);

  const categoryCounts = useMemo(() => {
    const counts = {
      all: mappedProducts.length,
      'seed-treatment': 0,
      herbicide: 0,
      fungicide: 0,
      insecticide: 0,
      micronutrients: 0,
      'plant-growth': 0,
      'special-product': 0
    };
    mappedProducts.forEach(p => {
      const cat = normalizeCategory(p.rawCategory || p.category);
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
      
      // Micronutrients count
      const isNutr = cat === 'plant-nutrition' || cat === 'micronutrients';
      const hasNutrKeyword = p.name_en?.toLowerCase()?.includes('zinc') || 
                             p.name_en?.toLowerCase()?.includes('boron') ||
                             p.formula?.toLowerCase()?.includes('zinc') ||
                             p.formula?.toLowerCase()?.includes('boron') ||
                             p.name_en?.toLowerCase()?.includes('map') ||
                             p.name_en?.toLowerCase()?.includes('sop');
      if (isNutr && hasNutrKeyword) {
        counts['micronutrients']++;
      }
      
      // Plant Growth count
      const hasGrowthKeyword = p.name_en?.toLowerCase()?.includes('grow') || 
                               p.name_en?.toLowerCase()?.includes('potash') ||
                               p.name_en?.toLowerCase()?.includes('humate') ||
                               p.name_en?.toLowerCase()?.includes('fatty') ||
                               p.name_en?.toLowerCase()?.includes('conference') ||
                               p.name_en?.toLowerCase()?.includes('output') ||
                               p.name_en?.toLowerCase()?.includes('dr.pp');
      if (isNutr && hasGrowthKeyword) {
        counts['plant-growth']++;
      }
      
      // Special Products count
      const isSpecial = cat === 'special-product' || cat === 'special' || cat === 'special_products' || 
                        (!['seed-treatment', 'fungicide', 'herbicide', 'insecticide', 'plant-nutrition'].includes(cat));
      if (isSpecial) {
        counts['special-product']++;
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
          0%, 100% { filter: drop-shadow(0 0 15px rgba(15, 123, 59, 0.35)) drop-shadow(0 0 25px rgba(15, 123, 59, 0.1)); }
          50% { filter: drop-shadow(0 0 25px rgba(15, 123, 59, 0.65)) drop-shadow(0 0 45px rgba(15, 123, 59, 0.3)); }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
        }
        .volumetric-rays {
          background: linear-gradient(135deg, rgba(15, 123, 59, 0.22) 0%, transparent 60%);
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
              className="absolute w-1 h-1 rounded-full bg-[#0E7A43]/40 blur-[0.5px]"
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
                  <span className="px-3 py-1 bg-[#39D98A]/10 border border-[#39D98A]/30 text-[#39D98A] text-[10px] tracking-[0.2em] font-black uppercase rounded-md shadow-[0_0_8px_rgba(57,217,138,0.15)]">
                    ✦ {getCategoryLabel(activeHeroProduct.category)}
                  </span>
                  {activeHeroProduct.activeIngredient && (
                    <span className="px-3 py-1 bg-[#ffffff]/5 border border-[#ffffff]/10 text-[#A0B3A6] text-[10px] tracking-wide font-bold rounded-md">
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
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white flex flex-wrap gap-x-4 items-center">
                      <span>{activeHeroProduct.name}</span>
                      {activeHeroProduct.name_ur && (lang === 'ur' || lang === 'pb') && (
                        <span className="text-[#39D98A] text-2xl sm:text-4xl font-extrabold" style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }} dir="rtl">
                          {activeHeroProduct.name_ur}
                        </span>
                      )}
                    </h1>

                    <div className="inline-block text-[10px] sm:text-xs font-mono font-bold text-[#39D98A] bg-[#39D98A]/10 border border-[#39D98A]/20 px-3 py-1 rounded-full">
                      INGREDIENTS: {activeHeroProduct.formula || 'Biotech Active Synthesis'}
                    </div>

                    <p className="text-[#A0B3A6] text-xs sm:text-base max-w-2xl leading-relaxed">
                      {activeHeroProduct.description?.[lang] || activeHeroProduct.description?.en || activeHeroProduct.shortDesc?.[lang] || activeHeroProduct.shortDesc?.en}
                    </p>

                    {/* Recommended Crops list */}
                    {activeHeroProduct.crops && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <span className="text-[10px] text-[#A0B3A6] block font-black uppercase tracking-wider">Recommended Crops:</span>
                        <div className="flex flex-wrap gap-2">
                          {activeHeroProduct.crops.slice(0, 5).map((cr, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#ffffff]/5 border border-[#ffffff]/10 text-[10px] sm:text-xs font-bold text-white flex items-center gap-1">
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
                <div className="bg-[#0A1810]/80 border border-[#ffffff]/10 backdrop-blur-xl rounded-[24px] p-5 sm:p-6 space-y-4 sm:space-y-6">
                  
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Sizes Selection */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-[#A0B3A6] block font-black uppercase tracking-wider">Pack Sizes:</span>
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
                                  ? 'bg-[#39D98A]/20 text-[#39D98A] border-[#39D98A]/60 shadow-[0_0_12px_rgba(57,217,138,0.2)]'
                                  : 'bg-[#ffffff]/5 border-[#ffffff]/10 text-white/60 hover:bg-[#ffffff]/10 hover:text-white'
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
                      <span className="text-[10px] text-[#A0B3A6] block font-black uppercase tracking-wider">Quantity:</span>
                      <div className="flex items-center gap-2 bg-[#ffffff]/5 rounded-xl border border-[#ffffff]/10 p-1 h-[34px] sm:h-[38px]">
                        <button
                          onClick={() => setHeroQuantity(q => Math.max(1, q - 1))}
                          className="w-6 h-6 rounded-lg bg-[#ffffff]/10 hover:bg-[#ffffff]/20 flex items-center justify-center font-bold text-white text-xs transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-black text-white font-mono">{heroQuantity}</span>
                        <button
                          onClick={() => setHeroQuantity(q => q + 1)}
                          className="w-6 h-6 rounded-lg bg-[#39D98A]/20 hover:bg-[#39D98A]/30 flex items-center justify-center font-bold text-[#39D98A] text-xs transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#ffffff]/10 pt-4">
                    
                    {/* Price with Orange/Red Discount Badge */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-[#39D98A] font-mono">
                            {heroActivePrice === 0 ? 'On Request' : `PKR ${heroActivePrice.toLocaleString()}`}
                          </span>
                          {heroActivePrice > 0 && heroOldPrice && heroOldPrice > heroActivePrice && (
                            <span className="text-white/40 line-through text-xs sm:text-sm font-mono">
                              PKR {heroOldPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Large floating glass discount badge */}
                      {heroActivePrice > 0 && heroOldPrice && heroOldPrice > heroActivePrice && (
                        <div 
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white text-xs font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(239,68,68,0.45)] border border-red-400/20 select-none z-10 shrink-0"
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
                <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[#0E7A43]/15 sm:bg-[#0E7A43]/20 rounded-full blur-[80px] pointer-events-none z-0" />

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
                  <div className="absolute inset-x-0 bottom-[-6px] h-[10px] rounded-full bg-[#0E7A43]/50 blur-[6px] shadow-[0_0_25px_rgba(15, 123, 59,0.85)]" />
                  {/* Podium Cylinder Wall */}
                  <div className="absolute inset-x-0 top-[6px] sm:top-[8px] bottom-0 bg-gradient-to-b from-[#0a200a] to-[#010401] border-x border-b border-[#0E7A43]/30 rounded-b-full shadow-[0_6px_20px_rgba(0,0,0,0.8)]" />
                  {/* Podium Lid Disk */}
                  <div className="absolute inset-x-0 top-0 h-[10px] sm:h-[15px] rounded-full bg-gradient-to-b from-[#0e240a] to-[#020602] border border-[#0E7A43]/40 shadow-[inset_0_0_15px_rgba(15, 123, 59,0.65)]" />
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
                          : 'drop-shadow(0 15px 25px rgba(0,0,0,0.85)) drop-shadow(0 0 15px rgba(15, 123, 59,0.45))'
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Manual Navigation Controls for Hero */}
                <button
                  onClick={() => setHeroActiveIdx(prev => (prev - 1 + mappedProducts.length) % mappedProducts.length)}
                  className="absolute left-1 w-9 h-9 rounded-full bg-emerald-950/5 border border-emerald-900/10 flex items-center justify-center text-[#0a331c] hover:bg-[#0E7A43]/20 hover:border-[#0E7A43]/40 transition-colors z-20 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setHeroActiveIdx(prev => (prev + 1) % mappedProducts.length)}
                  className="absolute right-1 w-9 h-9 rounded-full bg-emerald-950/5 border border-emerald-900/10 flex items-center justify-center text-[#0a331c] hover:bg-[#0E7A43]/20 hover:border-[#0E7A43]/40 transition-colors z-20 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>

              </div>

            </div>
          </div>
        ) : null}

      </section>

      {/* PRODUCT CATALOG PORTION */}
      <section className="relative z-10 w-full bg-[#EAFBF3] border-t border-[#0E7A43]/10 py-16 -mt-1 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Categories & Search Navigation Bar */}
          <div 
            className="flex flex-col items-center gap-6 border border-[#0E7A43]/8 rounded-[28px] p-6 shadow-sm relative overflow-hidden bg-white/70 backdrop-blur-xl"
          >
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#0E7A43]/[0.02] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[#0E7A43]/[0.02] rounded-full blur-[100px] pointer-events-none" />
            
            {/* Premium Glass Search Bar with Voice Input */}
            <PremiumSearchBar
              mode="inline"
              isExpandable={true}
              initialValue={searchQuery}
              onSearchChange={(val) => {
                setSearchQuery(val);
                setDebouncedSearch(val);
              }}
            />
    
            {/* Category Tabs */}
            <div className="w-full overflow-x-auto no-scrollbar relative z-10">
              <div className="flex gap-2 min-w-max md:justify-center px-2 py-0.5">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                  const isActive = category === key;
                  const count = categoryCounts[key] || 0;
                  return (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-[#0E7A43] border-[#0E7A43] text-white shadow-sm shadow-[#0E7A43]/20'
                          : 'bg-white border-[#0E7A43]/10 text-[#5A5A5A] hover:bg-[#EAFBF3] hover:border-[#0E7A43]/20 hover:text-[#0a331c]'
                      }`}
                    >
                      {label}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
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
          <div className="relative z-10 pb-20">
            {!catalogLoaded ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(8)].map((_, idx) => (
                  <ProductGridCardSkeleton key={`skeleton-${idx}`} />
                ))}
              </div>
            ) : category === 'all' && !debouncedSearch ? (
              <div className="space-y-16">
                {Object.entries(groupedProducts).map(([key, prods]) => {
                  if (prods.length === 0) return null;
                  return (
                    <div key={key} className="space-y-6">
                      {/* Section Title */}
                      <div className="border-b border-neutral-100 pb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-[#0E7A43] rounded-full" />
                        <h2 className="text-lg font-black text-[#0a331c] uppercase tracking-wider">
                          {SECTION_DETAILS[key]?.title?.[lang] || getCategoryLabel(key)}
                        </h2>
                        <span className="text-[10px] font-mono text-[#5A5A5A] bg-neutral-100 px-2 py-0.5 rounded-full">
                          {prods.length} Products
                        </span>
                      </div>

                      {/* Products Grid: Desktop 2 or 3, Tablet 2, Mobile 1 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {prods.map((product, idx) => (
                          <ProductGridCard
                            key={product.id}
                            product={product}
                            openCheckout={openCheckout}
                            lang={lang}
                            index={idx}
                            searchQuery={debouncedSearch}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-b border-neutral-100 pb-4">
                  <h2 className="text-lg font-black text-[#0a331c] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-[#0E7A43] rounded-full" />
                    {debouncedSearch 
                      ? (lang === 'en' ? `Search Results for "${debouncedSearch}"` : `تلاش کے نتائج برائے "${debouncedSearch}"`)
                      : CATEGORY_LABELS[category]}
                    <span className="text-[10px] font-mono text-[#5A5A5A] bg-neutral-100 px-2 py-0.5 rounded-full font-bold">
                      {filtered.length} {lang === 'en' ? 'Products' : 'مصنوعات'}
                    </span>
                  </h2>
                </div>
                
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((product, idx) => (
                      <ProductGridCard
                        key={product.id}
                        product={product}
                        openCheckout={openCheckout}
                        lang={lang}
                        index={idx}
                        searchQuery={debouncedSearch}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white border border-[#0E7A43]/10 rounded-2xl p-8 max-w-xl mx-auto shadow-sm flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-[#0E7A43]/10 flex items-center justify-center text-[#0E7A43]">
                      <Search className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-black text-[#0a331c]">
                        {lang === 'en' ? 'No Products Found' : 'کوئی مصنوعات نہیں ملیں'}
                      </h3>
                      <p className="text-[#5A5A5A] text-xs leading-relaxed max-w-md font-medium">
                        {lang === 'en' 
                          ? "We couldn't find any premium agrotechnology products matching your query. Check the spelling or choose another category filter." 
                          : "ہمیں آپ کی تلاش کے مطابق کوئی مصنوعات نہیں ملیں۔ براہ کرم ہجے چیک کریں یا دوسری کیٹیگری منتخب کریں۔"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCategory('all');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#0E7A43] text-white text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      {lang === 'en' ? 'Clear Search & Filters' : 'تلاش صاف کریں'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

