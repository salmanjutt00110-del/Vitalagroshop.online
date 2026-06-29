import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PremiumButton from '@/components/ui/PremiumButton';
import { getProductImage } from '@/data/productsData';

/**
 * PremiumCard – a glass‑morphic 3D product card.
 * Props:
 *   - product: product object from PRODUCTS_DATA
 *   - mousePosition: {x, y} values (‑0.5..0.5) for tilt effect
 *   - lang: current language code for text
 */
export default function PremiumCard({ product, mousePosition = { x: 0, y: 0 }, lang }) {
  const navigate = useNavigate();
  const firstSize = product.sizes?.[0];
  const price = firstSize ? (firstSize.price === 0 ? 0 : Math.round(firstSize.price)) : Math.round(product.price || Number(product.pricing?.[0]?.rate) || 999);
  const oldPrice = firstSize?.oldPrice && price !== 0 ? Math.round(firstSize.oldPrice) : null;

  const nameEn = typeof product.name === 'object' ? product.name.en : product.name;
  const nameUr = typeof product.name === 'object' ? product.name.ur : '';
  const desc = product.shortDesc?.[lang] || product.shortDesc?.en || product.tagline || "";

  const tiltStyle = {
    transform: `rotateX(${ -mousePosition.y * 15 }deg) rotateY(${ mousePosition.x * 15 }deg)`,
    perspective: '1000px'
  };

  const handleCardClick = (e) => {
    // If clicking a button or its children, do not trigger card navigation
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/products/${product.slug}`);
  };

  return (
    <motion.div
      className="premium-glass-card premium-card-3d-reflection p-6 rounded-2xl cursor-pointer"
      style={tiltStyle}
      onClick={handleCardClick}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Bottle Showcase Frame */}
      <div className="relative aspect-[4/3] w-full flex items-center justify-center p-4 bg-white/[0.02] rounded-2xl border border-white/5 mb-6 overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_60%)] pointer-events-none" />
        
        {/* Floating Product with 3D animation */}
        <motion.div
          animate={{
            y: [0, -6, 0],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="relative z-10 flex items-center justify-center"
        >
          <img
            src={getProductImage(product)}
            alt={nameEn}
            className="max-h-[140px] w-auto object-contain transition-transform duration-500"
            style={{
              filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.55)) drop-shadow(0 0 10px rgba(16,185,129,0.15))'
            }}
            loading="lazy"
          />
        </motion.div>

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
          <img src={getProductImage(product)} alt="" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 flex flex-col gap-4 text-center">
        {/* 1. Urdu Name */}
        {nameUr && (
          <h3 className="text-emerald-400 font-extrabold text-xl sm:text-2xl leading-normal text-center min-h-[1.75rem]" style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }} dir="rtl">
            {nameUr}
          </h3>
        )}

        {/* 2. English Name */}
        <h4 className="text-white font-bold text-sm sm:text-base leading-tight group-hover:text-emerald-300 transition-colors duration-300 text-center line-clamp-1">
          {nameEn}
        </h4>

        {/* 3. Active Ingredient Badge */}
        <div className="flex justify-center">
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-emerald-300/80 bg-emerald-950/50 border border-emerald-500/15 px-2.5 py-1 rounded-lg tracking-wider inline-block truncate max-w-full text-center">
            {product.activeIngredient || 'BIOTECH FORMULA'}
          </span>
        </div>

        {/* 4. Short Description */}
        <p className="text-xs text-white/50 leading-relaxed text-center line-clamp-2 h-[34px] overflow-hidden px-2">
          {desc}
        </p>

        {/* 5. Price */}
        <div className="flex items-baseline justify-center gap-2 pt-3 border-t border-white/5 font-mono">
          {price === 0 ? (
            <span className="text-lg font-black text-[#8AD65A]">{lang === 'en' ? 'On Request' : 'درخواست پر'}</span>
          ) : (
            <span className="text-lg font-black text-[#8AD65A]">PKR {price.toLocaleString()}</span>
          )}
          {oldPrice && oldPrice > price && (
            <span className="text-xs text-white/35 line-through font-mono">PKR {oldPrice.toLocaleString()}</span>
          )}
        </div>

        <div className="flex justify-center gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
          <PremiumButton
            variant="primary"
            onClick={() => {
              // Hook into cart context if needed – placeholder for quick add
            }}
            className="px-5 py-2 text-sm font-bold"
          >
            Quick Checkout
          </PremiumButton>
          <PremiumButton
            variant="secondary"
            href={`/products/${product.slug}`}
            className="px-5 py-2 text-sm font-bold"
          >
            Product Profile
          </PremiumButton>
        </div>
      </div>
    </motion.div>
  );
}
