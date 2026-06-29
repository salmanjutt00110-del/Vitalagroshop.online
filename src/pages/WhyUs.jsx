import React from 'react';
import { motion } from 'framer-motion';
import WhyChooseUs from '../components/home/WhyChooseUs';
import QualitySection from '../components/home/QualitySection';
import CTASection from '../components/home/CTASection';

export default function WhyUs() {
  return (
    <div className="min-h-screen pt-24">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#020703] via-[#051107] to-neutral-950 py-20 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-sm font-bold tracking-widest uppercase text-[#76C945]">The Vital Difference</span>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl font-extrabold text-white mt-4 mb-4">Why Choose Vital Agro</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {"Discover what makes us Pakistan's most trusted agricultural solutions provider."}
            </p>
          </motion.div>
        </div>
      </section>

      <WhyChooseUs />
      <QualitySection />
      <CTASection />
    </div>
  );
}