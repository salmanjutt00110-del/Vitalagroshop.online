'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PAYMENT_METHODS } from '@/lib/payment/config';

// Premium SVG / Monogram badges for Pakistan Payment Brands
const BrandLogo = ({ id, textColor }) => {
  const baseClass = "w-10 h-10 rounded-xl flex items-center justify-center font-sans text-xs font-black tracking-tighter select-none shadow-md shrink-0";

  switch (id) {
    case 'cod':
      return (
        <div className={`${baseClass} bg-[#D8B470]/10 border border-[#D8B470]/25 text-[#D8B470]`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V15a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        </div>
      );
    case 'jsbank':
      return (
        <div className={`${baseClass} bg-[#0066B3] text-white`}>
          JS
        </div>
      );
    case 'hbl':
      return (
        <div className={`${baseClass} bg-[#00A651] text-white`}>
          HBL
        </div>
      );
    case 'bankalhabib':
      return (
        <div className={`${baseClass} bg-[#007236] text-white`}>
          BAHL
        </div>
      );
    case 'habibmetro':
      return (
        <div className={`${baseClass} bg-[#662D91] text-white`}>
          HMB
        </div>
      );
    case 'mcb':
      return (
        <div className={`${baseClass} bg-[#F58220] text-white`}>
          MCB
        </div>
      );
    case 'meezan':
      return (
        <div className={`${baseClass} bg-[#871F4F] text-[#F3E5AB]`}>
          MZN
        </div>
      );
    case 'ubl':
      return (
        <div className={`${baseClass} bg-[#0067B9] text-white`}>
          UBL
        </div>
      );
    default:
      return (
        <div className={`${baseClass} bg-white/5 border border-white/10 text-white/50`}>
          BANK
        </div>
      );
  }
};

export const PaymentMethodGrid = ({ selected, onSelect, lang }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <p className="text-white/50 text-[11px] font-black tracking-[0.15em] uppercase">
          {lang === 'en' ? '💳 Choose Payment Method' : '💳 طریقہ ادائیگی منتخب کریں'}
        </p>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
          {lang === 'en' ? 'Prepaid = Free Shipping' : 'ایڈوانس = مفت شپنگ'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {PAYMENT_METHODS.map((method, i) => {
          const isSelected = selected === method.id;
          
          return (
            <motion.button
              key={method.id}
              onClick={(e) => {
                e.preventDefault();
                if (method.available) onSelect(method.id);
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-2xl border text-left
                transition-all duration-300 flex items-center gap-4 cursor-pointer select-none
                ${isSelected
                  ? 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.15)] bg-white/[0.04]'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.03]'
                }
                ${!method.available ? 'opacity-30 cursor-not-allowed' : ''}
              `}
              style={{
                boxShadow: isSelected ? `0 0 25px ${method.bgColor.replace('0.06', '0.12')}` : ''
              }}
            >
              {/* Selected checkmark indicator with layout animation */}
              {isSelected && (
                <motion.div
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                >
                  <span className="text-[10px] text-neutral-950 font-black">✓</span>
                </motion.div>
              )}

              {/* Brand Logo Component */}
              <BrandLogo id={method.id} textColor={method.textColor} />

              {/* Brand Info */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-black tracking-wide truncate">
                    {method.label}
                  </p>
                  {method.id === 'cod' && (
                    <span className="text-[8px] font-black uppercase text-amber-500 bg-amber-500/10 px-1 rounded">
                      COD
                    </span>
                  )}
                  {method.id !== 'cod' && (
                    <span className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-1 rounded">
                      Prepaid
                    </span>
                  )}
                </div>
                <p 
                  className="text-[10px] font-bold mt-0.5"
                  style={{ color: isSelected ? method.textColor : '#737373' }}
                >
                  {method.id === 'cod' 
                    ? (lang === 'en' ? 'Collect at Door step' : 'ڈیلیوری پر رقم کی ادائیگی')
                    : (lang === 'en' ? '🎁 Free Delivery applied' : '🎁 مفت شپنگ لاگو ہے')
                  }
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
