const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, ArrowUpRight, Mail, Clock, ArrowUp, Check, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import vitalAgroLogo from '@/assets/vital agro logo.webp';
import vitalGroupLogo from '@/assets/vital group.webp';
import tagLogo from '@/assets/tag logo.webp';

// Custom modern leaf vector icon for premium 3D Leaf System
const LeafIcon = ({ className, color = "#76C945" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 5.5a7 7 0 0 1-10 12.5z" fill={`${color}22`} />
    <path d="M19 2c-2.26 4.33-5.27 7.14-8 10" />
  </svg>
);

export default function Footer() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardTilt, setCardTilt] = useState({ index: null, x: 0, y: 0 });
  const [dealerState, setDealerState] = useState('idle'); // 'idle' | 'loading' | 'success'

  // Cursor Parallax Tracker relative to the footer container
  useEffect(() => {
    const handleMouseMove = (e) => {
      const footer = document.getElementById('premium-footer');
      if (!footer) return;
      const rect = footer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCardMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCardTilt({ index, x: x * 10, y: y * 10 });
  };

  const handleCardLeave = () => {
    setCardTilt({ index: null, x: 0, y: 0 });
  };

  const handleDealerClick = async (e) => {
    e.preventDefault();
    if (dealerState !== 'idle') return;

    setDealerState('loading');
    await new Promise(r => setTimeout(r, 1600));
    setDealerState('success');
    
    setTimeout(() => {
      setDealerState('idle');
      navigate('/contact?type=dealer');
    }, 1500);
  };

  const QUICK_LINKS = [
    { label: t.nav.about, path: '/about' },
    { label: t.nav.products, path: '/products' },
    { label: t.nav.whyUs, path: '/why-us' },
    { label: t.nav.contact, path: '/contact' },
  ];

  const FOOTER_CATEGORIES = [
    { slug: 'insecticide', key: 'insecticide' },
    { slug: 'herbicide', key: 'herbicide' },
    { slug: 'fungicide', key: 'fungicide' },
    { slug: 'plant-nutrition', key: 'plant-nutrition' },
    { slug: 'seed-treatment', key: 'seed-treatment' },
  ];

  const SOCIAL_LINKS = [
    { id: 'whatsapp', url: 'https://wa.me/923011837160', colorClass: 'hover:bg-[#25D366] hover:shadow-[#25D366]/30', label: 'WhatsApp', svgPath: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
    { id: 'facebook', url: 'https://facebook.com/vitalagro', colorClass: 'hover:bg-[#1877F2] hover:shadow-[#1877F2]/30', label: 'Facebook', svgPath: 'M9 8H7v3h2v9h4v-9h3.6l.4-3h-4V6.5c0-.8.2-1 1-1h3V1h-4.2C10 1 9 2.5 9 5v3z' },
    { id: 'instagram', url: 'https://instagram.com/vitalagro', colorClass: 'hover:bg-[#E1306C] hover:shadow-[#E1306C]/30', label: 'Instagram', svgPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
    { id: 'linkedin', url: 'https://linkedin.com/company/vital-agro', colorClass: 'hover:bg-[#0077B5] hover:shadow-[#0077B5]/30', label: 'LinkedIn', svgPath: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z' },
    { id: 'youtube', url: 'https://youtube.com/vitalagro', colorClass: 'hover:bg-[#FF0000] hover:shadow-[#FF0000]/30', label: 'YouTube', svgPath: 'M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' }
  ];

  return (
    <footer 
      id="premium-footer"
      role="contentinfo" 
      aria-label="Vital Agro Enterprise Footer"
      className="relative text-emerald-950 overflow-hidden pt-36 transition-colors duration-500 z-10"
      style={{
        background: `radial-gradient(circle at 50% 120%, rgba(118, 201, 69, 0.12) 0%, #030805 100%)`,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 3rem)'
      }}
    >
      {/* Curved top divider transition */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-background rounded-b-[40px] z-10" />

      {/* Decorative Particle Backdrop Engine */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-40">
        <div className="absolute w-[600px] h-[600px] bg-[#76C945]/5 rounded-full blur-[120px] -bottom-48 -left-48" />
        <div className="absolute w-[600px] h-[600px] bg-[#C5A059]/5 rounded-full blur-[120px] -bottom-48 -right-48" />
        
        {/* Animated Dust Loops — reduced to 5 for performance */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#8AD65A]/20"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 12}%`,
              animation: `float-badge ${8 + i * 3}s infinite ease-in-out`,
              animationDelay: `${i * 1.2}s`
            }}
          />
        ))}
      </div>

      {/* Simplified 3D Floating Leaf System */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { size: 28, x: "12%", y: "25%", delay: 0, speed: 7 },
          { size: 36, x: "78%", y: "18%", delay: 1.5, speed: 8 },
          { size: 30, x: "50%", y: "60%", delay: 3, speed: 7.5 },
        ].map((leaf, idx) => (
          <div
            key={idx}
            className="absolute opacity-[0.05]"
            style={{
              left: leaf.x,
              top: leaf.y,
              animation: `float-badge ${leaf.speed}s infinite ease-in-out`,
              animationDelay: `${leaf.delay}s`,
            }}
          >
            <LeafIcon 
              className="drop-shadow-[0_0_15px_#76C945]" 
              style={{ width: leaf.size, height: leaf.size }} 
            />
          </div>
        ))}
      </div>

      {/* Subtle Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Asymmetric 12-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-16 items-stretch">
          
          {/* Card 1: Logo & Brand Area (lg:col-span-4) */}
          <div 
            onMouseMove={(e) => handleCardMove(e, 1)}
            onMouseLeave={handleCardLeave}
            className="lg:col-span-4 p-6 rounded-[28px] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-emerald-900/10 backdrop-blur-3xl flex flex-col justify-between relative overflow-hidden group shadow-2xl transition-all duration-300"
            style={{
              transform: cardTilt.index === 1 ? `perspective(1000px) rotateX(${cardTilt.y * -1}deg) rotateY(${cardTilt.x}deg) translateZ(10px)` : 'none',
              boxShadow: cardTilt.index === 1 ? '0 25px 55px rgba(0,0,0,0.65), 0 0 20px rgba(118,201,69,0.15)' : 'none',
              transition: cardTilt.index === 1 ? 'none' : 'all 0.5s ease'
            }}
          >
            {/* Dynamic Card Internal Sheen sweep */}
            <motion.div
              animate={{ x: ['-150%', '250%'] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.5 }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
            />

            <div>
              {/* Dual Logo Container */}
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur-md rounded-xl px-3.5 py-2 border border-emerald-900/5 shadow-md shadow-black/35 hover:scale-105 transition-transform duration-300">
                  <img
                    src={vitalAgroLogo}
                    alt="Vital Agro Logo"
                    className="h-10 w-auto object-contain drop-shadow"
                    loading="lazy"
                  />
                </div>
                <span className="h-6 w-px bg-white/15" />
                <div className="bg-white/60 backdrop-blur-md rounded-xl px-3 py-2 border border-emerald-900/5 shadow-sm hover:scale-105 transition-transform duration-300">
                  <img
                    src={vitalGroupLogo}
                    alt="Vital Group Logo"
                    className="h-8 w-auto object-contain drop-shadow"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Tagline Reveal */}
              <p className="text-neutral-600 text-sm leading-relaxed mb-6 font-medium pr-2">
                {t.footer.desc}
              </p>
            </div>

            {/* Social Icons Card Embedded */}
            <div className="space-y-3 mt-4">
              <span className="text-[9px] font-black tracking-widest text-emerald-700 uppercase block">Follow Our Nodes</span>
              <div className="flex gap-2.5">
                {SOCIAL_LINKS.map((social) => (
                  <motion.a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.12, rotate: 8 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 rounded-full bg-white/60 border border-emerald-900/10 flex items-center justify-center text-neutral-600 hover:text-emerald-950 transition-all duration-300 ${social.colorClass}`}
                    aria-label={`Follow us on ${social.label}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.svgPath} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Quick Links (lg:col-span-2) */}
          <div
            onMouseMove={(e) => handleCardMove(e, 2)}
            onMouseLeave={handleCardLeave}
            className="lg:col-span-2 p-6 rounded-[28px] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-emerald-900/10 backdrop-blur-3xl flex flex-col justify-between relative overflow-hidden group shadow-2xl transition-all duration-300"
            style={{
              transform: cardTilt.index === 2 ? `perspective(1000px) rotateX(${cardTilt.y * -1}deg) rotateY(${cardTilt.x}deg) translateZ(10px)` : 'none',
              boxShadow: cardTilt.index === 2 ? '0 25px 55px rgba(0,0,0,0.65), 0 0 20px rgba(118,201,69,0.1)' : 'none',
              transition: cardTilt.index === 2 ? 'none' : 'all 0.5s ease'
            }}
          >
            <div>
              <h4 className="text-xs font-black tracking-widest uppercase text-emerald-700 mb-6">{t.footer.quickLinks}</h4>
              <ul className="space-y-4">
                {QUICK_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-neutral-600 hover:text-emerald-950 text-sm transition-all duration-300 flex items-center gap-2 group/link select-none"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#76C945]/40 group-hover/link:bg-[#76C945] group-hover/link:scale-125 transition-all" />
                      <span className="group-hover/link:translate-x-1.5 transition-transform duration-300 flex items-center gap-1">
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 scale-75 group-hover/link:opacity-100 group-hover/link:scale-100 transition-all duration-300" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 3: Categories Pills (lg:col-span-3) */}
          <div
            onMouseMove={(e) => handleCardMove(e, 3)}
            onMouseLeave={handleCardLeave}
            className="lg:col-span-3 p-6 rounded-[28px] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-emerald-900/10 backdrop-blur-3xl flex flex-col justify-between relative overflow-hidden group shadow-2xl transition-all duration-300"
            style={{
              transform: cardTilt.index === 3 ? `perspective(1000px) rotateX(${cardTilt.y * -1}deg) rotateY(${cardTilt.x}deg) translateZ(10px)` : 'none',
              boxShadow: cardTilt.index === 3 ? '0 25px 55px rgba(0,0,0,0.65), 0 0 20px rgba(118,201,69,0.1)' : 'none',
              transition: cardTilt.index === 3 ? 'none' : 'all 0.5s ease'
            }}
          >
            <div>
              <h4 className="text-xs font-black tracking-widest uppercase text-emerald-700 mb-5">{t.footer.categories}</h4>
              <div className="flex flex-wrap gap-2.5">
                {FOOTER_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/products?category=${cat.slug}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/60 border border-emerald-900/5 text-neutral-700 hover:bg-gradient-to-r hover:from-[#76C945] hover:to-[#5cb85c] hover:text-[#0A2E1F] hover:border-[#76C945] hover:shadow-[0_0_15px_rgba(118,201,69,0.35)] transition-all duration-300 transform hover:scale-105"
                  >
                    {t.categories[cat.key] || cat.slug}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="text-[10px] text-neutral-500 font-mono mt-6">
              VITAL AGRO INDEX SYSTEM v11
            </div>
          </div>

          {/* Card 4: Contact & Hours (lg:col-span-3) */}
          <div
            onMouseMove={(e) => handleCardMove(e, 4)}
            onMouseLeave={handleCardLeave}
            className="lg:col-span-3 p-6 rounded-[28px] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-emerald-900/10 backdrop-blur-3xl flex flex-col justify-between relative overflow-hidden group shadow-2xl transition-all duration-300"
            style={{
              transform: cardTilt.index === 4 ? `perspective(1000px) rotateX(${cardTilt.y * -1}deg) rotateY(${cardTilt.x}deg) translateZ(10px)` : 'none',
              boxShadow: cardTilt.index === 4 ? '0 25px 55px rgba(0,0,0,0.65), 0 0 20px rgba(118,201,69,0.1)' : 'none',
              transition: cardTilt.index === 4 ? 'none' : 'all 0.5s ease'
            }}
          >
            <div className="space-y-4">
              <h4 className="text-xs font-black tracking-widest uppercase text-emerald-700 mb-2">{t.footer.contact}</h4>
              
              <ul className="space-y-3.5">
                {/* Location */}
                <li className="flex gap-3 text-xs items-start group/contact">
                  <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center shrink-0 border border-emerald-900/5 group-hover/contact:bg-[#76C945]/15 group-hover/contact:border-[#76C945]/20 transition-all duration-300">
                    <MapPin className="w-4 h-4 text-neutral-500 group-hover/contact:text-emerald-600 transition-colors" />
                  </div>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Plot+No.+50+%26+56%2C+Vital+Office%2C+Haroonabad%2C+Distt.+Bahawalnagar%2C+Pakistan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-600 hover:text-emerald-950 leading-relaxed font-semibold hover:underline"
                  >
                    Plot 50 & 56, Vital Office, Haroonabad, Bahawalnagar, Pakistan
                  </a>
                </li>

                {/* Phone */}
                <li className="flex gap-3 text-xs items-center group/contact">
                  <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center shrink-0 border border-emerald-900/5 group-hover/contact:bg-[#76C945]/15 group-hover/contact:border-[#76C945]/20 transition-all duration-300">
                    <Phone className="w-4 h-4 text-neutral-500 group-hover/contact:text-emerald-600 transition-colors" />
                  </div>
                  <a href="tel:+920632253137" className="text-neutral-600 hover:text-emerald-950 leading-none font-mono font-bold">
                    063-2253137
                  </a>
                </li>

                {/* Email */}
                <li className="flex gap-3 text-xs items-center group/contact">
                  <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center shrink-0 border border-emerald-900/5 group-hover/contact:bg-[#76C945]/15 group-hover/contact:border-[#76C945]/20 transition-all duration-300">
                    <Mail className="w-4 h-4 text-neutral-500 group-hover/contact:text-emerald-600 transition-colors" />
                  </div>
                  <a href="mailto:info@vitalagro.com.pk" className="text-neutral-600 hover:text-emerald-950 leading-none font-semibold">
                    info@vitalagro.com.pk
                  </a>
                </li>

                {/* Working Hours */}
                <li className="flex gap-3 text-xs items-center group/contact">
                  <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center shrink-0 border border-emerald-900/5">
                    <Clock className="w-4 h-4 text-neutral-500" />
                  </div>
                  <span className="text-neutral-600 font-semibold leading-tight">
                    Mon - Sat: 9 AM - 6 PM
                  </span>
                </li>
              </ul>
            </div>

            {/* Premium 3D Dealer CTA Button */}
            <div className="mt-5 relative">
              <motion.button
                onClick={handleDealerClick}
                disabled={dealerState !== 'idle'}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative overflow-hidden py-3 rounded-2xl bg-gradient-to-r from-[#76C945] to-[#5cb85c] hover:shadow-[0_0_20px_rgba(118,201,69,0.35)] text-[#0A2E1F] font-black text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                {/* Liquid Sweep glare */}
                <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full animate-[shimmer_3s_infinite]" />

                {dealerState === 'idle' && (
                  <>
                    <span>Become a Dealer</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}

                {dealerState === 'loading' && (
                  <>
                    <RefreshCw size={14} className="animate-spin text-[#0A2E1F]" />
                    <span>Connecting...</span>
                  </>
                )}

                {dealerState === 'success' && (
                  <>
                    <Check size={14} className="text-[#0A2E1F] font-black" />
                    <span>SUCCESS ✓</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

        </div>

        {/* Dynamic Certification Badges Card Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-stretch">
          {/* TAG Certification Badge Card */}
          <div 
            onMouseMove={(e) => handleCardMove(e, 5)}
            onMouseLeave={handleCardLeave}
            className="md:col-span-2 p-5 rounded-[26px] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-emerald-900/10 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative group shadow-xl"
            style={{
              transform: cardTilt.index === 5 ? `perspective(1000px) rotateX(${cardTilt.y * -0.6}deg) rotateY(${cardTilt.x * 0.6}deg) translateZ(5px)` : 'none',
              boxShadow: cardTilt.index === 5 ? '0 20px 45px rgba(0,0,0,0.5), 0 0 25px rgba(118,201,69,0.08)' : 'none',
              transition: cardTilt.index === 5 ? 'none' : 'all 0.5s ease'
            }}
          >
            <div className="space-y-2 text-center sm:text-left">
              <span className="px-2.5 py-0.5 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/25 text-[#C5A059] text-[9px] font-black uppercase tracking-widest inline-block">
                Verified Quality Standard
              </span>
              <h4 className="text-sm font-extrabold text-emerald-950">ISO 9001:2015 Certification</h4>
              <p className="text-[10px] text-neutral-500 leading-relaxed max-w-md">
                Our raw chemicals are certified for chemical compositions, active ingredients density, and organic environmental safety parameters.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/60 border border-emerald-900/5 rounded-2xl p-3 shadow-inner">
              <div className="bg-white/80 rounded-xl px-2 py-1 flex items-center justify-center shrink-0">
                <img
                  src={tagLogo}
                  alt="TAG Certification Badge Logo"
                  className="h-8 w-auto object-contain drop-shadow"
                  loading="lazy"
                />
              </div>
              <div className="text-left font-mono">
                <span className="text-[8px] text-neutral-400 block font-black">CERTIFICATE NO</span>
                <span className="text-xs font-black text-emerald-950">TAG-9001-QA</span>
              </div>
            </div>
          </div>

          {/* Group Node Membership card */}
          <div 
            onMouseMove={(e) => handleCardMove(e, 6)}
            onMouseLeave={handleCardLeave}
            className="p-5 rounded-[26px] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-emerald-900/10 backdrop-blur-2xl flex flex-col justify-between overflow-hidden relative group shadow-xl"
            style={{
              transform: cardTilt.index === 6 ? `perspective(1000px) rotateX(${cardTilt.y * -0.6}deg) rotateY(${cardTilt.x * 0.6}deg) translateZ(5px)` : 'none',
              boxShadow: cardTilt.index === 6 ? '0 20px 45px rgba(0,0,0,0.5), 0 0 25px rgba(197,160,89,0.08)' : 'none',
              transition: cardTilt.index === 6 ? 'none' : 'all 0.5s ease'
            }}
          >
            <div className="space-y-1">
              <span className="text-[9px] font-black tracking-widest text-emerald-600 uppercase block">Corporation Node</span>
              <h5 className="text-xs font-extrabold text-emerald-950">Member of Vital Group</h5>
            </div>
            
            <p className="text-[10px] text-neutral-500 leading-normal my-2.5">
              Leveraging massive national logistical reach and agricultural retail networks across Punjab and Sindh.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-900/5 font-mono text-[9px] text-emerald-600 font-black">
              <span>EST. 2011</span>
              <span>HAROONABAD, PK</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright divider & Company Info strip */}
        <div className="border-t border-emerald-900/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-5 relative z-10">
          <p className="text-neutral-500 text-xs font-semibold select-none">
            &copy; {new Date().getFullYear()} Vital Agro Chemical Industries (Pvt.) Ltd. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 bg-white/80 border border-emerald-900/5 rounded-full px-4.5 py-1.5 shadow-sm">
            <div className="bg-white/15 rounded-md px-1.5 py-0.5 shrink-0 flex items-center justify-center">
              <img src={vitalAgroLogo} alt="VA" className="h-5 w-auto drop-shadow-sm" loading="lazy" />
            </div>
            <p className="text-neutral-500 text-[10px] uppercase tracking-wider font-mono">
              {t.footer.tagline}
            </p>
          </div>
        </div>

      </div>

      {/* 3D Glass Scroll-to-Top Floating Orb */}
      <ScrollToTopOrb />

      {/* SEO Embedded Local Business Schema Metas */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AgrochemicalsStore",
          "name": "Vital Agro Chemical Industries",
          "image": "https://vital-agro.vercel.app/vital-logo.png",
          "@id": "https://vital-agro.vercel.app/#organization",
          "url": "https://vital-agro.vercel.app",
          "telephone": "063-2253137",
          "priceRange": "$$",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Plot No. 50 & 56, Vital Office",
            "addressLocality": "Haroonabad",
            "addressRegion": "Bahawalnagar",
            "postalCode": "62300",
            "addressCountry": "PK"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "063-2253137",
            "contactType": "customer service",
            "areaServed": "PK",
            "availableLanguage": ["English", "Urdu"]
          }
        })}
      </script>
    </footer>
  );
}

// 3D Glass Scroll to Top Orb Component
function ScrollToTopOrb() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-black/60 border border-emerald-900/20 flex items-center justify-center backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:border-[#76C945] hover:shadow-[0_0_20px_#76C945] transition-all cursor-pointer z-50 text-emerald-950 group"
          aria-label="Scroll to top of the page"
        >
          {/* Circular ping animation */}
          <div className="absolute inset-0 rounded-full border border-[#76C945]/30 group-hover:animate-ping opacity-0 group-hover:opacity-100 transition-all" />
          <motion.div
            animate={hovered ? { y: [0, -3, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          >
            <ArrowUp className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}