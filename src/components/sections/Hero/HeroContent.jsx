import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Leaf, PlayCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { PRODUCTS_DATA } from '@/data/productsData';
import PremiumButton from '@/components/ui/PremiumButton';
import CountUp from '@/components/ui/CountUp';
import AnimatedText from '@/components/ui/AnimatedText';
import useParallax from '@/hooks/useParallax';

import vitalAgroLogo from '@/assets/vital agro logo.webp';
import fatty from '@/assets/fatty.webp';
import super4g from '@/assets/super-4g.webp';
import aaqaab from '@/assets/Aaqaab.webp';

export default function HeroContent() {
  const { t, lang } = useLanguage();
  const { setActiveDetailsProduct } = useApp();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const parallaxCentral = useParallax(0.02);
  const parallaxRight = useParallax(0.04);
  const parallaxLeft = useParallax(-0.035);

  const whatsappText = encodeURIComponent("Hello Vital Agro,\n\nI am interested in your agricultural products and solutions. Please provide more details.\n\nThank you.");
  const whatsappUrl = `https://wa.me/923011837160?text=${whatsappText}`;

  // Cinematic stagger
  const containerReveal = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: isMobile ? 0.08 : 0.15,
        delayChildren: isMobile ? 0.15 : 0.3,
      }
    }
  };

  const itemReveal = {
    hidden: { 
      opacity: 0, 
      y: isMobile ? 20 : 40, 
      filter: isMobile ? 'none' : 'blur(8px)' 
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: isMobile ? 'none' : 'blur(0px)',
      transition: { duration: isMobile ? 0.6 : 1, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const productEnter = {
    hidden: { 
      opacity: 0, 
      x: isMobile ? 0 : 120, 
      y: isMobile ? 30 : 0, 
      scale: 0.85 
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: isMobile ? 0.8 : 1.2, delay: isMobile ? 0.35 : 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const floatCardEnter = (delay) => ({
    hidden: { opacity: 0, y: 60, scale: 0.7 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 1, delay: isMobile ? delay * 0.5 : delay, ease: [0.16, 1, 0.3, 1] }
    }
  });

  const ctaPulse = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: isMobile ? 0.5 : 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const openModal = (slug) => {
    navigate(`/products/${slug}`);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 lg:pt-32 lg:pb-24 w-full">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Typography & Actions */}
        <motion.div
          variants={containerReveal}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center lg:items-start text-center lg:text-left"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Tagline Badge — cinematic fade-in */}
          <motion.div
            variants={itemReveal}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#EAFBF3]/85 backdrop-blur-sm border border-[#0E7A43]/[0.1] text-[#5A5A5A] text-xs sm:text-sm mb-4 lg:mb-8"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="bg-white/20 rounded-md px-1.5 py-0.5">
              <img
                src={vitalAgroLogo}
                alt="Vital Agro Logo"
                width="80"
                height="20"
                loading="eager"
                className="h-5 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              />
            </div>
            <span className="h-4 w-px bg-white/20" />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="flex items-center"
            >
              <Leaf className="w-4 h-4 text-[#0E7A43]" />
            </motion.div>
            <span>{t.hero.badge}</span>
          </motion.div>
 
          {/* Large Clip Reveal Heading — cinematic text entrance */}
          <h1 className="mb-4 lg:mb-6 tracking-tight" data-speed="0.04">
            <AnimatedText
              text={t.hero.heading1}
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#0a331c] leading-tight block"
            />
            <AnimatedText
              text={t.hero.heading2}
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight block text-transparent bg-clip-text bg-gradient-to-r from-[#39D98A] to-[#C5A059]"
              delay={0.2}
            />
          </h1>
 
          {/* Subheading — smooth reveal */}
          <motion.p
            variants={itemReveal}
            className="text-base sm:text-lg lg:text-xl text-[#5A5A5A] max-w-lg mb-6 lg:mb-10 leading-relaxed mx-auto lg:mx-0 font-medium"
            style={{ willChange: 'transform, opacity' }}
          >
            {t.hero.sub}
          </motion.p>
  
          {/* Buttons CTA Group */}
          <motion.div 
            variants={ctaPulse} 
            className="flex flex-wrap gap-4 items-center justify-center lg:justify-start"
            style={{ willChange: 'transform, opacity' }}
          >
            <PremiumButton
              variant="primary"
              onClick={(e) => {
                e.preventDefault();
                navigate('/products');
              }}
              isMagnetic={true}
            >
              {t.hero.explore}
            </PremiumButton>
            <PremiumButton
              variant="secondary"
              onClick={() => window.dispatchEvent(new CustomEvent('open-intro-video'))}
              isMagnetic={true}
              showArrow={false}
            >
              <PlayCircle className="w-5 h-5 mr-1.5" />
              <span>{lang === 'ur' || lang === 'pn' ? 'تعارفی ویڈیو' : 'Watch Intro'}</span>
            </PremiumButton>
            <PremiumButton variant="whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" isMagnetic={true} showArrow={false}>
              <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t.hero.whatsapp}
            </PremiumButton>
          </motion.div>
  
          {/* Stats Counters */}
          <motion.div
            variants={itemReveal}
            className="flex flex-wrap gap-4 sm:gap-6 mt-8 pt-6 lg:mt-12 lg:pt-8 border-t border-[#0E7A43]/[0.08] w-full justify-center lg:justify-start"
          >
            {[
              { to: 15, suffix: '+', label: t.hero.years },
              { to: 50, suffix: '+', label: t.hero.products },
              { to: 50000, suffix: '+', label: t.hero.farmers }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="text-2xl sm:text-3xl font-black text-[#0E7A43]">
                  <CountUp from={0} to={stat.to} suffix={stat.suffix} />
                </div>
                <div className="text-[#5A5A5A] mt-1 font-semibold tracking-wide" style={{ fontSize: 'clamp(11px, 3vw, 13px)' }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
 
        {/* Right Side: Levitating Luxury Glass Product Cards Showcase */}
        <motion.div
          variants={productEnter}
          initial="hidden"
          animate="visible"
          className="flex justify-center items-center relative mt-12 lg:mt-0"
        >
          <div className="relative flex items-center justify-center min-h-[360px] sm:min-h-[440px] w-full" style={{ perspective: 1200 }}>
            {/* Volumetric Green Glow Ring */}
            <motion.div
              className="absolute inset-0 rounded-full blur-[90px] opacity-25 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(15,123,59,0.2) 0%, transparent 70%)' }}
              animate={{ 
                scale: [1, 1.12, 1],
                opacity: [0.2, 0.35, 0.2]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Fireflies within the showcase container */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-[#39D98A]"
                  style={{
                    left: `${20 + i * 15}%`,
                    bottom: '15%',
                    boxShadow: '0 0 8px rgba(57,217,138,0.6), 0 0 12px rgba(57,217,138,0.3)',
                  }}
                  animate={{
                    y: [0, -200],
                    x: [0, Math.sin(i) * 35],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 4 + i * 0.8,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>

            {/* Central Product card — Fatty (Frosted glassmorphism) */}
            <motion.div 
              style={{ x: parallaxCentral.x, y: parallaxCentral.y }} 
              className="relative z-10" 
              data-speed="0.06"
            >
              <motion.div
                onClick={() => openModal('fatty')}
                className="rounded-[32px] p-6 border flex flex-col items-center w-[185px] h-[275px] sm:w-[215px] sm:h-[315px] justify-between cursor-pointer hover:shadow-[#0E7A43]/15 hover:border-[#0E7A43]/30 transition-all duration-300 relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.10)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.04, boxShadow: '0 25px 60px rgba(15, 123, 59,0.18)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
                <div className="flex-1 flex items-center justify-center p-2">
                  <img
                    src={fatty}
                    alt="Fatty Product"
                    loading="eager"
                    className="h-40 sm:h-52 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                  />
                </div>
                <span className="text-[#0a331c] font-bold text-xs bg-[#0E7A43]/15 px-3.5 py-1.5 rounded-full border border-[#0E7A43]/20 mt-2 z-10 backdrop-blur-sm">
                  Fatty
                </span>
              </motion.div>
            </motion.div>

            {/* Floating Secondary Card (Right) — Super 4G */}
            <motion.div
              variants={floatCardEnter(0.9)}
              initial="hidden"
              animate="visible"
              style={{ x: parallaxRight.x, y: parallaxRight.y }}
              className="absolute -right-6 sm:-right-10 -top-4 z-10 hidden lg:block"
              data-speed="0.1"
            >
              <motion.div
                onClick={() => openModal('super-4g')}
                className="rounded-2xl p-4 border flex flex-col items-center w-[125px] h-[175px] justify-between cursor-pointer hover:shadow-[#0E7A43]/10 hover:border-[#0E7A43]/30 transition-all duration-300 relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.10)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
                animate={{ y: [4, -8, 4] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                whileHover={{ scale: 1.06 }}
              >
                <div className="flex-1 flex items-center justify-center p-1">
                  <img
                    src={super4g}
                    alt="Super 4G"
                    className="h-28 w-auto object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
                  />
                </div>
                <span className="text-[#0a331c] font-bold text-[10px] bg-[#C5A059]/20 px-2.5 py-0.5 rounded-full mt-1 border border-[#C5A059]/25 z-10">
                  Super 4G
                </span>
              </motion.div>
            </motion.div>

            {/* Floating Tertiary Card (Left) — AAQAAB */}
            <motion.div
              variants={floatCardEnter(1.1)}
              initial="hidden"
              animate="visible"
              style={{ x: parallaxLeft.x, y: parallaxLeft.y }}
              className="absolute -left-6 sm:-left-10 bottom-4 z-20 hidden lg:block"
              data-speed="-0.06"
            >
              <motion.div
                onClick={() => openModal('aaqab')}
                className="rounded-2xl p-4 border flex flex-col items-center w-[125px] h-[175px] justify-between cursor-pointer hover:shadow-[#0E7A43]/10 hover:border-[#0E7A43]/30 transition-all duration-300 relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.10)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
                animate={{ y: [-6, 10, -6] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                whileHover={{ scale: 1.06 }}
              >
                <div className="flex-1 flex items-center justify-center p-1">
                  <img
                    src={aaqaab}
                    alt="AAQAAB"
                    className="h-28 w-auto object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
                  />
                </div>
                <span className="text-[#0a331c] font-bold text-[10px] bg-[#0E7A43]/12 px-2.5 py-0.5 rounded-full mt-1 border border-[#0E7A43]/18 z-10">
                  AAQAAB
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
