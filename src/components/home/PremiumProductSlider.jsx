import React, { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import PremiumProductCard from '../products/PremiumProductCard';

export default function PremiumProductSlider({ products, title, subtitle }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Embla with loop, snap, and autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      dragFree: false, 
      align: 'start', 
      containScroll: 'trimSnaps',
      skipSnaps: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Track selected index for dot indicators
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi]);

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full relative py-6 sm:py-10">
      {/* Section Header */}
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto gap-4"
        >
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 tracking-tight leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-neutral-500 text-xs sm:text-sm max-w-xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Desktop Navigation Controls */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white/[0.08] border border-emerald-900/10 hover:border-emerald-500/30 flex items-center justify-center text-neutral-500 hover:text-emerald-400 transition-all duration-300 cursor-pointer active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white/[0.08] border border-emerald-900/10 hover:border-emerald-500/30 flex items-center justify-center text-neutral-500 hover:text-emerald-400 transition-all duration-300 cursor-pointer active:scale-95"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Embla Carousel Viewport */}
      <div 
        className="overflow-hidden w-full cursor-grab active:cursor-grabbing px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" 
        ref={emblaRef}
      >
        <div className="flex gap-4 sm:gap-6 py-2">
          {products.map((product, idx) => (
            <motion.div 
              key={`${product.id || product.slug}-${idx}`} 
              className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_31.5%] min-w-0"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <PremiumProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Dot Indicators */}
      <div className="flex sm:hidden justify-center gap-1.5 mt-5">
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => emblaApi?.scrollTo(idx)}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              selectedIndex === idx 
                ? 'w-6 h-2 bg-emerald-400' 
                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Mobile Navigation Controls */}
      <div className="flex sm:hidden justify-center gap-3 mt-4">
        <button
          onClick={scrollPrev}
          className="w-10 h-10 rounded-full bg-white/90 border border-emerald-900/10 flex items-center justify-center text-neutral-500 active:text-emerald-400 transition-colors cursor-pointer active:scale-95"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={scrollNext}
          className="w-10 h-10 rounded-full bg-white/90 border border-emerald-900/10 flex items-center justify-center text-neutral-500 active:text-emerald-400 transition-colors cursor-pointer active:scale-95"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
