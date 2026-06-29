'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingCart, ShieldCheck, Info, Crop, AlertTriangle, Thermometer } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { getProductImage } from '@/data/productsData';
import { useNavigate } from 'react-router-dom';
import BlurUpImage from '@/components/ui/BlurUpImage';

const THEMES = {
  'seed-treatment': { border: 'rgba(16, 185, 129, 0.3)', glow: 'rgba(16, 185, 129, 0.15)', text: '#34d399', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  'fungicide': { border: 'rgba(239, 68, 68, 0.3)', glow: 'rgba(239, 68, 68, 0.15)', text: '#f87171', badge: 'bg-red-500/10 border-red-500/30 text-red-400' },
  'herbicide': { border: 'rgba(234, 179, 8, 0.3)', glow: 'rgba(234, 179, 8, 0.15)', text: '#facc15', badge: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
  'insecticide': { border: 'rgba(59, 130, 246, 0.3)', glow: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', badge: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  'plant-nutrition': { border: 'rgba(132, 204, 22, 0.3)', glow: 'rgba(132, 204, 22, 0.15)', text: '#a3e635', badge: 'bg-lime-500/10 border-lime-500/30 text-lime-400' }
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

export default function ProductDetailsModal({ product, onClose }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeSizeIdx, setActiveSizeIdx] = useState(0);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const categoryKey = product.category?.toLowerCase()?.replace(/_/g, '-')?.replace(/\s+/g, '-');
  const theme = THEMES[categoryKey] || { border: 'rgba(16, 185, 129, 0.25)', glow: 'rgba(16, 185, 129, 0.1)', text: '#34d399', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };

  const sizes = product.sizes || [{ size: product.packaging || '100ML', price: product.price || 0 }];
  const activeSize = sizes[activeSizeIdx] || {};
  const activePrice = activeSize.price || product.price || 0;
  const activeSizeName = activeSize.size || product.packaging || '100ML';
  const oldPrice = activeSize.oldPrice || null;

  const nameEn = product.name_en || (typeof product.name === 'object' ? product.name.en : product.name);
  const nameUr = product.name_ur || (typeof product.name === 'object' ? product.name.ur : '');
  const description = product.description?.[lang] || product.description?.en || product.shortDesc?.[lang] || product.shortDesc?.en || '';
  const application = product.application?.[lang] || product.application?.en || '';
  const storage = product.specs?.storage?.[lang] || product.specs?.storage?.en || '';

  const featuresList = product.features 
    ? (Array.isArray(product.features[lang]) 
        ? product.features[lang] 
        : Array.isArray(product.features.en) 
          ? product.features.en 
          : []) 
    : [];

  const safetyList = product.safety 
    ? (Array.isArray(product.safety[lang]) 
        ? product.safety[lang] 
        : Array.isArray(product.safety.en) 
          ? product.safety.en 
          : []) 
    : [];

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
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Content Panel */}
      <motion.div
        className="relative w-full max-w-5xl rounded-[36px] border overflow-hidden flex flex-col lg:flex-row bg-[#030905]/85 backdrop-blur-2xl max-h-[90vh] lg:max-h-[85vh] shadow-[0_30px_70px_rgba(0,0,0,0.8)]"
        style={{
          borderColor: theme.border,
          boxShadow: `0 30px 70px rgba(0,0,0,0.8), 0 0 50px ${theme.glow}`
        }}
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Floating close X button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 w-11 h-11 rounded-full bg-white/60 border border-emerald-900/10 flex items-center justify-center text-neutral-600 hover:text-emerald-950 hover:bg-white/80 active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: 3D Product Media Showcase & Direct Purchasing */}
        <div className="w-full lg:w-[42%] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-900/5 p-6 sm:p-8 bg-emerald-950/5 overflow-y-auto">
          
          <div className="space-y-6">
            {/* Category tag & Quality Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${theme.badge}`}>
                {getCategoryLabel(product.category)}
              </span>
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% QUALITY GUARANTEE
              </span>
            </div>

            {/* Glowing 3D Product Image Zone */}
            <div className="relative aspect-square w-full rounded-[24px] bg-white/60 border border-emerald-900/5 flex items-center justify-center p-6 sm:p-8 shadow-inner overflow-hidden">
              <div 
                className="absolute w-44 h-44 rounded-full blur-[40px] opacity-25 pointer-events-none"
                style={{ background: theme.text }}
              />
              {/* Product base stand reflection */}
              <div className="absolute bottom-4 w-[65%] h-[2px] bg-gradient-to-r from-transparent via-[#76C945]/40 to-transparent shadow-[0_0_10px_rgba(118,201,69,0.5)] z-0" />
              
              <motion.div
                animate={{ y: [-6, 6, -6], rotateY: [0, 4, -4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-full h-full flex items-center justify-center"
              >
                <BlurUpImage
                  src={getProductImage(product)}
                  alt={nameEn}
                  className="max-h-full max-w-[90%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
                />
              </motion.div>
            </div>
          </div>

          {/* Quick packaging & Quantity Checkout drawer */}
          <div className="space-y-5 pt-6 mt-6 border-t border-emerald-900/5">
            {/* Pack Size chips */}
            <div className="space-y-2">
              <span className="text-[10px] text-neutral-500 block font-black uppercase tracking-wider">Pack Sizes:</span>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz, idx) => {
                  const sizeName = typeof sz === 'object' ? sz.size : sz;
                  const active = activeSizeIdx === idx;
                  return (
                    <button
                      key={sizeName}
                      onClick={() => setActiveSizeIdx(idx)}
                      className={`px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-black border transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-md shadow-emerald-500/10'
                          : 'bg-white/60 border-emerald-900/5 text-neutral-500 hover:bg-white/80 hover:text-emerald-950'
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
                <span className="text-[10px] text-neutral-500 block font-black uppercase tracking-wider mb-1">Pricing:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono leading-none">
                    {activePrice === 0 ? 'On Request' : `₨ ${(activePrice * qty).toLocaleString()}`}
                  </span>
                  {activePrice > 0 && oldPrice && oldPrice > activePrice && (
                    <span className="text-emerald-950/25 line-through text-xs font-mono">
                      ₨{(oldPrice * qty).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity selectors */}
              <div className="flex items-center gap-2 bg-white/60 rounded-xl border border-emerald-900/5 p-1 h-[36px] sm:h-[40px]">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-white/60 hover:bg-white/15 text-emerald-950 text-xs flex items-center justify-center font-bold transition-all cursor-pointer"
                >
                  -
                </button>
                <span className="w-6 text-center text-xs font-black text-emerald-950 font-mono">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center font-bold transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Direct Purchase Button */}
            <button
              onClick={handleBuyNow}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] text-emerald-950 text-xs font-black uppercase tracking-widest active:scale-[0.98] transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Now (Cash on Delivery)
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Tabular Specs, Usage Guide & Professional Layout */}
        <div className="w-full lg:w-[58%] p-6 sm:p-8 overflow-y-auto space-y-6 scrollbar-thin">
          {/* Header titles */}
          <div className="space-y-2">
            {nameUr && (lang === 'ur' || lang === 'pb') && (
              <h2 className="text-emerald-400 font-extrabold text-2xl sm:text-3xl leading-normal select-none" style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }} dir="rtl">
                {nameUr}
              </h2>
            )}
            <h1 className="text-emerald-950 font-black text-2xl sm:text-4xl leading-tight">
              {nameEn}
            </h1>
            {product.genericName?.en && (
              <p className="text-neutral-400 font-mono text-xs tracking-wider uppercase">
                Active Formulation: {product.genericName.en}
              </p>
            )}
          </div>

          {/* Description Block */}
          <div className="space-y-2 border-l-2 pl-4" style={{ borderColor: theme.border }}>
            <span className="text-[10px] text-neutral-400 block font-black uppercase tracking-wider">Product Overview:</span>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed font-semibold">
              {description}
            </p>
          </div>

          {/* Crop Compatibility badges */}
          {product.crops && product.crops.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] text-neutral-400 font-black uppercase tracking-wider flex items-center gap-1">
                <Crop className="w-3.5 h-3.5" />
                Target Crops compatibility:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.crops.map((cr, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-white/60 border border-emerald-900/10 text-xs font-bold text-neutral-700 flex items-center gap-1.5 backdrop-blur-sm"
                  >
                    <span>{cr.icon || '🌱'}</span>
                    <span>{typeof cr.name === 'object' ? (cr.name[lang] || cr.name.en) : cr.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Features & Benefits cards */}
          {featuresList.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[10px] text-neutral-400 font-black uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Key Benefits & Biotech Features:
              </span>
              <div className="grid sm:grid-cols-2 gap-3">
                {featuresList.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/70 border border-emerald-900/5 flex items-start gap-2.5 backdrop-blur-sm"
                  >
                    <span className="text-emerald-400 text-xs mt-0.5">✦</span>
                    <span className="text-emerald-950/75 text-xs font-semibold leading-relaxed">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications Grid / Tables */}
          <div className="space-y-3">
            <span className="text-[10px] text-neutral-400 font-black uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Technical Specifications Guide:
            </span>

            <div className="rounded-2xl border border-emerald-900/5 overflow-hidden bg-white/60 backdrop-blur-sm">
              <table className="w-full text-left text-xs border-collapse font-semibold">
                <tbody>
                  {product.activeIngredient && (
                    <tr className="border-b border-emerald-900/5 hover:bg-white/70 transition-colors">
                      <td className="px-4 py-3 text-neutral-500 uppercase font-mono tracking-wider w-[35%]">Active Ingredient</td>
                      <td className="px-4 py-3 text-neutral-800">{product.activeIngredient}</td>
                    </tr>
                  )}
                  {product.formulation && (
                    <tr className="border-b border-emerald-900/5 hover:bg-white/70 transition-colors">
                      <td className="px-4 py-3 text-neutral-500 uppercase font-mono tracking-wider">Formulation</td>
                      <td className="px-4 py-3 text-neutral-800">{product.formulation}</td>
                    </tr>
                  )}
                  {application && (
                    <tr className="border-b border-emerald-900/5 hover:bg-white/70 transition-colors">
                      <td className="px-4 py-3 text-neutral-500 uppercase font-mono tracking-wider">Application Mode</td>
                      <td className="px-4 py-3 text-neutral-700 leading-relaxed">{application}</td>
                    </tr>
                  )}
                  {storage && (
                    <tr className="border-b border-emerald-900/5 hover:bg-white/70 transition-colors">
                      <td className="px-4 py-3 text-neutral-500 uppercase font-mono tracking-wider">Storage Instructions</td>
                      <td className="px-4 py-3 text-neutral-700 flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{storage}</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Safety & Precautions alerts */}
          {safetyList.length > 0 && (
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/10 flex gap-3 backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] text-red-400 font-black uppercase tracking-wider">Safety Warnings & Precautions:</span>
                <ul className="list-disc list-inside text-neutral-600 text-xs font-semibold space-y-1">
                  {safetyList.map((safe, idx) => (
                    <li key={idx} className="leading-relaxed">{safe}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
