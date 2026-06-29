import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Award, Microscope, HeartHandshake, Globe } from 'lucide-react';
import useVideoAutoplay from '@/hooks/useVideoAutoplay';
import SEOHead from '@/lib/seo/SEOHead';

// Import Assets
import vitalBg from '@/assets/vital bg.mp4';
import vitalBgWebm from '@/assets/vital_bg.webm';
import vitalBgPoster from '@/assets/vital_bg_poster.webp';
import vitalAgroLogo from '@/assets/vital agro logo.webp';
import tagLogo from '@/assets/tag logo.webp';
import vitalCImg from '@/assets/Vital-C.webp';

export default function About() {
  const videoRef1 = useRef(null);
  useVideoAutoplay(videoRef1);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <SEOHead
        title="About Us | Vital Agro Chemical Industries"
        description="Pioneering agricultural excellence in Pakistan through high-efficacy crop protection and plant nutrition formulations."
        url="https://vital-agro.vercel.app/about"
      />
      {/* Header */}
      <section className="bg-gradient-to-b from-[#020703] via-[#051107] to-neutral-950 py-20 relative overflow-hidden border-b border-emerald-900/5">
        <video
          ref={videoRef1}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={vitalBgPoster}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
        >
          <source src={vitalBgWebm} type="video/webm" />
          <source src={vitalBg} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl font-extrabold text-emerald-950 mt-4 mb-4">About Vital Agro Chemical Industries</h1>
            <span className="text-sm font-bold tracking-widest uppercase text-emerald-700 block mt-2">About Us</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-700 mt-2 mb-4">Our Story</h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              {"Pioneering agricultural excellence through premium formulations and unwavering commitment to farmer prosperity."}
            </p>
          </motion.div>
        </div>
      </section>
 
      {/* Company Intro */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Vital-C Image Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-emerald-900/10 bg-white/70 flex items-center justify-center p-8 group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(118,201,69,0.15)_0%,transparent_60%)]" />
              <img
                src={vitalCImg}
                alt="Vital-C Product Bottle Showcase"
                className="max-h-full w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Logo Banner */}
              <div className="flex items-center gap-4 mb-6">
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

              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-foreground mb-6">
                {"Vital Agro Chemical Industries (Pvt.) Ltd."}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {"Vital Agro Chemical Industries is a leading Pakistani agrochemical company dedicated to providing premium crop protection and plant nutrition solutions. With over 15 years of industry experience, we have established ourselves as a trusted name among farmers and dealers nationwide."}
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {"Our portfolio includes a comprehensive range of insecticides, herbicides, fungicides, micronutrients, growth promoters, and specialty products — all formulated with imported raw materials to deliver maximum efficacy and reliability."}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-3xl p-10 border border-border"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#76C945]/10 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {"To provide farmers with the highest quality agricultural inputs that maximize crop yield and profitability while maintaining environmental sustainability. We strive to be the most trusted partner for progressive farmers across Pakistan."}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-card rounded-3xl p-10 border border-border"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-[#C5A059]" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {"To become Pakistan's leading agrochemical company recognized internationally for innovation, quality, and farmer-centric solutions. We envision a future where every farmer has access to world-class agricultural technology."}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-widest uppercase text-emerald-700">Core Values</span>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-foreground mt-4">What Drives Us</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: 'Excellence', desc: 'We pursue the highest standards in everything we do.' },
              { icon: Microscope, title: 'Innovation', desc: 'Continuous research and development drive our solutions.' },
              { icon: HeartHandshake, title: 'Integrity', desc: 'Honest dealings with farmers, dealers, and partners.' },
              { icon: Globe, title: 'Sustainability', desc: 'Environmentally responsible agricultural practices.' },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#76C945]/10 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-7 h-7 text-emerald-700" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}