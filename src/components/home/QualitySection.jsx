import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, FlaskConical, Microscope, ShieldCheck, Atom } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedText from '@/components/ui/AnimatedText';
import researchLab from '@/assets/Vital-C.webp';

export default function QualitySection() {
  const { t } = useLanguage();

  const STEPS = [
    { step: '01', title: t.quality.s1Title, desc: t.quality.s1Desc, icon: FlaskConical },
    { step: '02', title: t.quality.s2Title, desc: t.quality.s2Desc, icon: Microscope },
    { step: '03', title: t.quality.s3Title, desc: t.quality.s3Desc, icon: ShieldCheck },
    { step: '04', title: t.quality.s4Title, desc: t.quality.s4Desc, icon: Atom },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#76C945]/[0.03] via-background to-[#C5A059]/[0.03] pointer-events-none" />
      
      {/* Subtle floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#76C945]/5"
            style={{
              width: 80 + i * 40,
              height: 80 + i * 40,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Copy & Process Steps */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-black tracking-widest uppercase text-[#76C945] mb-4"
            >
              {t.quality.badge}
            </motion.span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              <AnimatedText text={t.quality.title} />
            </h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-muted-foreground text-lg leading-relaxed mb-10"
            >
              {t.quality.desc}
            </motion.p>

            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <GlassCard
                    tilt={true}
                    maxTilt={3}
                    glow={true}
                    lift={true}
                    className="flex gap-5 p-4 bg-white/40 hover:bg-white/90 border-[#0A2E1F]/5 hover:border-[#76C945]/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#0A2E1F] text-white flex items-center justify-center font-black text-sm group-hover:bg-[#76C945] group-hover:text-[#0A2E1F] transition-all duration-300 shadow-md">
                      <step.icon className="w-6 h-6 text-[#76C945] group-hover:text-[#0A2E1F] transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#0A2E1F] mb-1 text-base">{step.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Lab image with floating highlights */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Laboratory Image wrapped in Glass */}
            <GlassCard
              tilt={true}
              maxTilt={4}
              glow={true}
              lift={false}
              className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-white/20 bg-white"
            >
              <img
                src={researchLab}
                alt="Vital-C Product"
                width="600"
                height="450"
                className="w-full h-full object-contain p-8"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0A2E1F]/30 via-transparent to-[#76C945]/5" />
            </GlassCard>

            {/* Floating Science Badges */}
            <motion.div
              animate={{ y: [-6, 8, -6], rotate: [0, 4, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 z-10"
            >
              <GlassCard
                tilt={true}
                maxTilt={10}
                className="w-16 h-16 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center border border-white/40"
              >
                <FlaskConical className="w-7 h-7 text-[#76C945]" />
              </GlassCard>
            </motion.div>

            <motion.div
              animate={{ y: [6, -8, 6], rotate: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute -bottom-3 -left-3 z-10"
            >
              <GlassCard
                tilt={true}
                maxTilt={10}
                className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center border border-white/40"
              >
                <Atom className="w-6 h-6 text-[#C5A059]" />
              </GlassCard>
            </motion.div>

            {/* Quality Certification Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, type: 'spring', stiffness: 90 }}
              className="absolute -bottom-6 -right-6 z-10"
            >
              <GlassCard
                tilt={true}
                maxTilt={6}
                className="bg-gradient-to-br from-[#0A2E1F] to-[#0A2E1F]/90 text-white rounded-2xl p-5 shadow-2xl backdrop-blur-md border border-white/10 w-56"
              >
                <CheckCircle className="w-8 h-8 text-[#76C945] mb-2" />
                <div className="font-extrabold text-base">{t.quality.iso}</div>
                <div className="text-white/60 text-xs mt-0.5">{t.quality.isoDesc}</div>
              </GlassCard>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}