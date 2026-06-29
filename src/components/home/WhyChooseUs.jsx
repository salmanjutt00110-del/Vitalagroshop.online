import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FlaskConical, Truck, Award, Users, HeartPulse, Globe, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedText from '@/components/ui/AnimatedText';
import vitalCImg from '@/assets/Vital-C.webp';

export default function WhyChooseUs() {
  const { t } = useLanguage();

  const REASONS = [
    { icon: Globe, title: t.whyUs.r1Title, desc: t.whyUs.r1Desc },
    { icon: Shield, title: t.whyUs.r2Title, desc: t.whyUs.r2Desc },
    { icon: FlaskConical, title: t.whyUs.r3Title, desc: t.whyUs.r3Desc },
    { icon: Zap, title: t.whyUs.r4Title, desc: t.whyUs.r4Desc },
    { icon: Users, title: t.whyUs.r5Title, desc: t.whyUs.r5Desc },
    { icon: HeartPulse, title: t.whyUs.r6Title, desc: t.whyUs.r6Desc },
    { icon: Truck, title: t.whyUs.r7Title, desc: t.whyUs.r7Desc },
    { icon: Award, title: t.whyUs.r8Title, desc: t.whyUs.r8Desc },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[#061406] text-white">
      {/* Background radial highlights */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-[#76C945]/12 rounded-full filter blur-[100px] pointer-events-none select-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#C5A059]/5 rounded-full filter blur-[80px] pointer-events-none select-none" />

      {/* Decorative grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none select-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-black tracking-widest uppercase text-[#76C945] mb-4"
          >
            {t.whyUs.badge}
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            <AnimatedText text={t.whyUs.title} />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto"
          >
            {t.whyUs.desc}
          </motion.p>
        </div>

        {/* Side-by-Side Premium Visual split layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch perspective-container">
          {/* Left Column: Visual Showcase (Vital-C Integration) */}
          <div className="lg:col-span-5 flex">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] flex flex-col justify-between p-8 group shadow-2xl min-h-[360px] hover-3d-card"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(118,201,69,0.15)_0%,transparent_60%)]" />
              
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-black uppercase text-[#8AD65A] tracking-widest bg-[#76C945]/15 border border-[#76C945]/20 px-3 py-1 rounded-full">
                  Premium Standards
                </span>
                <h3 className="text-xl font-black text-white mt-3">Advanced Agrochemical Science</h3>
                <p className="text-xs text-white/50 leading-relaxed max-w-xs">
                  We formulate each product batch with imported raw ingredients matching strict laboratory tolerances.
                </p>
              </div>
 
              {/* Floating product bottle */}
              <div className="relative flex-1 flex items-center justify-center py-6">
                <div className="absolute w-[60%] h-4 bg-black/40 rounded-full blur-[10px] bottom-2" />
                <img
                  src={vitalCImg}
                  alt="Vital-C Formulation Showcase"
                  className="max-h-[220px] w-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] group-hover:scale-108 group-hover:rotate-3 hover-3d-lift transition-all duration-700 pointer-events-none"
                />
              </div>

              {/* Spec tags */}
              <div className="relative z-10 flex gap-2 flex-wrap pt-2">
                <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] font-mono text-white/60 font-semibold">
                  100% Quality Inspected
                </span>
                <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] font-mono text-white/60 font-semibold">
                  HPLC Tested
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Grid of Features */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {REASONS.map((reason, i) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                className="w-full flex"
              >
                <GlassCard
                  tilt={true}
                  maxTilt={12}
                  glow={true}
                  lift={true}
                  whileHover={{
                    scale: 1.04,
                    translateZ: 30,
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.45), 0 0 35px rgba(118, 201, 69, 0.25)',
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-full p-5 bg-white/[0.02] hover:bg-white/[0.06] border-white/5 hover:border-[#76C945]/20 shadow-xl transition-all duration-300"
                >
                  <div className="flex gap-4 items-start h-full">
                    <div className="w-11 h-11 rounded-xl bg-[#76C945]/15 border border-[#76C945]/20 flex items-center justify-center shrink-0">
                      <reason.icon className="w-5 h-5 text-[#8AD65A]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-sm">{reason.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed">{reason.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}