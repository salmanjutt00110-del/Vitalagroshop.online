import React from 'react';
import { motion } from 'framer-motion';
import { Award, Package, Users, Tractor, ThumbsUp } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import GlassCard from '@/components/ui/GlassCard';
import CountUp from '@/components/ui/CountUp';

const statColors = [
  { bg: 'bg-[#2d7a2d]/10', icon: 'text-[#2d7a2d]', glow: 'hover:shadow-[#2d7a2d]/5' },
  { bg: 'bg-[#3d8c3d]/10', icon: 'text-[#3d8c3d]', glow: 'hover:shadow-[#3d8c3d]/5' },
  { bg: 'bg-[#5cb85c]/10', icon: 'text-[#5cb85c]', glow: 'hover:shadow-[#5cb85c]/5' },
  { bg: 'bg-[#2d7a2d]/10', icon: 'text-[#2d7a2d]', glow: 'hover:shadow-[#2d7a2d]/5' },
  { bg: 'bg-[#3d8c3d]/10', icon: 'text-[#3d8c3d]', glow: 'hover:shadow-[#3d8c3d]/5' },
];

export default function StatsSection() {
  const { t } = useLanguage();

  const STATS = [
    { icon: Award, value: 15, suffix: '+', label: t.stats.experience },
    { icon: Package, value: 50, suffix: '+', label: t.stats.products },
    { icon: Users, value: 500, suffix: '+', label: t.stats.dealers },
    { icon: Tractor, value: 10000, suffix: '+', label: t.stats.farmers },
    { icon: ThumbsUp, value: 25000, suffix: '+', label: t.stats.customers },
  ];

  return (
    <section className="py-16 -mt-1 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 border border-border/60 p-8 sm:p-12 relative overflow-hidden"
        >
          {/* Subtle gradient shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#76C945]/[0.03] via-transparent to-[#C5A059]/[0.03] rounded-3xl" />

          <div className="relative grid grid-cols-2 lg:grid-cols-5 gap-6 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1 [&>*:last-child:nth-child(odd)]:max-w-[50%] lg:[&>*:last-child:nth-child(odd)]:max-w-none [&>*:last-child:nth-child(odd)]:mx-auto lg:[&>*:last-child:nth-child(odd)]:mx-0 w-full">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="w-full flex"
              >
                <GlassCard
                  tilt={true}
                  maxTilt={6}
                  glow={true}
                  lift={true}
                  className="w-full p-5 text-center flex flex-col justify-between items-center bg-white/40 hover:bg-white/75"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`w-14 h-14 rounded-2xl ${statColors[i % statColors.length].bg} flex items-center justify-center mb-4`}
                  >
                    <stat.icon className={`w-6 h-6 ${statColors[i % statColors.length].icon}`} />
                  </motion.div>
                  <div className="text-4xl sm:text-5xl font-black text-[#0A2E1F] tracking-tight font-mono">
                    <CountUp from={0} to={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 font-medium leading-tight">{stat.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}