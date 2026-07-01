'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, ShieldCheck, Crop, AlertTriangle, Thermometer, Layers, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { PRODUCTS_DATA, getProductImage } from '@/data/productsData';
import { useNavigate } from 'react-router-dom';
import BlurUpImage from '@/components/ui/BlurUpImage';

const THEMES = {
  'seed-treatment': { border: 'rgba(15, 123, 59, 0.25)', text: '#0E7A43', badge: 'bg-[#0E7A43]/10 border-[#0E7A43]/20 text-[#0E7A43]' },
  'fungicide': { border: 'rgba(239, 68, 68, 0.25)', text: '#ef4444', badge: 'bg-red-500/10 border-red-500/20 text-red-600' },
  'herbicide': { border: 'rgba(197, 160, 89, 0.25)', text: '#C5A059', badge: 'bg-[#C5A059]/10 border-[#C5A059]/20 text-[#C5A059]' },
  'insecticide': { border: 'rgba(59, 130, 246, 0.25)', text: '#3b82f6', badge: 'bg-blue-500/10 border-blue-500/20 text-blue-600' },
  'plant-nutrition': { border: 'rgba(15, 123, 59, 0.25)', text: '#0E7A43', badge: 'bg-[#0E7A43]/10 border-[#0E7A43]/20 text-[#0E7A43]' }
};

const getCategoryLabel = (category) => {
  switch (category) {
    case 'seed-treatment': return 'Seed Treatment';
    case 'fungicide': return 'Fungicide';
    case 'herbicide': return 'Herbicide';
    case 'insecticide': return 'Insecticide';
    case 'plant-nutrition':
    case 'plant_nutrition': return 'Plant Nutrition';
    default: return 'Special Biotech';
  }
};

