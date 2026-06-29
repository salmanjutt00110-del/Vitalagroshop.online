import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import BlurUpImage from '@/components/ui/BlurUpImage';

const getCategoryLabel = (category) => {
  switch (category) {
    case 'insecticide': return 'INSECTICIDE';
    case 'herbicide': return 'HERBICIDE';
    case 'fungicide': return 'FUNGICIDE';
    case 'plant_nutrition':
    case 'plant-nutrition': return 'PLANT NUTRITION';
    case 'seed-treatment': return 'SEED TREATMENT';
    default: return 'SPECIAL PRODUCT';
  }
};

export default function PremiumProductCard({ product }) {
  const { lang } = useLanguage();
  const { addToCart, setIsCartOpen } = useCart();
  const [expanded, setExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeObj, setSelectedSizeObj] = useState(() => {
    return product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
  });

  const prodNameEn = product.name?.en || product.name || '';
  const prodNameUr = product.name?.ur || '';

  const currentPrice = selectedSizeObj ? Math.round(selectedSizeObj.price) : 0;

  const handleBuyNow = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (selectedSizeObj) {
      addToCart(product, selectedSizeObj, quantity);
      setIsCartOpen(true);
    }
  }, [product, selectedSizeObj, quantity, addToCart, setIsCartOpen]);

  const toggleExpand = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setExpanded(prev => !prev);
  }, []);

  return (
    <motion.div
      layout
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={toggleExpand}
      className="w-full relative group overflow-hidden flex flex-col h-full rounded-[28px] border border-white/[0.08] hover:border-emerald-500/25 transition-colors duration-500 cursor-pointer"
      style={{
        background: 'linear-gradient(165deg, rgba(16, 185, 129, 0.04) 0%, rgba(5, 9, 6, 0.85) 30%, rgba(5, 9, 6, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Ambient glow on hover */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/[0.06] rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Glare sweep on hover */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden rounded-[28px]">
        <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.6s] ease-out" />
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Category & Premium Tag */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#4ade80] bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg backdrop-blur-sm truncate max-w-[55%]">
            {getCategoryLabel(product.category)}
          </span>
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#4ade80] bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg backdrop-blur-sm truncate max-w-[45%]">
            {lang === 'en' ? 'PREMIUM QUALITY' : 'پریمیم کوالٹی'}
          </span>
        </div>

        {/* Product Image — Floating Bottle */}
        <div className="relative aspect-[4/3] w-full flex items-center justify-center mb-5 rounded-2xl overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(16,185,129,0.08)_0%,transparent_65%)] group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
          
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex items-center justify-center h-32 sm:h-36 w-full"
          >
            <BlurUpImage
              src={product.pngUrl || product.imageUrl}
              alt={prodNameEn}
              className="max-h-full w-auto object-contain select-none pointer-events-none"
              style={{
                filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(16,185,129,0.15))'
              }}
            />
          </motion.div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[55%] h-2.5 bg-emerald-500/15 rounded-full blur-[5px] pointer-events-none group-hover:bg-emerald-500/25 transition-colors duration-500 animate-pulse" />
        </div>

        {/* Product Name */}
        <div className="space-y-1 mb-3 relative z-10 text-left">
          {prodNameUr && (
            <h3 
              className="text-emerald-400 font-extrabold text-base leading-snug"
              style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}
              dir="rtl"
            >
              {prodNameUr}
            </h3>
          )}
          <h4 className="text-white font-black text-sm leading-tight group-hover:text-emerald-300 transition-colors duration-300 line-clamp-1">
            {prodNameEn}
          </h4>
        </div>

        {/* Generic Chemical Formulation Badge */}
        <div className="flex justify-start mb-4">
          <span className="text-[9px] font-mono font-bold text-emerald-300/80 bg-emerald-950/30 border border-emerald-500/15 px-2.5 py-1 rounded-lg tracking-wider inline-block truncate max-w-full">
            {product.activeIngredient || 'BIOTECH FORMULATION'}
          </span>
        </div>

        {/* Dynamic State Section */}
        <div className="mt-auto pt-2">
          <AnimatePresence mode="wait">
            {!expanded ? (
              <motion.button
                key="collapsed-btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onClick={toggleExpand}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-emerald-500/30 hover:border-emerald-400/60 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-[0.98]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                {lang === 'en' ? 'VIEW PRICING & BUY' : 'قیمت دیکھیں اور خریدیں'}
              </motion.button>
            ) : (
              <motion.div
                key="expanded-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Short Description */}
                <p className="text-white/50 text-[11px] leading-relaxed text-left line-clamp-2">
                  {product.shortDesc?.[lang] || product.description?.[lang] || (lang === 'en' ? 'Premium agrochemical formulation for target control.' : 'بہترین زرعی فارمولیشن فار ٹارگٹ کنٹرول۔')}
                </p>

                {/* Sizing selection chips */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-1 text-left relative z-10">
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.map((sz, idx) => {
                        const szName = typeof sz === 'object' ? sz.size : sz;
                        const isActive = selectedSizeObj?.size === szName;
                        return (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSizeObj(sz);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all duration-300 cursor-pointer ${
                              isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/5'
                                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            {szName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price & Quantity Row */}
                <div className="flex items-center justify-between">
                  {/* Price */}
                  <span className="text-[#22d3ee] font-black text-lg sm:text-xl font-mono">
                    {currentPrice === 0 ? 'On Request' : `Rs ${currentPrice.toLocaleString()}`}
                  </span>

                  {/* Quantity Adjustment */}
                  <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-xl border border-white/10 px-1.5 py-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white text-sm flex items-center justify-center transition-all font-bold cursor-pointer active:scale-90"
                    >−</button>
                    <span className="text-white text-xs font-black w-5 text-center font-mono">{quantity}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuantity(q => q + 1); }}
                      className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 text-sm flex items-center justify-center transition-all font-bold cursor-pointer active:scale-90"
                    >+</button>
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-1.5 h-11 bg-gradient-to-r from-emerald-500 to-[#76C945] hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)] text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Buy Now' : 'خریدیں'}
                  </button>
                  <Link
                    to={`/products/${product.slug || product.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-1 h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-xl text-[10px] font-bold text-white transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
                  >
                    {lang === 'en' ? 'Details' : 'تفصیلات'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Collapse Link */}
                <button
                  onClick={toggleExpand}
                  className="w-full text-center text-[10px] font-bold text-white/40 hover:text-emerald-400 transition-colors uppercase tracking-wider pt-1 flex items-center justify-center gap-1 cursor-pointer"
                >
                  ▲ {lang === 'en' ? 'HIDE' : 'چھپائیں'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
