import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';
import { useApp } from '@/contexts/AppContext';
import vitalAgroLogo from '@/assets/vital agro logo.webp';
import MobileSidebar from './MobileSidebar';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { pathname } = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { cartCount, setIsCartOpen } = useCart();
  const { setIsGlobalSearchOpen } = useApp();
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    if (!isLangOpen) return;
    const handleClose = () => setIsLangOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isLangOpen]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);
  const closeMenu  = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      {/* ════════════════════════════════════════════════════
          PREMIUM 3D FLOATING GLASS NAVBAR
      ════════════════════════════════════════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -32, rotateX: -12, top: 44 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: 0,
          top: scrolled ? 12 : 44,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          left: 12,
          right: 12,
          zIndex: 500,
          perspective: '1200px',
        }}
      >
        {/* 3D glass pill — outer wrapper for perspective */}
        <motion.div
          animate={scrolled
            ? { y: -2, scale: 0.985 }
            : { y: 0, scale: 1 }
          }
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            borderRadius: 22,
            overflow: 'hidden',
            /* Premium Frosted Glass Navbar */
            background: 'rgba(248, 250, 248, 0.65)',
            backdropFilter: 'blur(24px) saturate(170%)',
            WebkitBackdropFilter: 'blur(24px) saturate(170%)',
            border: '1px solid rgba(15, 123, 59, 0.08)',
            boxShadow: [
              '0 4px 20px rgba(0,0,0,0.04)',
              '0 1px 3px rgba(15,123,59,0.04)',
              'inset 0 1px 0 rgba(255,255,255,0.45)',
            ].join(', '),
          }}
        >
          {/* Grain texture */}
          <div className="noise-overlay" />

          {/* Leaf bleed-through - rich greenery background */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: "url('/all-bg-photo.png?v=3')",
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.06,
          }} />

          {/* Glass highlight */}
          <div style={{
            position: 'absolute', top: 0, left: '15%', right: '15%',
            height: 1, pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
          }} />

          {/* ── Nav row ── */}
          <div style={{
            position: 'relative', zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: 64, paddingLeft: 16, paddingRight: 16,
          }}>

            {/* LEFT — Hamburger */}
            <motion.button
              type="button"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.90 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 5, width: 42, height: 42,
                cursor: 'pointer', flexShrink: 0, background: 'none', border: 'none', padding: 0,
              }}
            >
              {[
                { rotate: menuOpen ? 45  : 0,  y: menuOpen ? 7  : 0 },
                { opacity: menuOpen ? 0  : 1,  scaleX: menuOpen ? 0 : 1 },
                { rotate: menuOpen ? -45 : 0,  y: menuOpen ? -7 : 0 },
              ].map((anim, i) => (
                <motion.span
                  key={i}
                  animate={anim}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'block', width: 22, height: 2.5,
                    background: '#0a331c', borderRadius: 99,
                    transformOrigin: 'center',
                  }}
                />
              ))}
            </motion.button>

            {/* CENTER — Logo */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              display: 'flex', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <Link to="/" style={{ pointerEvents: 'auto' }}>
                <motion.img
                  src={vitalAgroLogo}
                  alt="Vital Agro"
                  whileHover={{ scale: 1.06, filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.55))' }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  style={{
                    height: isMobile ? 28 : 42, width: 'auto', objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                    cursor: 'pointer',
                  }}
                />
              </Link>
            </div>

            {/* RIGHT — Cart + Quote */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12, flexShrink: 0, position: 'relative', zIndex: 2 }}>

              {/* Language Selector Dropdown */}
              <div className="relative flex items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLangOpen(p => !p);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.45)',
                    border: '1px solid rgba(14, 122, 67, 0.12)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-extrabold uppercase text-[#0a331c] hover:bg-white/85 transition-all cursor-pointer shadow-sm animate-pulse-subtle"
                >
                  <span>{lang === 'en' ? '🇬🇧 EN' : lang === 'ur' ? '🇵🇰 اردو' : '🇵🇰 پب'}</span>
                  <span className="text-[6px] sm:text-[7px] opacity-60">▼</span>
                </motion.button>
                
                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        border: '1px solid rgba(14, 122, 67, 0.15)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      }}
                      className="absolute right-0 top-full mt-2 w-28 rounded-xl py-1 shadow-xl z-50 flex flex-col overflow-hidden"
                    >
                      {[
                        { code: 'en', label: '🇬🇧 EN' },
                        { code: 'ur', label: '🇵🇰 اردو' },
                        { code: 'pb', label: '🇵🇰 پب' },
                      ].map((l) => (
                        <button
                          key={l.code}
                          onClick={() => {
                            setLang(l.code);
                            setIsLangOpen(false);
                          }}
                          className={`px-4 py-2.5 text-left text-[11px] font-extrabold hover:bg-[#0E7A43]/10 transition-colors cursor-pointer ${
                            lang === l.code ? 'text-[#0E7A43]' : 'text-[#0a331c]/70'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Global Search Button */}
              <motion.button
                type="button"
                onClick={() => setIsGlobalSearchOpen(prev => !prev)}
                aria-label="Search"
                whileHover={{ scale: 1.12, y: -1 }}
                whileTap={{ scale: 0.92 }}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <Search style={{ width: 22, height: 22, color: '#0a331c', strokeWidth: 1.8 }} />
              </motion.button>

              {/* Cart */}
              <motion.button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="Cart"
                whileHover={{ scale: 1.12, y: -1 }}
                whileTap={{ scale: 0.92 }}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <ShoppingCart style={{ width: 22, height: 22, color: '#0a331c', strokeWidth: 1.8 }} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 18, height: 18, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 900, color: '#fff',
                      background: 'linear-gradient(135deg, #18C964, #0E7A43)',
                      boxShadow: '0 0 8px rgba(14, 122, 67, 0.3)',
                    }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
 
              {/* Get Quote */}
              {!isMobile && (
                <Link to="/contact">
                  <motion.span
                    whileHover={{
                      scale: 1.04, y: -2,
                      boxShadow: '0 8px 28px rgba(24, 201, 100, 0.55)',
                    }}
                    whileTap={{ scale: 0.95, y: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      height: 40, paddingLeft: 16, paddingRight: 16, borderRadius: 12,
                      background: 'linear-gradient(155deg, #18C964 0%, #0E7A43 55%, #073B20 100%)',
                      color: '#fff', fontWeight: 700, fontSize: 13.5,
                      cursor: 'pointer', whiteSpace: 'nowrap',
                      boxShadow: '0 4px 16px rgba(14, 122, 67, 0.25), inset 0 1px 0 rgba(255,255,255,0.18)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {t.nav.getQuote}
                  </motion.span>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Sidebar — outside nav to avoid clipping */}
      <MobileSidebar open={menuOpen} onClose={closeMenu} />
    </>
  );
}