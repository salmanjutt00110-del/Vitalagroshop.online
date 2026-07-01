import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Microscope, HeartHandshake } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import useVideoAutoplay from '@/hooks/useVideoAutoplay';
import GlassCard from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import AnimatedText from '@/components/ui/AnimatedText';

// Import Assets
import vitalBg from '@/assets/vital bg.mp4';
import vitalBgWebm from '@/assets/vital_bg.webm';
import vitalBgPoster from '@/assets/vital_bg_poster.webp';
import vitalAgroLogo from '@/assets/vital agro logo.webp';
import tagLogo from '@/assets/tag logo.webp';

export default function AboutPreview() {
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

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent via-[#0E7A43]/[0.01] to-transparent">
      {/* Ambient background glow */}
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-[#0E7A43]/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center perspective-container">
          
          {/* Video / Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Glass container for video */}
            <GlassCard
              tilt={true}
              maxTilt={12}
              glow={true}
              lift={true}
              whileHover={{ 
                scale: 1.02, 
                translateZ: 40,
                boxShadow: "0 30px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(15, 123, 59, 0.15)",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-emerald-900/20"
            >
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={vitalBgPoster}
                className="w-full h-full object-cover"
                style={{ objectFit: 'cover' }}
              >
                <source src={vitalBgWebm} type="video/webm" />
                <source src={vitalBg} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[#0A2E1F]/20 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A2E1F]/40 to-transparent" />
            </GlassCard>

            {/* Floating Years Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="absolute -bottom-6 -right-6 z-10"
            >
              <GlassCard
                tilt={true}
                maxTilt={12}
                whileHover={{ 
                  scale: 1.08, 
                  translateZ: 50, 
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)" 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/40 flex flex-col justify-center text-center w-36"
              >
                <div className="text-3xl font-black text-[#0A2E1F]">15+</div>
                <div className="text-xs text-muted-foreground font-black uppercase tracking-wider mt-1">{t.about.yearsExcellence}</div>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Text / Info Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Logo Cluster */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={vitalAgroLogo}
                alt="Vital Agro Logo"
                className="h-9 w-auto object-contain"
              />
              <span className="h-5 w-px bg-border" />
              <img
                src={tagLogo}
                alt="Tag Logo"
                className="h-7 w-auto object-contain"
              />
            </div>

            <span className="text-xs font-black tracking-widest uppercase text-emerald-700 block mb-2">{t.about.badge}</span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mt-2 mb-6 leading-tight">
              <AnimatedText text={t.about.title} />
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {t.about.desc}
            </p>

            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {[
                { icon: Shield, title: t.about.qualityTitle, desc: t.about.qualityDesc },
                { icon: Microscope, title: t.about.researchTitle, desc: t.about.researchDesc },
                { icon: HeartHandshake, title: t.about.supportTitle, desc: t.about.supportDesc },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-[#0E7A43]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h4 className="font-extrabold text-[#0A2E1F] text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex">
              <PremiumButton variant="secondary" href="/about" isMagnetic={true}>
                {t.about.learnMore}
              </PremiumButton>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}