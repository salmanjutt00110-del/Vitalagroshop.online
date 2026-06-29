import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Leaf } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import useVideoAutoplay from '@/hooks/useVideoAutoplay';
import PremiumButton from '@/components/ui/PremiumButton';
import AnimatedText from '@/components/ui/AnimatedText';
import vitalCImg from '@/assets/Vital-C.webp';

// Import Assets
import vitalBg from '@/assets/vital bg.mp4';
import vitalBgWebm from '@/assets/vital_bg.webm';
import vitalBgPoster from '@/assets/vital_bg_poster.webp';

export default function CTASection() {
  const { t } = useLanguage();
  const videoRef = useRef(null);
  useVideoAutoplay(videoRef);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const whatsappText = encodeURIComponent("Hello Vital Agro,\n\nI am interested in your agricultural products and solutions. Please provide more details.\n\nThank you.");
  const whatsappUrl = `https://wa.me/923011837160?text=${whatsappText}`;

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Looping Ambient Video Background */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={vitalBgPoster}
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ objectFit: 'cover' }}
          >
            <source src={vitalBgWebm} type="video/webm" />
            <source src={vitalBg} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2E1F]/95 via-[#0A2E1F]/90 to-[#0A2E1F]/80 z-[1]" />

          {/* Floating leaves */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${15 + i * 18}%`,
                  top: `${20 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [-10, 15, -10],
                  rotate: [0, 10, -5, 0],
                  opacity: [0.1, 0.25, 0.1],
                }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
              >
                <Leaf className="w-6 h-6 text-[#76C945]/30" />
              </motion.div>
            ))}
          </div>

          {/* Grid Content layout with visual showcase */}
          <div className="relative px-8 sm:px-12 md:px-16 py-16 md:py-20 text-left z-10 grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left text column */}
            <div className="lg:col-span-7 space-y-6">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block text-xs font-black tracking-widest uppercase text-[#76C945]"
              >
                Partner With Us
              </motion.span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                <AnimatedText text={t.cta.title} />
              </h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="text-white/70 text-base sm:text-lg max-w-xl"
              >
                {t.cta.desc}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 items-center pt-2"
              >
                <PremiumButton variant="primary" href={whatsappUrl} target="_blank" rel="noopener noreferrer" isMagnetic={true}>
                  {t.cta.btnGetInTouch}
                </PremiumButton>
                <PremiumButton variant="secondary" href="tel:+920632253137" isMagnetic={true} showArrow={false}>
                  <Phone className="w-4 h-4 mr-1.5 inline-block" />
                  {t.cta.btnCallNow}
                </PremiumButton>
              </motion.div>
            </div>

            {/* Right visual column (Vital-C Integration) */}
            <div className="lg:col-span-5 flex justify-center items-center relative py-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative aspect-square w-full max-w-[280px] flex items-center justify-center"
              >
                {/* Back glowing aura */}
                <div className="absolute w-44 h-44 bg-[#76C945]/20 rounded-full blur-[45px] pointer-events-none" />
                <div className="absolute bottom-0 w-[70%] h-4 bg-black/45 rounded-full blur-[8px]" />
                <motion.img
                  src={vitalCImg}
                  alt="Vital-C Premium Bottle"
                  className="max-h-[240px] w-auto object-contain z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                />
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}