import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Users, Leaf, LayoutGrid, Shield,
  Handshake, Phone, ChevronDown, X,
  Globe, Facebook, Instagram, Youtube, Linkedin, MessageCircle, Sparkles
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import vitalAgroLogo from '@/assets/vital agro logo.webp';

const CATEGORIES = [
  { en: 'Seed Treatment',   ur: 'بیج کا علاج',           slug: 'seed-treatment'  },
  { en: 'Fungicides',       ur: 'پھپھوند کش ادویات',    slug: 'fungicide'       },
  { en: 'Herbicides',       ur: 'جڑی بوٹی مار ادویات',  slug: 'herbicide'       },
  { en: 'Insecticides',     ur: 'کیڑے مار ادویات',      slug: 'insecticide'     },
  { en: 'Plant Nutrition',  ur: 'پودوں کی غذائیت',      slug: 'plant-nutrition' },
  { en: 'Micronutrients',   ur: 'مائیکرو نیوٹرینٹس',   slug: 'plant-nutrition' },
  { en: 'Growth Promoters', ur: 'نمو بڑھانے والے',      slug: 'growth_promoter' },
];

const SOCIALS = [
  { name: 'Facebook',  url: 'https://web.facebook.com/profile.php?id=61574977847218',           Icon: Facebook  },
  { name: 'Instagram', url: 'https://www.instagram.com/vitalagro7/',                             Icon: Instagram },
  { name: 'YouTube',   url: 'https://youtube.com/@vitalagrofficial',                             Icon: Youtube   },
  { name: 'LinkedIn',  url: 'https://www.linkedin.com/company/vital-agro-chemical-industries/', Icon: Linkedin  },
];

// Lightweight 60 FPS CSS Animations block
const SidebarAtmosphereStyles = () => (
  <style>{`
    @keyframes sidebar-rise-particles {
      0% { transform: translateY(100%) scale(0.6); opacity: 0; }
      20% { opacity: 0.7; }
      80% { opacity: 0.7; }
      100% { transform: translateY(-100px) scale(1.1); opacity: 0; }
    }
    @keyframes sidebar-fog-sweep {
      0% { transform: translate(-10%, -10%) rotate(0deg); }
      50% { transform: translate(15%, 10%) rotate(180deg); }
      100% { transform: translate(-10%, -10%) rotate(360deg); }
    }
    @keyframes sidebar-light-ray {
      0% { transform: rotate(-35deg) translateX(-10%); opacity: 0.15; }
      50% { opacity: 0.28; }
      100% { transform: rotate(-35deg) translateX(10%); opacity: 0.15; }
    }
    @keyframes sidebar-leaf-drift {
      0% { transform: rotate(0deg) translate(0, 0); }
      50% { transform: rotate(180deg) translate(15px, 25px); }
      100% { transform: rotate(360deg) translate(0, 0); }
    }
    @keyframes sidebar-active-sweep {
      0% { transform: skewX(-20deg) translateX(-150%); }
      100% { transform: skewX(-20deg) translateX(300%); }
    }
    .sidebar-particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.45);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
      pointer-events: none;
    }
    .sidebar-leaf-deco {
      position: absolute;
      pointer-events: none;
      font-size: 16px;
      opacity: 0.12;
      filter: blur(0.5px);
    }
  `}</style>
);