export default function ProductDetailsModal({ product: initialProduct, onClose }) {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [product, setProduct] = useState(initialProduct);
  const [qty, setQty] = useState(1);
  const [activeSizeIdx, setActiveSizeIdx] = useState(0);

  // Sync state if initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setQty(1);
      setActiveSizeIdx(0);
    }
  }, [initialProduct]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return Object.values(PRODUCTS_DATA)
      .filter(p => p && p.category === product.category && p.id !== product.id)
      .slice(0, 3)
      .map(p => {
        const pName = p.name && typeof p.name === 'object'
          ? (p.name[lang] || p.name.en)
          : typeof p.name === 'string' ? p.name : '';
        return {
          ...p,
          name: pName || '',
          image: getProductImage(p)
        };
      });
  }, [product, lang]);

  if (!product) return null;

  const categoryKey = typeof product.category === 'string'
    ? product.category.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-')
    : '';
  const theme = THEMES[categoryKey] || { border: 'rgba(15, 123, 59, 0.2)', text: '#0E7A43', badge: 'bg-[#0E7A43]/10 border-[#0E7A43]/20 text-[#0E7A43]' };

  const sizes = product.sizes || [{ size: product.packaging || '100ML', price: product.price || 0 }];
  const activeSize = sizes[activeSizeIdx] || {};
  const activePrice = activeSize.price || product.price || 0;
  const activeSizeName = activeSize.size || product.packaging || '100ML';
  const oldPrice = activeSize.oldPrice || null;

  const nameEn = product.name_en || (product.name && typeof product.name === 'object' ? product.name.en : typeof product.name === 'string' ? product.name : '') || '';
  const nameUr = product.name_ur || (product.name && typeof product.name === 'object' ? product.name.ur : '') || '';
  const description = product.description?.[lang] || product.description?.en || product.shortDesc?.[lang] || product.shortDesc?.en || (typeof product.description === 'string' ? product.description : '') || '';
  const application = product.application?.[lang] || product.application?.en || product.usage?.[lang] || product.usage?.en || (typeof product.application === 'string' ? product.application : '') || '';
  const storage = product.specs?.storage?.[lang] || product.specs?.storage?.en || (typeof product.specs?.storage === 'string' ? product.specs.storage : '') || '';
  const dosage = product.dosage?.[lang] || product.dosage?.en || (typeof product.dosage === 'string' ? product.dosage : '') || '';
  const targetDiseases = product.diseases?.[lang] || product.diseases?.en || (typeof product.diseases === 'string' ? product.diseases : '') || '';

  const getSafeList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'object') {
      if (Array.isArray(val[lang])) return val[lang];
      if (Array.isArray(val.en)) return val.en;
    }
    if (typeof val === 'string') return [val];
    return [];
  };

  const featuresList = getSafeList(product.features);
  const benefitsList = getSafeList(product.benefits);
  const safetyList = getSafeList(product.safety);

  const handleBuyNow = () => {
    const sizeParam = activeSizeName ? `&size=${encodeURIComponent(activeSizeName)}` : '';
    const qtyParam = qty > 1 ? `&qty=${qty}` : '';
    onClose();
    navigate(`/checkout?product=${product.slug || product.id}${sizeParam}${qtyParam}`);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop glass blur */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Content Panel */}
      <motion.div
        className="relative w-full max-w-5xl rounded-[32px] border overflow-hidden flex flex-col lg:flex-row bg-[#EAFBF3]/95 backdrop-blur-2xl max-h-[90vh] lg:max-h-[85vh] shadow-[0_30px_70px_rgba(0,0,0,0.18)]"
        style={{
          borderColor: 'rgba(15, 123, 59, 0.15)',
        }}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Floating close X button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 w-10 h-10 rounded-full bg-white/80 border border-[#0E7A43]/10 flex items-center justify-center text-neutral-500 hover:text-[#0a331c] hover:bg-white active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Premium White Glass Product Media & Action Zone */}
        <div className="w-full lg:w-[42%] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#0E7A43]/10 p-6 sm:p-8 bg-[#EAFBF3] overflow-y-auto">
          
          <div className="space-y-6">
            {/* Category tag & Quality Badge */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${theme.badge}`}>
                {getCategoryLabel(product.category)}
              </span>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-[#18C964]" />
                IN STOCK
              </span>
            </div>

            {/* Glowing 3D Product Image Zone */}
            <div className="relative aspect-square w-full rounded-[24px] bg-white border border-[#0E7A43]/10 flex items-center justify-center p-6 sm:p-8 shadow-sm overflow-hidden">
              <div 
                className="absolute w-44 h-44 rounded-full blur-[40px] opacity-10 pointer-events-none"
                style={{ background: '#0E7A43' }}
              />
              {/* Product base stand reflection */}
              <div className="absolute bottom-4 w-[65%] h-[2px] bg-gradient-to-r from-transparent via-[#0E7A43]/30 to-transparent z-0" />
              
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-full h-full flex items-center justify-center"
              >
                <BlurUpImage
                  src={getProductImage(product)}
                  alt={nameEn}
                  className="max-h-[85%] max-w-[85%] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
                />
              </motion.div>
            </div>
          </div>

          {/* Quick packaging & Quantity Checkout drawer */}
          <div className="space-y-5 pt-6 mt-6 border-t border-[#0E7A43]/10">
            {/* Pack Size chips */}
            <div className="space-y-2">
              <span className="text-[10px] text-[#5A5A5A] block font-black uppercase tracking-wider">Pack Sizes:</span>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz, idx) => {
                  const sizeName = typeof sz === 'object' ? sz.size : sz;
                  const active = activeSizeIdx === idx;
                  return (
                    <button
                      key={sizeName}
                      onClick={() => setActiveSizeIdx(idx)}
                      className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#0E7A43] text-white border-[#0E7A43] shadow-sm shadow-[#0E7A43]/20'
                          : 'bg-white border-[#0E7A43]/10 text-[#5A5A5A] hover:bg-[#EAFBF3] hover:text-[#0a331c]'
                      }`}
                    >
                      {sizeName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector and Price */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#5A5A5A] block font-black uppercase tracking-wider mb-1">Pricing:</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-[#0a331c] font-mono leading-none">
                    {activePrice === 0 ? (lang === 'en' ? 'On Request' : 'قیمت طلب کریں') : `Rs. ${(activePrice * qty).toLocaleString()}`}
                  </span>
                  {activePrice > 0 && oldPrice && oldPrice > activePrice && (
                    <span className="text-[#5A5A5A]/50 line-through text-xs font-mono">
                      Rs. {(oldPrice * qty).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity selectors */}
              <div className="flex items-center gap-1.5 bg-white rounded-xl border border-[#0E7A43]/10 p-1 h-[36px] sm:h-[40px]">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-[#EAFBF3] hover:bg-neutral-100 text-[#0a331c] text-xs flex items-center justify-center font-bold transition-all cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center text-xs font-black text-[#0a331c] font-mono">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-7 h-7 rounded-lg bg-[#0E7A43]/10 hover:bg-[#0E7A43]/20 text-[#0E7A43] text-xs flex items-center justify-center font-bold transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Direct Purchase Button */}
            <button
              onClick={handleBuyNow}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#18C964] to-[#0E7A43] text-white text-xs font-black uppercase tracking-wider hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-[#0E7A43]/25"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Now (Cash on Delivery)
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Tabular Specs, Usage Guide & Related Products */}
        <div className="w-full lg:w-[58%] p-6 sm:p-8 overflow-y-auto space-y-6 scrollbar-thin text-left bg-white/70">
          {/* Header titles */}
          <div className="space-y-1">
            {nameUr && (lang === 'ur' || lang === 'pb') && (
              <h2 className="text-[#0E7A43] font-extrabold text-xl sm:text-2xl leading-normal select-none" style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }} dir="rtl">
                {nameUr}
              </h2>
            )}
            <h1 className="text-[#0a331c] font-black text-2xl sm:text-3xl leading-tight">
              {nameEn}
            </h1>
            {product.genericName?.en && (
              <p className="text-neutral-500 font-mono text-[10px] tracking-wider uppercase">
                Active Ingredient: {product.genericName.en}
              </p>
            )}
          </div>

          {/* Description Block */}
          <div className="space-y-1.5 border-l-2 pl-4 border-[#0E7A43]">
            <span className="text-[9px] text-[#5A5A5A] block font-black uppercase tracking-wider">Product Overview:</span>
            <p className="text-[#5A5A5A] text-xs sm:text-sm leading-relaxed font-medium">
              {description}
            </p>
          </div>

          {/* Crop Compatibility badges */}
          {product.crops && Array.isArray(product.crops) && product.crops.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] text-[#5A5A5A] font-black uppercase tracking-wider flex items-center gap-1">
                <Crop className="w-3.5 h-3.5 text-[#0E7A43]" />
                Target Crops Compatibility:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.crops.map((cr, idx) => {
                  if (!cr) return null;
                  const cropName = typeof cr === 'object'
                    ? (cr.name && typeof cr.name === 'object' ? (cr.name[lang] || cr.name.en) : cr.name)
                    : cr;
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-[#EAFBF3] border border-[#0E7A43]/10 text-xs font-bold text-neutral-700 flex items-center gap-1.5"
                    >
                      <span>{cr.icon || '🌱'}</span>
                      <span>{cropName || ''}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Benefits list */}
          {benefitsList.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] text-[#5A5A5A] font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7A43]" />
                Key Benefits:
              </span>
              <div className="grid sm:grid-cols-2 gap-2">
                {benefitsList.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#EAFBF3] border border-[#0E7A43]/5 flex items-start gap-2">
                    <span className="text-[#18C964] text-xs mt-0.5">✓</span>
                    <span className="text-[#5A5A5A] text-xs font-medium leading-normal">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features list */}
          {featuresList.length > 0 && benefitsList.length === 0 && (
            <div className="space-y-2">
              <span className="text-[9px] text-[#5A5A5A] font-black uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#0E7A43]" />
                Features:
              </span>
              <div className="grid sm:grid-cols-2 gap-2">
                {featuresList.map((feat, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#EAFBF3] border border-[#0E7A43]/5 flex items-start gap-2">
                    <span className="text-[#18C964] text-xs mt-0.5">✦</span>
                    <span className="text-[#5A5A5A] text-xs font-medium leading-normal">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications Table */}
          <div className="space-y-2.5">
            <span className="text-[9px] text-[#5A5A5A] font-black uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#0E7A43]" />
              Application Specifications:
            </span>

            <div className="rounded-xl border border-[#0E7A43]/10 overflow-hidden bg-[#EAFBF3]">
              <table className="w-full text-left text-xs border-collapse font-medium">
                <tbody>
                  {product.activeIngredient && (
                    <tr className="border-b border-[#0E7A43]/5 hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-2.5 text-[#5A5A5A] uppercase font-mono tracking-wider w-[35%]">Active Ingredient</td>
                      <td className="px-4 py-2.5 text-[#0a331c]">{product.activeIngredient}</td>
                    </tr>
                  )}
                  {dosage && (
                    <tr className="border-b border-[#0E7A43]/5 hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-2.5 text-[#5A5A5A] uppercase font-mono tracking-wider">Recommended Dosage</td>
                      <td className="px-4 py-2.5 text-[#0a331c]">{dosage}</td>
                    </tr>
                  )}
                  {targetDiseases && (
                    <tr className="border-b border-[#0E7A43]/5 hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-2.5 text-[#5A5A5A] uppercase font-mono tracking-wider">Target Pests / Diseases</td>
                      <td className="px-4 py-2.5 text-[#0a331c]">{targetDiseases}</td>
                    </tr>
                  )}
                  {application && (
                    <tr className="border-b border-[#0E7A43]/5 hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-2.5 text-[#5A5A5A] uppercase font-mono tracking-wider">Application Method</td>
                      <td className="px-4 py-2.5 text-[#5A5A5A] leading-relaxed">{application}</td>
                    </tr>
                  )}
                  {storage && (
                    <tr className="border-b border-[#0E7A43]/5 hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-2.5 text-[#5A5A5A] uppercase font-mono tracking-wider">Storage Instructions</td>
                      <td className="px-4 py-2.5 text-[#5A5A5A] flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{storage}</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Safety Warning */}
          {safetyList.length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[9px] text-red-600 font-black uppercase tracking-wider">Safety Warnings & Precautions:</span>
                <ul className="list-disc list-inside text-[#5A5A5A] text-xs font-medium space-y-1">
                  {safetyList.map((safe, idx) => (
                    <li key={idx} className="leading-relaxed">{safe}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Related Products Slider Section */}
          {relatedProducts.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#0E7A43]/10">
              <span className="text-[9px] text-[#5A5A5A] font-black uppercase tracking-wider block">Related Agrotech Products:</span>
              <div className="grid grid-cols-3 gap-3">
                {relatedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setProduct(p)}
                    className="p-2.5 rounded-xl border border-[#0E7A43]/5 bg-[#EAFBF3] hover:border-[#0E7A43]/20 transition-all cursor-pointer flex flex-col items-center text-center group"
                  >
                    <div className="aspect-square w-12 flex items-center justify-center mb-1.5">
                      <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-[10px] font-black text-[#0a331c] line-clamp-1 group-hover:text-[#0E7A43] transition-colors">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
