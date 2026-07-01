import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingButtons from './FloatingButtons';
import ScrollToTop from '../ScrollToTop';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileBottomNav } from './MobileBottomNav';
import BiotechParticles from './BiotechParticles';
import TopTicker from './TopTicker';
import IntroVideoModal from './IntroVideoModal';
import GlobalSearchOverlay from './GlobalSearchOverlay';

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bioluminescent-grid text-emerald-950 relative">
      <BiotechParticles />
      {/* Subtle Volumetric Light Blobs for Premium Aesthetic */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-[#0E7A43]/[0.025] blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[30%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[#0E7A43]/[0.02] blur-[160px] mix-blend-screen animate-pulse" style={{ animationDuration: '18s' }} />
        <div className="absolute bottom-[-10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-[#0E7A43]/[0.025] blur-[140px] mix-blend-screen animate-pulse" style={{ animationDuration: '15s' }} />
      </div>
      <ScrollToTop />
      <TopTicker />
      <Navbar />
      <main className="flex-1 relative overflow-x-hidden pb-20 md:pb-0 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <FloatingButtons />
      <MobileBottomNav />
      <IntroVideoModal />
      <GlobalSearchOverlay />
    </div>
  );
}