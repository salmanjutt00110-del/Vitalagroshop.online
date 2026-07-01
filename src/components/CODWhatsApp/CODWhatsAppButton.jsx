import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useNavigate } from 'react-router-dom';

// Sound/Haptic feedback helper (optional, failsafe)
const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
};

export default function CODWhatsAppButton({ product, className = "", defaultSize = null, defaultQuantity = 1 }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const buttonRef = useRef(null);

  // Magnetic Hover Physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  // Floating particles local state
  const [particles, setParticles] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX * 0.25);
    y.set(mouseY * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handlePress = (e) => {
    triggerHaptic();
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: clickX,
      y: clickY,
      angle: (i * 360) / 8 + Math.random() * 20,
      speed: 2 + Math.random() * 3,
      size: 4 + Math.random() * 4
    }));

    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 800);

    const slug = product.slug || product.id;
    const sizeObj = product?.sizes?.find(s => (typeof s === 'object' ? s.size : s) === defaultSize);
    const isBulkOrOnRequest = sizeObj ? sizeObj.price === 0 : (product?.price === 0);

    if (isBulkOrOnRequest) {
      const phone = "923011837160";
      const productName = typeof product.name === 'object' ? (product.name[lang] || product.name.en) : product.name;
      const catLabel = product.category ? product.category.replace('_', ' ').toUpperCase() : '';
      const size = defaultSize || '25 KG';
      const code = sizeObj?.sku || product.productCode || 'VA-PROD';
      
      const message = `Assalam-o-Alaikum Vital Agro Team,
I want to request a bulk quote/inquiry for the following product.
Product Name: ${productName}
Category: ${catLabel}
Selected Pack Size: ${size}
Price: On Request / Negotiable
Product Code: ${code}
Quantity: ${defaultQuantity}
Please guide me regarding availability.
Thank You.`;

      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      return;
    }

    const size = defaultSize ? `&size=${encodeURIComponent(defaultSize)}` : '';
    const qty = defaultQuantity ? `&qty=${defaultQuantity}` : '';
    navigate(`/checkout?product=${slug}${size}${qty}`);
  };

  return (
    <div 
      className="w-full relative py-2 select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <motion.button
        ref={buttonRef}
        onClick={handlePress}
        style={{
          x: springX,
          y: springY,
          boxShadow: isHovered 
            ? '0 20px 40px rgba(92, 184, 92, 0.45), 0 0 50px rgba(92, 184, 92, 0.25), inset 0 0 15px rgba(255, 255, 255, 0.15)'
            : '0 10px 25px rgba(45, 106, 45, 0.25), 0 0 10px rgba(92, 184, 92, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)',
          transformStyle: 'preserve-3d',
          perspective: 800
        }}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.95, rotateX: 6 }}
        className={`
          w-full py-4.5 rounded-[24px]
          flex items-center justify-center gap-2.5
          font-black text-sm text-emerald-950 uppercase tracking-wider
          relative overflow-hidden
          bg-gradient-to-br from-[#225522]/90 via-[#3d8c3d]/90 to-[#1b441b]/90
          backdrop-blur-xl border border-emerald-900/20
          transition-shadow duration-300
          ${className}
        `}
      >
        {/* Animated Glowing Border */}
        <span className="absolute inset-0 rounded-[24px] pointer-events-none p-[1.5px] overflow-hidden">
          <motion.div
            className="absolute inset-[-40%] rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 40%, rgba(92, 184, 92, 0.8) 50%, transparent 60%)',
              filter: 'blur(3px)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 bg-[#0a2310]/95 rounded-[23px] -z-10" />
        </span>

        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2d6a2d]/30 via-emerald-500/20 to-[#2d6a2d]/30 z-0" />

        {/* Light Sweep Effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ x: '-150%' }}
              animate={{ x: '150%' }}
              exit={{ x: '150%' }}
              transition={{ duration: 0.95, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 z-10 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Floating Micro Particles */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#18C964] opacity-30 pointer-events-none"
            style={{
              width: 2 + (i % 2) * 2,
              height: 2 + (i % 2) * 2,
              left: `${15 + i * 18}%`,
              top: `${40 + (i % 3) * 15}%`,
              filter: 'blur(1px)',
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.15, 0.45, 0.15],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 2 + i,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}

        {/* Ripple Wave Particles on Press */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-emerald-400 opacity-80 pointer-events-none z-10"
            style={{
              width: p.size,
              height: p.size,
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              boxShadow: '0 0 8px rgba(52, 211, 153, 0.8)'
            }}
            initial={{ scale: 1, opacity: 0.9 }}
            animate={{
              x: Math.cos((p.angle * Math.PI) / 180) * p.speed * 15,
              y: Math.sin((p.angle * Math.PI) / 180) * p.speed * 15,
              scale: 0,
              opacity: 0
            }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        ))}

        {/* Button Label and Icon */}
        <span className="relative z-10 flex items-center justify-center gap-2.5">
          <motion.div
            animate={{ rotate: isHovered ? 12 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          >
            <ShoppingBag size={18} className="text-emerald-600" />
          </motion.div>
          <span className="font-extrabold text-emerald-950 text-sm tracking-wider drop-shadow-md">
            {lang === 'en' ? 'Buy Now (COD)' : 'ابھی خریدیں (COD)'}
          </span>
        </span>
      </motion.button>
    </div>
  );
}
