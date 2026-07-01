import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { PRODUCTS_DATA, getProductImage } from '@/data/productsData';
import { useApp } from '@/contexts/AppContext';
import { ShoppingCart, Info, ArrowRight, Search } from 'lucide-react';
import BlurUpImage from '@/components/ui/BlurUpImage';

// Pick 3 flagship products that have real images
const FEATURED_SLUGS = ['fatty', 'super-4g', 'aaqab'];

export default function FeaturedProducts() {
  const { lang, t } = useLanguage();
  const { setActiveDetailsProduct, setIsGlobalSearchOpen } = useApp();
  const navigate = useNavigate();

  const products = FEATURED_SLUGS
    .map(slug => PRODUCTS_DATA[slug])
    .filter(Boolean)
    .map(p => ({
      ...p,
      name_en: typeof p.name === 'object' ? p.name.en : p.name,
      name_ur: typeof p.name === 'object' ? p.name.ur : '',
      image: getProductImage(p),
      price: p.sizes?.[0]?.price || p.price || 0,
    }));

  if (products.length === 0) return null;

  const openCheckout = (product) => {
    const sizeName = product.sizes?.[0]?.size || product.packaging || '100ML';
    navigate(`/checkout?product=${product.slug || product.id}&size=${encodeURIComponent(sizeName)}&qty=1`);
  };

  return (
    <section className="relative w-full py-14 sm:py-20 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.04] blur-[100px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[300px] h-[300px] rounded-full bg-amber-500/[0.03] blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-[10px] font-black tracking-[0.25em] text-emerald-400 uppercase mb-2 block">
            {lang === 'en' ? '★ FLAGSHIP PRODUCTS' : '★ فلیگ شپ مصنوعات'}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-950 tracking-tight">
            {lang === 'en' ? 'Our Top Products' : 'ہماری بہترین مصنوعات'}
          </h2>
        </motion.div>

        {/* Home Screen Search Trigger */}
        <div className="max-w-md mx-auto mb-10 select-none px-4 relative z-20">
          <motion.div
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => setIsGlobalSearchOpen(true)}
            className="relative flex items-center group cursor-pointer bg-white/70 backdrop-blur-xl border border-[#0E7A43]/15 hover:border-[#0E7A43]/35 rounded-2xl py-3 px-4 shadow-sm transition-all duration-300"
          >
            <div className="flex items-center gap-3 text-[#0a331c]/60 flex-1">
              <Search className="w-5 h-5 text-[#0E7A43]" />
              <span className="text-xs sm:text-sm font-medium placeholder-emerald-900/40 select-none">
                {lang === 'en' ? 'Search for products... (Ctrl+K)' : 'مصنوعات تلاش کریں...'}
              </span>
            </div>
            <div className="px-4 py-1.5 bg-[#0E7A43] hover:bg-[#18C964] text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center cursor-pointer shadow-sm">
              <Search className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </div>

        {/* Products Grid — 3 columns on mobile too */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group cursor-pointer"
              onClick={() => setActiveDetailsProduct(product)}
            >
              <div
                className="rounded-[16px] sm:rounded-[24px] overflow-hidden border border-[#102415]/10 relative flex flex-col h-full premium-glass-card hover:-translate-y-1.5 transition-all duration-300 hover:border-emerald-500/25 hover:shadow-[0_12px_24px_rgba(14,122,67,0.06)]"
              >
                {/* Glare sweep */}
                <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden rounded-[24px]">
                  <div style={{ transitionDuration: '1.4s' }} className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full group-hover:translate-x-full transition-transform ease-out" />
                </div>



                {/* Product Image */}
                <div className="relative aspect-square w-full flex items-center justify-center p-3 sm:p-6 overflow-hidden">
                  <div className="absolute w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-emerald-500/10 blur-[25px] group-hover:bg-emerald-400/20 transition-all duration-700 pointer-events-none" />
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="relative z-10 w-full h-full flex items-center justify-center"
                  >
                    <BlurUpImage
                      src={product.image}
                      alt={product.name_en}
                      className="max-h-full max-w-full object-contain"
                      style={{
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(16,185,129,0.2))',
                      }}
                    />
                  </motion.div>
                </div>

                {/* Info */}
                <div className="px-2.5 sm:px-5 pb-3 sm:pb-5 flex flex-col flex-1 bg-transparent">
                  <h3 className="text-[10px] sm:text-sm lg:text-base font-black text-[#0a331c] text-center line-clamp-1 group-hover:text-[#0E7A43] transition-colors">
                    {product.name_en}
                  </h3>
                  {product.name_ur && (lang === 'ur' || lang === 'pb') && (
                    <p className="text-[9px] sm:text-xs text-[#0E7A43] text-center font-bold mt-0.5" dir="rtl" style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}>
                      {product.name_ur}
                    </p>
                  )}

                  <div className="flex items-center justify-center mt-1.5 sm:mt-3">
                    <span className="text-[#0E7A43] font-black text-xs sm:text-lg font-mono">
                      {product.price === 0 ? (lang === 'en' ? 'On Request' : 'قیمت طلب کریں') : `₨${product.price.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Actions — hidden on very small mobile, shown on sm+ */}
                  <div className="hidden sm:flex gap-2 mt-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); openCheckout(product); }}
                      className="flex-1 btn-premium-primary text-[9px] sm:text-[10px] tracking-wider gap-1"
                    >
                      <ShoppingCart size={11} /> Buy
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveDetailsProduct(product); }}
                      className="flex-1 btn-premium-secondary text-[9px] sm:text-[10px] tracking-wider gap-1"
                    >
                      <Info size={11} /> Details
                    </button>
                  </div>

                  {/* Mobile: single details button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveDetailsProduct(product); }}
                    className="sm:hidden mt-2 w-full py-1.5 rounded-lg text-[8px] font-black text-[#39D98A] border border-[#39D98A]/30 bg-[#39D98A]/10 hover:bg-[#39D98A]/20 tracking-wider uppercase cursor-pointer active:scale-95 transition-all"
                  >
                    Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Products CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mt-8"
        >
          <button
            onClick={() => navigate('/products')}
            className="btn-premium-primary text-xs tracking-wider gap-2 px-8 cursor-pointer"
          >
            {lang === 'en' ? 'View All Products' : 'تمام مصنوعات دیکھیں'}
            <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
