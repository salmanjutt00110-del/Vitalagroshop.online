import React, { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import FloatingProduct from './FloatingProduct';
import { useLanguage } from '@/lib/LanguageContext';
import { getProductImage } from '@/data/productsData';

const CURRENCY = 'PKR'; // Configurable global currency symbol

export default function SwipeCard3D({ product, isActive, isPeek, isDragging, openCheckout, onActivate, isMobile }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const imageSrc = getProductImage(product);
  const prodNameEn = typeof product?.name === 'object' ? (product?.name?.en || product?.name) : product?.name;
  const prodNameUr = typeof product?.name === 'object' ? product?.name?.ur : '';
  const desc = product.shortDesc?.[lang] || product.shortDesc?.en || product.tagline || "";

  // Local size selection state inside card
  const sizes = product?.sizes || [];
  const [selectedSize, setSelectedSize] = useState(
    sizes.length > 0 ? (typeof sizes[0] === 'object' ? sizes[0]?.size : sizes[0]) : ''
  );

  // 3D Parallax Tilt Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 140, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !isActive) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalized coordinates between -0.5 and 0.5
    const normX = (e.clientX - rect.left) / width - 0.5;
    const normY = (e.clientY - rect.top) / height - 0.5;
    
    mouseX.set(normX);
    mouseY.set(normY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  // Compute pricing details dynamically based on selectedSize
  const { price, originalPrice } = useMemo(() => {
    if (sizes.length === 0) {
      return {
        price: product?.price || 999,
        originalPrice: product?.originalPrice || null
      };
    }
    const match = sizes.find(
      s => (typeof s === 'object' ? s?.size : s) === selectedSize
    );
    if (match && typeof match === 'object') {
      return {
        price: match?.price,
        originalPrice: match?.oldPrice || null
      };
    }
    const first = sizes[0];
    return {
      price: typeof first === 'object' ? first?.price : product?.price || 999,
      originalPrice: typeof first === 'object' ? first?.oldPrice : product?.originalPrice || null
    };
  }, [selectedSize, sizes, product]);

  const handleCardClick = (e) => {
    if (isDragging) return;
    if (!isActive) {
      if (onActivate) onActivate();
      return;
    }
    if (e?.target?.closest('button') || e?.target?.closest('a')) {
      return;
    }
    navigate(`/products/${product?.slug}`);
  };

  return (
    <div style={{ perspective: '1200px' }} className="w-full h-full">
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleCardClick}
        className={`
          swipe-card-3d relative
          w-full rounded-[32px] overflow-hidden
          flex flex-col items-center
          px-6 pt-8 pb-6
          premium-glass-card
          touch-pan-y
        `}
        style={{
          minHeight: '520px',
          transformStyle: 'preserve-3d',
          rotateX: isActive && !isMobile ? rotateX : 0,
          rotateY: isActive && !isMobile ? rotateY : 0,
          borderColor: isActive 
            ? `${product.theme || '#10b981'}45` 
            : isHovered 
              ? 'rgba(255, 255, 255, 0.25)' 
              : 'rgba(255, 255, 255, 0.12)',
          boxShadow: isActive
            ? `0 0 35px ${product.theme || '#10b981'}25, inset 0 0 15px ${product.theme || '#10b981'}15`
            : isHovered
              ? '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(16, 185, 129, 0.15)'
              : '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Premium Rotating Gradient Border for Active Card */}
        {isActive && !isMobile && (
          <span className="absolute inset-0 rounded-[32px] pointer-events-none p-[1.5px] overflow-hidden z-0">
            <motion.div
              className="absolute inset-[-60%] rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent 35%, ${product.theme || '#10b981'} 50%, transparent 65%)`,
                filter: 'blur(3px)',
              }}
              animate={typeof window !== 'undefined' && window.innerWidth < 768 ? {} : { rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-[1.5px] bg-[#0c120e]/85 backdrop-blur-2xl rounded-[30.5px] -z-10" />
          </span>
        )}

        {/* Top left: Category badge */}
        <div className="absolute top-5 left-5 z-10">
          <span 
            className="px-3 py-1 rounded-full text-[9px] font-black tracking-[0.15em] uppercase border"
            style={{
              backgroundColor: `${product.theme || '#10b981'}15`,
              borderColor: `${product.theme || '#10b981'}30`,
              color: product.theme || '#10b981',
            }}
          >
            {product.category}
          </span>
        </div>

        {/* 3D Floating Product Image */}
        <div 
          className="relative aspect-[4/3] w-full flex items-center justify-center p-4 bg-white/70 rounded-2xl border border-emerald-900/5 mt-10 mb-6 overflow-hidden shadow-inner"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,transparent_60%)] pointer-events-none" />
          
          <div
            className="relative z-10 flex items-center justify-center"
            style={{
              transform: isHovered ? 'translateZ(45px)' : 'translateZ(0px)',
              transformStyle: 'preserve-3d',
            }}
          >
            <FloatingProduct
              src={imageSrc}
              alt={prodNameEn}
              isActive={isActive}
            />
          </div>

          {/* Mirror reflection below bottle */}
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[55%] h-12 pointer-events-none opacity-15 group-hover:opacity-25 transition-opacity duration-500"
            style={{
              transform: 'rotateX(180deg) translateY(-8px) scaleY(0.6)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 70%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 70%)',
              filter: 'blur(1.5px)'
            }}
          >
            <img src={imageSrc} alt="" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full max-w-md px-4 mx-auto text-center z-10 flex flex-col gap-4">
          {/* 1. Urdu Name */}
          {prodNameUr && (
            <h3 className="text-emerald-400 font-extrabold text-xl sm:text-2xl leading-normal text-center min-h-[1.75rem]" style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }} dir="rtl">
              {prodNameUr}
            </h3>
          )}

          {/* 2. English Name */}
          <h4 className="text-emerald-950 font-bold text-sm sm:text-base leading-tight group-hover:text-emerald-300 transition-colors text-center line-clamp-1">
            {prodNameEn}
          </h4>

          {/* 3. Active Ingredient Badge */}
          <div className="flex justify-center">
            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-emerald-300/80 bg-emerald-950/50 border border-emerald-500/15 px-2.5 py-1 rounded-lg tracking-wider inline-block truncate max-w-full text-center">
              {product.activeIngredient || product.formula || product.formulation || 'BIOTECH FORMULA'}
            </span>
          </div>

          {/* 4. Short Description */}
          <p className="text-xs text-neutral-500 leading-relaxed text-center line-clamp-2 h-[34px] overflow-hidden px-2">
            {desc}
          </p>

          {/* Size Variant Selector inside Card */}
          {sizes.length > 0 && (
            <div className={`flex gap-1.5 justify-center mt-1 flex-wrap z-20 ${!isActive ? 'pointer-events-none' : ''}`}>
              {sizes.map((sz) => {
                const name = typeof sz === 'object' ? sz.size : sz;
                return (
                  <button
                    key={name}
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid card trigger navigation
                      setSelectedSize(name);
                    }}
                    className={`
                      px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all duration-300
                      ${selectedSize === name
                        ? 'bg-[#5cb85c]/20 border-[#5cb85c] text-emerald-600 scale-105 shadow-[0_0_8px_rgba(92,184,92,0.15)]'
                        : 'bg-white/60 border-emerald-900/10 text-neutral-500 hover:text-emerald-950 hover:border-emerald-900/20'
                      }
                    `}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Price Display */}
          <div className="flex items-center justify-center gap-3 mt-2 h-8 font-mono border-t border-emerald-900/5 pt-4">
            <span 
              className="font-black text-xl text-emerald-400"
            >
              {price === 0 ? (lang === 'en' ? 'On Request' : 'درخواست پر') : `${CURRENCY} ${price?.toLocaleString()}`}
            </span>
            {originalPrice && originalPrice > price && price !== 0 && (
              <span className="text-neutral-400 text-xs line-through transition-opacity duration-300">
                {CURRENCY} {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`w-full flex flex-col gap-2.5 mt-auto z-10 ${!isActive ? 'pointer-events-none' : ''}`}>
          {/* BUY NOW COD — opens checkout */}
          <motion.button
            onClick={() => openCheckout && openCheckout({ ...product, defaultSize: selectedSize })}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-emerald-950 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${product.theme || '#10b981'}bb, ${product.theme || '#10b981'}dd)`,
              boxShadow: `0 0 28px ${product.theme || '#10b981'}45`,
            }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              animate={typeof window !== 'undefined' && window.innerWidth < 768 ? {} : { x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>🛒</span> {lang === 'en' ? 'BUY NOW (COD)' : 'ابھی خریدیں (COD)'}
            </span>
          </motion.button>

          {/* View Details */}
          <Link
            to={`/products/${product.slug}`}
            className="w-full py-3 rounded-2xl text-center text-xs font-black uppercase tracking-wider text-neutral-500 border transition-all duration-300"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${product.theme || '#10b981'}40`;
              e.currentTarget.style.color = product.theme || '#10b981';
              e.currentTarget.style.backgroundColor = `${product.theme || '#10b981'}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {lang === 'en' ? 'View Details →' : 'تفصیلات دیکھیں ←'}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