export default function MobileSidebar({ open, onClose }) {
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const [productsOpen, setProductsOpen] = useState(false);
  const [catsOpen,     setCatsOpen]     = useState(false);
  const [langOpen,     setLangOpen]     = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Lock scroll when sidebar is open
  useEffect(() => {
    if (!open) return;
    const prevScroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevScroll; };
  }, [open]);

  const go = (path) => {
    navigate(path);
    onClose();
  };

  // Precise Active path checks
  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/';
    }
    if (path === '/dealer') {
      return pathname === '/contact' && location.search.includes('type=dealer');
    }
    if (path === '/contact') {
      return pathname === '/contact' && !location.search.includes('type=dealer');
    }
    if (path === '/__cats') {
      return pathname === '/products' && location.search.includes('category=');
    }
    if (path === '/products') {
      return pathname === '/products' && !location.search.includes('category=');
    }
    return pathname.startsWith(path);
  };

  const containerVars = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
  };

  const rowVars = {
    hidden: { opacity: 0, x: -30, scale: 0.94, filter: 'blur(6px)' },
    show:   {
      opacity: 1, x: 0, scale: 1, filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 240, damping: 20 },
    },
  };

  // Redesigned Menu row component (h-60px, rounded-2xl, Glass active pulses)
  const MenuRow = ({ navPath, Icon, label, accordion, open, onToggle, children, specialColor }) => {
    const active = isActive(navPath);
    const isSpecial = !!specialColor;

    return (
      <motion.div variants={rowVars} className="w-full">
        <div
          className={`
            w-full flex items-center justify-between cursor-default relative overflow-hidden h-[60px] rounded-2xl border
            transition-all duration-300 select-none
            ${active 
              ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400 font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.12)]' 
              : 'border-white/5 bg-white/[0.02] text-white/80 hover:text-white'
            }
          `}
        >
          {/* Left Clickable Area (Text + Icon): Navigates immediately */}
          <button
            type="button"
            onClick={() => {
              if (navPath === '/__cats') {
                onToggle();
              } else {
                go(navPath);
              }
            }}
            className="flex-1 h-full flex items-center gap-4 px-4 text-left cursor-pointer bg-transparent border-none outline-none select-none text-inherit font-inherit"
          >
            {/* Icon indicator */}
            <Icon
              className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}
              style={{
                strokeWidth: active ? 2.5 : 1.8,
                color: active ? '#10B981' : isSpecial ? specialColor : 'rgba(255,255,255,0.5)',
                filter: active ? 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' : 'none'
              }}
            />

            {/* Translation Name */}
            <span className="text-sm font-black tracking-wide">
              {label}
            </span>
          </button>

          {/* Right Clickable Area (Chevron Arrow): Toggles Accordion */}
          {accordion && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle();
              }}
              className="h-full w-14 flex items-center justify-center border-l border-white/5 hover:bg-white/5 text-white/50 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            </button>
          )}

          {/* Active outline pulse animation */}
          {active && (
            <motion.div 
              className="absolute inset-0 border border-emerald-400/40 rounded-2xl pointer-events-none"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          )}

          {/* Active menu sweep reflection */}
          {active && (
            <div 
              className="absolute inset-0 w-[45%] pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                animation: 'sidebar-active-sweep 3s infinite linear'
              }}
            />
          )}
        </div>

        {/* Sub-row Accordion slide animation */}
        {accordion && (
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="overflow-hidden bg-neutral-900/10"
              >
                <div className="pl-6 pt-1.5 pb-2 ml-4 border-l border-emerald-500/15 flex flex-col gap-1">
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    );
  };

  const SubRow = ({ path, label }) => (
    <button
      type="button"
      onClick={() => go(path)}
      className="flex items-center gap-3 w-full text-left py-2 text-xs font-bold text-white/50 hover:text-emerald-400 transition-colors duration-200 cursor-pointer bg-none border-none select-none"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 group-hover:bg-emerald-500 shrink-0" />
      <span>{label}</span>
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, visibility: 'hidden' }}
      animate={{ 
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        visibility: open ? 'visible' : 'hidden'
      }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex select-none"
    >
      <SidebarAtmosphereStyles />
      
      {/* Blurred background backdrop overlay - keeps page behind visible */}
      <motion.div
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/40 backdrop-blur-[6px]"
      />

      {/* 3D Glass Sidebar Panel */}
      <motion.div
        animate={{ 
          x: open ? 0 : '-100%', 
          opacity: open ? 1 : 0 
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="relative z-10 w-[85vw] max-w-[360px] h-full flex flex-col overflow-hidden rounded-r-3xl border-r border-white/10 shadow-2xl origin-left"
        style={{
          background: 'rgba(10, 18, 12, 0.55)',
          backdropFilter: 'blur(35px) saturate(180%) brightness(110%)',
          WebkitBackdropFilter: 'blur(35px) saturate(180%) brightness(110%)'
        }}
      >
        {/* Forest background layer */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.16] bg-cover bg-center"
          style={{ backgroundImage: "url('/all-bg-photo.png?v=3')" }}
        />

        {/* Ambient atmospheric layers */}
        {/* 1. Moving Fog */}
        <div 
          className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] pointer-events-none opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 60%)',
            animation: 'sidebar-fog-sweep 24s infinite linear'
          }}
        />

        {/* 2. Light Ray */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, transparent 40%, rgba(16,185,129,0.06) 50%, transparent 60%)',
            animation: 'sidebar-light-ray 8s infinite ease-in-out'
          }}
        />

        {/* 3. Floating Particles (60 FPS) */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const left = `${10 + Math.random() * 80}%`;
          const delay = `${Math.random() * 6}s`;
          const duration = `${5 + Math.random() * 7}s`;
          return (
            <div 
              key={idx}
              className="sidebar-particle"
              style={{
                left,
                bottom: 0,
                animation: `sidebar-rise-particles ${duration} infinite linear ${delay}`
              }}
            />
          );
        })}

        {/* 4. Swaying Leaves */}
        {Array.from({ length: 3 }).map((_, idx) => {
          const top = `${15 + idx * 25}%`;
          const right = idx % 2 === 0 ? '12px' : 'auto';
          const left = idx % 2 !== 0 ? '12px' : 'auto';
          const delay = `${idx * 1.5}s`;
          return (
            <span 
              key={idx}
              className="sidebar-leaf-deco"
              style={{
                top, right, left,
                animation: `sidebar-leaf-drift 10s infinite ease-in-out ${delay}`
              }}
            >
              🍃
            </span>
          );
        })}

        {/* SCROLLABLE INNER MENU */}
        <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-8 pb-6 flex flex-col min-h-0">
          
          {/* HEADER: Logo + tactile glass close button */}
          <div className="flex items-center justify-between mb-8 flex-shrink-0">
            <motion.div 
              onClick={() => go('/')}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <img 
                src={vitalAgroLogo} 
                alt="Vital Agro" 
                className="h-10 w-auto object-contain"
              />
            </motion.div>

            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{
                scale: 1.1,
                rotate: 90,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.4)'
              }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/10 text-white/70 transition-all duration-300 cursor-pointer"
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* NAVIGATION LINKS */}
          <motion.nav
            variants={containerVars}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2.5 flex-shrink-0"
          >
            <MenuRow navPath="/"        Icon={Home}      label={t.nav.home} />
            <MenuRow navPath="/about"   Icon={Users}     label={t.nav.about} />
            <MenuRow
              navPath="/products" Icon={Leaf}
              label={t.nav.products}
              accordion open={productsOpen} onToggle={() => setProductsOpen(p => !p)}
            >
              <SubRow path="/products"          label={t.showcase.viewAll} />
              {CATEGORIES.map(c => (
                <SubRow key={c.slug} path={`/products?category=${c.slug}`} label={t.categories[c.slug] || t.categories[c.slug.replace('-', '_')] || c.en} />
              ))}
            </MenuRow>
            <MenuRow
              navPath="/__cats" Icon={LayoutGrid}
              label={t.footer.categories || (lang === 'ur' ? 'اقسام' : 'Categories')}
              accordion open={catsOpen} onToggle={() => setCatsOpen(p => !p)}
            >
              {CATEGORIES.map(c => (
                <SubRow key={c.slug} path={`/products?category=${c.slug}`} label={t.categories[c.slug] || t.categories[c.slug.replace('-', '_')] || c.en} />
              ))}
            </MenuRow>
            <MenuRow navPath="/why-us"   Icon={Shield}    label={t.nav.whyUs} />
            <MenuRow navPath="/dealer"   Icon={Handshake} label={lang === 'ur' ? 'ڈیلر بنیں' : lang === 'pb' ? 'ڈیلر بنو' : 'Become Dealer'} specialColor="#10B981" />
            <MenuRow navPath="/contact"  Icon={Phone}     label={t.nav.contact} specialColor="#10B981" />
          </motion.nav>

          <div className="flex-1 min-h-[40px]" />

          {/* ACTION BUTTONS (WhatsApp, Get Quote, Language dropup) */}
          <div className="border-t border-white/10 pt-6 flex flex-col gap-4 flex-shrink-0">
            
            {/* Get Quote button - premium glowing gradient */}
            <motion.button
              type="button"
              onClick={() => go('/contact')}
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[52px] rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-neutral-950 font-black text-sm tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-none relative overflow-hidden"
            >
              <Sparkles size={16} className="text-neutral-950 shrink-0" />
              <span>{t.nav.getQuote}</span>
              <div 
                className="absolute inset-0 w-[45%]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                  animation: 'sidebar-active-sweep 4s infinite linear'
                }}
              />
            </motion.button>

            {/* WhatsApp - outline premium glass card */}
            <motion.a
              href="https://wa.me/923011837160"
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.5)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[52px] rounded-2xl bg-white/[0.02] border border-white/10 text-white/80 font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer no-underline"
            >
              <MessageCircle size={16} className="text-emerald-400" />
              <span>WhatsApp</span>
            </motion.a>

            {/* Language Selector Dropup Trigger */}
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-white/35 uppercase tracking-widest text-left">
                {lang === 'en' ? 'SELECT LANGUAGE' : 'زبان منتخب کریں'}
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangOpen(p => !p)}
                  className="w-full h-[46px] rounded-2xl bg-white/[0.02] border border-white/10 text-white/80 text-xs font-bold flex items-center justify-between px-4 cursor-pointer transition-colors hover:border-white/20 select-none"
                >
                  <span className="flex items-center gap-2">
                    <Globe size={14} className="text-emerald-400" />
                    {lang === 'en' ? 'English (EN)' : lang === 'ur' ? 'اردو (UR)' : 'پنجابی (PB)'}
                  </span>
                  <motion.div animate={{ rotate: langOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="opacity-50" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 right-0 bottom-[calc(100%+8px)] z-50 p-1.5 rounded-2xl bg-[#090f0a]/95 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col gap-1"
                    >
                      {[
                        { code: 'en', label: '🇬🇧 English (EN)' },
                        { code: 'ur', label: '🇵🇰 اردو (UR)' },
                        { code: 'pb', label: '🇵🇰 پنجابی (PB)' }
                      ].map(item => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => { setLang(item.code); setLangOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black flex items-center justify-between cursor-pointer ${
                            lang === item.code ? 'bg-emerald-500/10 text-emerald-400' : 'bg-transparent text-white/60 hover:bg-white/5'
                          }`}
                        >
                          <span>{item.label}</span>
                          {lang === item.code && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-white/35 uppercase tracking-widest text-left">
                {lang === 'ur' ? 'سوشل میڈیا' : 'FOLLOW US'}
              </span>
              <div className="flex gap-2.5">
                {SOCIALS.map(({ name, url, Icon }) => (
                  <motion.a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={name}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.4)', color: '#10B981' }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/10 text-white/50 flex items-center justify-center cursor-pointer transition-all duration-300"
                  >
                    <Icon size={16} />
                  </motion.a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
