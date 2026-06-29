import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Eye, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { PRODUCTS_DATA } from '@/data/productsData';
import { useCart } from '@/lib/CartContext';
import { useApp } from '@/contexts/AppContext';

export default function PremiumProductRange() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { setActiveDetailsProduct } = useApp();
  const sectionRef = useRef(null);
  const [displayProducts, setDisplayProducts] = useState([]);

  // Hydration listener for real database data from Flask API
  useEffect(() => {
    const loadProducts = () => {
      const allProducts = Object.values(PRODUCTS_DATA).filter(p => p.id || p.slug);
      const featuredIds = ['easy-grow-gold', 'fatty', 'easy-grow-sc', 'aaqab', 'conference-gold-fs', 'conference'];
      
      const featured = allProducts.filter(p => featuredIds.includes(p.id) || featuredIds.includes(p.slug));
      
      const finalFeatured = [...featured];
      allProducts.forEach(p => {
        if (finalFeatured.length < 3 && !finalFeatured.find(f => f.id === p.id)) {
          finalFeatured.push(p);
        }
      });

      const mapped = finalFeatured.map(p => {
        const sizeInfo = p?.sizes?.[0] || {};
        const price = sizeInfo?.price || p?.price || 0;
        return {
          ...p,
          price,
          sizes: p?.sizes || [{ size: p?.packaging || '100ML', price: p?.price || 0 }]
        };
      });

      setDisplayProducts(mapped.slice(0, 3));
    };

    loadProducts();
    window.addEventListener('vital_catalog_hydrated', loadProducts);
    return () => window.removeEventListener('vital_catalog_hydrated', loadProducts);
  }, [lang]);

  // Performance-optimized GPU custom property scroll listener for Parallax Background
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const relativeScroll = scrolled - rect.top;
      sectionRef.current.style.setProperty('--scroll-y', `${relativeScroll * 0.12}px`);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOrder = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const defaultSize = product.sizes?.[0];
    if (defaultSize) {
      addToCart(product, defaultSize);
      setIsCartOpen(true);
    } else {
      setActiveDetailsProduct(product);
    }
  };

  const containerVars = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const cardVars = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: 'spring', stiffness: 140, damping: 18 }
    }
  };

  return (
    <section 
      ref={sectionRef} 
      id="products" 
      className="relative py-20 sm:py-28 overflow-hidden select-none contain-layout-paint"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fog-shift-spotlight-1 {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(20px, -20px, 0) rotate(180deg); }
          100% { transform: translate3d(0, 0, 0) rotate(360deg); }
        }
        @keyframes fog-shift-spotlight-2 {
          0% { transform: translate3d(0, 0, 0) rotate(360deg); }
          50% { transform: translate3d(-30px, 30px, 0) rotate(180deg); }
          100% { transform: translate3d(0, 0, 0) rotate(0deg); }
        }
      `}} />

      {/* Parallax Background Engine with Jungle Image */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{ transform: 'translate3d(0, var(--scroll-y, 0), 0)' }}
      >
        {/* Soft Linear Gradients to blend sections */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020502] via-transparent to-[#020502] z-10" />
        
        {/* Cinematic Jungle Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.55]"
          style={{ 
            backgroundImage: 'url("/jungle_bg.png")',
            filter: 'brightness(0.5) contrast(1.15) saturate(1.1)'
          }}
        />

        {/* Dynamic Fog Layers */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20 z-0" style={{ animation: 'fog-shift-spotlight-1 40s infinite ease-in-out' }}>
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-900/30 rounded-full blur-[140px] mix-blend-screen" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-[#4ade80]/5 rounded-full blur-[120px] mix-blend-screen" />
        </div>
        
        {/* Hardware-accelerated Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.025] z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            transform: 'perspective(1000px) rotateX(60deg) scale(2.5) translateY(-10%)',
            transformOrigin: 'top center'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full
              bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.22)]
              text-[#4ade80] text-xs font-black tracking-[0.22em] uppercase mb-5"
          >
            ✦ {lang === 'en' ? 'FEATURED SPOTLIGHT' : 'خصوصی مصنوعات'}
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none"
          >
            {lang === 'en' ? 'Our Flagship Solutions' : 'وائٹل کی فلیگ شپ پروڈکٹس'}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/45 mt-5 max-w-xl mx-auto text-sm sm:text-base leading-relaxed font-semibold"
          >
            {lang === 'en' 
              ? 'Formulated under expert international control to maximize agricultural yield, crop safety, and organic nourishment.' 
              : 'فصل کی ریکارڈ پیداوار اور تحفظ کے لیے عالمی معیار کے مطابق تیار کردہ جدید فارمولیشنز۔'}
          </motion.p>
        </div>

        {/* 3 Featured Products Display */}
        <motion.div 
          variants={containerVars}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 items-stretch"
        >
          {displayProducts.map((prod, idx) => {
            const prodName = prod.name?.[lang] || prod.name?.en || prod.name || '';
            const prodDesc = prod.shortDesc?.[lang] || prod.description?.[lang] || '';
            const defaultSize = prod.sizes?.[0];
            const sizeLabel = defaultSize?.size || '';
            const priceLabel = defaultSize ? `PKR ${Math.round(defaultSize.price).toLocaleString()}` : '';

            return (
              <motion.div
                key={prod.id || prod.slug}
                variants={cardVars}
                whileHover={{ 
                  y: -8, 
                  scale: 1.025,
                  boxShadow: '0 25px 55px rgba(0,0,0,0.65), 0 0 25px rgba(34,197,94,0.18)',
                  borderColor: 'rgba(34,197,94,0.40)'
                }}
                className="flex flex-col justify-between rounded-3xl p-6 bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-3xl relative overflow-hidden group shadow-xl transition-all duration-300"
                style={{ perspective: '800px' }}
              >
                {/* Visual Glass Sheen */}
                <div style={{ transitionDuration: '1.8s' }} className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[250%] transition-transform ease-in-out pointer-events-none" />

                <div>
                  {/* Category Badge & Quality Seal */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#4ade80] px-2.5 py-1 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/20">
                      {prod.category === 'seed-treatment' 
                        ? (lang === 'en' ? 'Seed Care' : 'بیج کا تحفظ') 
                        : (lang === 'en' ? 'Plant Power' : 'پودوں کی غذائیت')}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-white/40 font-mono">
                      <ShieldCheck size={11} className="text-[#4ade80]" />
                      100% ORIGINAL
                    </span>
                  </div>

                  {/* Bottle Showcase Frame */}
                  <div className="relative aspect-[4/3] w-full flex items-center justify-center p-4 bg-white/[0.02] rounded-2xl border border-white/5 mb-6 overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.12)_0%,transparent_60%)] group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                    <img
                      src={prod.pngUrl || prod.imageUrl || `/products/${prod.slug}.webp`}
                      alt={prodName}
                      className="max-h-[140px] w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] group-hover:scale-110 group-hover:-rotate-2 transition-all duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Title */}
                  <h3 className="text-xl font-black text-white leading-tight mb-2 group-hover:text-[#4ade80] transition-colors">
                    {prodName}
                  </h3>

                  {/* Pricing Info */}
                  <div className="flex items-baseline gap-2 mb-3.5 font-mono">
                    <span className="text-lg font-black text-[#4ade80]">{priceLabel}</span>
                    {sizeLabel && <span className="text-[10px] text-white/35 font-bold uppercase">({sizeLabel})</span>}
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-white/50 leading-relaxed font-semibold line-clamp-3 mb-6">
                    {prodDesc}
                  </p>
                </div>

                {/* Tactile Action Panel */}
                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5 relative z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveDetailsProduct(prod);
                    }}
                    className="flex items-center justify-center gap-2 h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all active:scale-95 cursor-pointer shadow-sm group/btn"
                  >
                    <Eye size={13} className="text-white/60 group-hover/btn:text-[#4ade80] transition-colors" />
                    <span>{lang === 'en' ? 'Details' : 'تفصیلات'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleOrder(e, prod)}
                    className="flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-[#22c55e] to-[#15803d] hover:shadow-[0_0_15px_rgba(34,197,94,0.35)] text-white rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    <ShoppingBag size={13} className="text-white" />
                    <span>{lang === 'en' ? 'Order Now' : 'خریدیں'}</span>
                  </button>
                </div>

              </motion.div>
            );
          })}
        </motion.div>

        {/* Spacious centered "More Products" redirect button */}
        <div className="flex justify-center mt-12">
          <Link
            to="/products"
            className="px-10 h-14 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white rounded-full text-sm font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden group/more hover:scale-104 active:scale-98 transition-all hover:shadow-[0_8px_30px_rgba(34,197,94,0.50)]"
          >
            {/* Shimmer glaze */}
            <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover/more:animate-[shimmer_2.5s_infinite]" />
            
            <span>{lang === 'en' ? 'Browse All Products' : 'تمام مصنوعات دیکھیں'}</span>
            <ArrowRight size={16} className="group-hover/more:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}