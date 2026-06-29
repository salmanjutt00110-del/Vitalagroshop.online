import React, { useEffect } from 'react';
import SEOHead from '@/lib/seo/SEOHead';
import HeroSection from '../components/home/HeroSection';
import { prefetchPages } from '@/utils/prefetch';

// Lazy load heavy home sections below the fold to split bundle size and optimize initial load
const PremiumGlassShowcase = React.lazy(() => import('../components/home/PremiumGlassShowcase'));
const StatsSection = React.lazy(() => import('../components/home/StatsSection'));
const AboutPreview = React.lazy(() => import('../components/home/AboutPreview'));
const WhyChooseUs = React.lazy(() => import('../components/home/WhyChooseUs'));
const QualitySection = React.lazy(() => import('../components/home/QualitySection'));
const CTASection = React.lazy(() => import('../components/home/CTASection'));
const FeaturedProducts = React.lazy(() => import('../components/home/FeaturedProducts'));
const BankDetails = React.lazy(() => import('../components/sections/BankDetails'));

// Branded loading skeleton matching premium aesthetics
const SectionPlaceholder = ({ height = '300px' }) => (
  <div
    style={{ height }}
    className="w-full bg-slate-50 animate-pulse border-y border-emerald-900/5 flex items-center justify-center"
  >
    <div className="text-emerald-950/20 text-[10px] font-mono tracking-[0.3em] uppercase">
      Loading Section...
    </div>
  </div>
);

export default function Home() {
  useEffect(() => {
    prefetchPages();
  }, []);

  return (
    <div>
      <SEOHead
        title="Vital Agro Chemical Industries | Premium Agricultural Solutions"
        description="Pakistan's premium agricultural chemicals company. Crop protection, plant nutrition & modern farming solutions. Serving 50,000+ farmers since inception."
        url="https://vital-agro.vercel.app"
      />
      
      {/* Visually Hidden SEO Heading Hierarchy */}
      <div className="sr-only">
        <h1>Vital Agro Chemical Industries</h1>
        <h3>Growing Agriculture Through Innovation</h3>
        <h3>Premium Crop Protection</h3>
      </div>

      <HeroSection />

      <React.Suspense fallback={<SectionPlaceholder height="150px" />}>
        <StatsSection />
      </React.Suspense>

      {/* Featured Products — 2-3 top products visible together */}
      <React.Suspense fallback={<SectionPlaceholder height="350px" />}>
        <FeaturedProducts />
      </React.Suspense>

      <React.Suspense fallback={<SectionPlaceholder height="450px" />}>
        <AboutPreview />
      </React.Suspense>


      <React.Suspense fallback={<SectionPlaceholder height="550px" />}>
        <WhyChooseUs />
      </React.Suspense>

      {/* Bank Details & COD Policy */}
      <React.Suspense fallback={<SectionPlaceholder height="200px" />}>
        <BankDetails />
      </React.Suspense>

      <React.Suspense fallback={<SectionPlaceholder height="550px" />}>
        <QualitySection />
      </React.Suspense>

      <React.Suspense fallback={<SectionPlaceholder height="320px" />}>
        <CTASection />
      </React.Suspense>
    </div>
  );
}
