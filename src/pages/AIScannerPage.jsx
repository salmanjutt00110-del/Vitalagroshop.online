import React from 'react';
import AIDiseaseScanner from '@/components/ai/AIDiseaseScanner';
import SEOHead from '@/lib/seo/SEOHead';

export default function AIScannerPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#061406] transition-colors duration-300">
      <SEOHead
        title="AI Plant Disease Diagnosis Scanner | Vital Agro"
        description="Diagnose crop leaf and stem diseases instantly using AI vision analysis. Receive professional chemical recommendations using Vital Agro products."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AIDiseaseScanner />
      </div>
    </div>
  );
}
