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
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={toggleExpand}
      className="w-full relative group overflow-hidden flex flex-col h-full rounded-[24px] premium-glass-card cursor-pointer"
    >
      {/* Glare sweep on hover - optimized */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden rounded-[24px]">
        <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Category & Premium Tag */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#0F7B3B] bg-[#0F7B3B]/10 border border-[#0F7B3B]/15 rounded-lg truncate max-w-[55%]">
            {getCategoryLabel(product.category)}
          </span>
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#0F7B3B] bg-[#0F7B3B]/10 border border-[#0F7B3B]/15 rounded-lg truncate max-w-[45%]">
            {lang === 'en' ? 'PREMIUM QUALITY' : 'پریمیم کوالٹی'}
          </span>
        </div>

        {/* Product Image — Floating Bottle */}
        <div className="relative aspect-[4/3] w-full flex items-center justify-center mb-5 rounded-2xl overflow-hidden bg-[#F4F6F4] border border-black/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(15,123,59,0.08)_0%,transparent_65%)] group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
          
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex items-center justify-center h-32 sm:h-36 w-full"
          >
            <BlurUpImage
              src={product.pngUrl || product.imageUrl}
              alt={prodNameEn}
              className="max-h-full w-auto object-contain select-none pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
            />
          </motion.div>
        </div>

        {/* Product Name */}
        <div className="space-y-1 mb-3 relative z-10 text-left">
          {prodNameUr && (
            <h3 
              className="text-[#0F7B3B] font-extrabold text-base leading-snug"
              style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}
              dir="rtl"
            >
              {prodNameUr}
            </h3>
          )}
          <h4 className="text-[#0A1810] font-black text-sm leading-tight group-hover:text-[#0F7B3B] transition-colors duration-300 line-clamp-1">
            {prodNameEn}
          </h4>
        </div>

        {/* Generic Chemical Formulation Badge */}
        <div className="flex justify-start mb-4">
          <span className="text-[9px] font-mono font-bold text-[#4B5E53] bg-[#E8EFEA] border border-[#D1E0D6] px-2.5 py-1 rounded-lg tracking-wider inline-block truncate max-w-full">
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
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-[#0F7B3B]/20 hover:border-[#0F7B3B]/40 bg-[#0F7B3B]/5 hover:bg-[#0F7B3B]/10 text-[#0F7B3B] text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-[0.98]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#39D98A] animate-pulse shadow-[0_0_8px_rgba(57,217,138,0.8)]" />
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
                <p className="text-[#4B5E53] text-[11px] leading-relaxed text-left line-clamp-2">
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
                                ? 'bg-[#0F7B3B]/10 text-[#0F7B3B] border border-[#0F7B3B]/40 shadow-[0_0_12px_rgba(15,123,59,0.15)]'
                                : 'bg-white text-[#4B5E53] border border-black/10 hover:border-[#0F7B3B]/30 hover:text-[#0A1810] shadow-sm'
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
                  <span className="text-[#0A1810] font-black text-lg sm:text-xl font-mono">
                    {currentPrice === 0 ? 'On Request' : `Rs ${currentPrice.toLocaleString()}`}
                  </span>

                  {/* Quantity Adjustment */}
                  <div className="flex items-center gap-1.5 bg-[#F8FAF8] rounded-xl border border-black/10 px-1.5 py-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 text-[#0A1810] text-sm flex items-center justify-center transition-all font-bold cursor-pointer active:scale-90 border border-black/5 shadow-sm"
                    >−</button>
                    <span className="text-[#0A1810] text-xs font-black w-5 text-center font-mono">{quantity}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuantity(q => q + 1); }}
                      className="w-7 h-7 rounded-lg bg-[#0F7B3B]/10 hover:bg-[#0F7B3B]/20 text-[#0F7B3B] text-sm flex items-center justify-center transition-all font-bold cursor-pointer active:scale-90 border border-[#0F7B3B]/10"
                    >+</button>
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-1.5 h-11 bg-gradient-to-r from-[#39D98A] to-[#1FAF5A] hover:shadow-[0_4px_15px_rgba(57,217,138,0.3)] text-[#061509] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Buy Now' : 'خریدیں'}
                  </button>
                  <Link
                    to={`/products/${product.slug || product.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-1.5 h-11 bg-white border border-[#0F7B3B]/20 hover:bg-[#0F7B3B]/5 hover:border-[#0F7B3B]/40 text-[#0F7B3B] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    {lang === 'en' ? 'Details' : 'تفصیلات'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Collapse Link */}
                <button
                  onClick={toggleExpand}
                  className="w-full text-center text-[10px] font-bold text-[#A0B3A6] hover:text-white transition-colors uppercase tracking-wider pt-1 flex items-center justify-center gap-1 cursor-pointer"
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
