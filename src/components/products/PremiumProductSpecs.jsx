import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { FileText, Cpu, CheckCircle2, ShieldCheck, Database, Layers, Info } from 'lucide-react';

export default function PremiumProductSpecs({ product }) {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('features');

  // Intelligent Fallback Data Injection
  const getSafely = (field, fallbackEn, fallbackUr) => {
    if (product[field]) return product[field];
    return { en: fallbackEn, ur: fallbackUr };
  };

  const specs = {
    features: product.features || {
      en: ["Advanced formulation for rapid absorption", "Long-lasting residual protection", "Enhances overall crop yield and quality", "Safe for beneficial insects when used as directed"],
      ur: ["تیزی سے جذب ہونے کے لیے جدید فارمولیشن", "دیرپا بقایا تحفظ", "فصل کی مجموعی پیداوار اور معیار کو بڑھاتا ہے", "ہدایت کے مطابق استعمال کرنے پر فائدہ مند کیڑوں کے لیے محفوظ"]
    },
    benefits: product.benefits || {
      en: ["Increases profitability through higher yields", "Reduces crop stress during critical growth stages", "Provides excellent rainfastness", "Cost-effective solution for modern farming"],
      ur: ["زیادہ پیداوار کے ذریعے منافع میں اضافہ کرتا ہے", "نشوونما کے اہم مراحل کے دوران فصل کے دباؤ کو کم کرتا ہے", "بہترین بارش سے بچاؤ فراہم کرتا ہے", "جدید کاشتکاری کے لیے کم لاگت والا حل"]
    },
    applicationMethod: getSafely('applicationMethod', 
      "Mix the recommended dosage with clean water. Spray evenly over the foliage during early morning or late evening. Avoid spraying in strong winds or rain.",
      "تجویز کردہ مقدار کو صاف پانی میں ملا لیں۔ صبح سویرے یا دیر شام کے وقت پتوں پر یکساں سپرے کریں۔ تیز ہواؤں یا بارش میں سپرے کرنے سے گریز کریں۔"
    ),
    dosage: getSafely('dosage',
      "Refer to the packaging or consult our agronomist for specific crop dosages.",
      "مخصوص فصل کی مقدار کے لئے پیکنگ پر دی گئی ہدایات دیکھیں یا ماہر زراعت سے مشورہ کریں۔"
    ),
    safety: getSafely('safetyInstructions',
      "Keep out of reach of children. Wear protective clothing, gloves, and a mask during application. Do not inhale spray mist.",
      "بچوں کی پہنچ سے دور رکھیں۔ سپرے کے دوران حفاظتی لباس، دستانے اور ماسک پہنیں۔ سپرے کی دھند میں سانس نہ لیں۔"
    ),
    storage: getSafely('storageInstructions',
      "Store in original sealed container in a cool, dry, and well-ventilated place away from direct sunlight.",
      "براہ راست سورج کی روشنی سے دور، ٹھنڈی، خشک اور ہوادار جگہ پر اصل بند کنٹینر میں رکھیں۔"
    )
  };

  const tabs = [
    { id: 'features', icon: <CheckCircle2 className="w-4 h-4" />, label: { en: 'Features & Benefits', ur: 'خصوصیات اور فوائد' } },
    { id: 'application', icon: <Layers className="w-4 h-4" />, label: { en: 'Application & Dosage', ur: 'استعمال اور مقدار' } },
    { id: 'safety', icon: <ShieldCheck className="w-4 h-4" />, label: { en: 'Safety & Storage', ur: 'حفاظت اور ذخیرہ' } },
    { id: 'technical', icon: <Cpu className="w-4 h-4" />, label: { en: 'Technical Specs', ur: 'تکنیکی تفصیلات' } }
  ];

  return (
    <div className="w-full mt-12 mb-20 flex flex-col gap-6" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Premium Glassmorphism Tabs Header */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-2 bg-[#0a0f0c] border border-emerald-900/5 rounded-2xl w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap outline-none ${
                isActive ? 'text-emerald-950' : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/70'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {tab.label[lang]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="bg-[#050906] border border-emerald-900/5 rounded-[32px] p-8 min-h-[300px] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {activeTab === 'features' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-black text-emerald-400 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {lang === 'en' ? 'Key Features' : 'اہم خصوصیات'}
                  </h3>
                  <div className="space-y-4">
                    {(Array.isArray(specs.features) ? specs.features : specs.features[lang] || specs.features.en).map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-white/70 p-4 rounded-xl border border-emerald-900/5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-sm font-semibold text-neutral-800 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-400 mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {lang === 'en' ? 'Key Benefits' : 'اہم فوائد'}
                  </h3>
                  <div className="space-y-4">
                    {(Array.isArray(specs.benefits) ? specs.benefits : specs.benefits[lang] || specs.benefits.en).map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-white/70 p-4 rounded-xl border border-emerald-900/5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-sm font-semibold text-neutral-800 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'application' && (
              <div className="space-y-8">
                <div className="bg-white/70 p-6 rounded-2xl border border-emerald-900/5">
                  <h3 className="text-lg font-black text-emerald-400 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    {lang === 'en' ? 'Application Method' : 'طریقہ استعمال'}
                  </h3>
                  <p className="text-neutral-700 leading-relaxed text-sm font-medium">
                    {specs.applicationMethod[lang] || specs.applicationMethod.en}
                  </p>
                </div>
                
                {product.dosageTable && product.dosageTable.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-emerald-900/10">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="bg-[#0a0f0c] text-emerald-950 text-xs border-b border-emerald-900/10">
                          <th className="p-4 font-bold">{lang === 'en' ? 'Crop' : 'فصل'}</th>
                          <th className="p-4 font-bold">{lang === 'en' ? 'Dosage' : 'خوراک'}</th>
                          <th className="p-4 font-bold">{lang === 'en' ? 'Water' : 'پانی'}</th>
                          <th className="p-4 font-bold">{lang === 'en' ? 'Timing' : 'وقت'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs text-neutral-600 bg-white/60">
                        {product.dosageTable.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/70 transition-colors">
                            <td className="p-4 font-extrabold text-emerald-950">{row.crop?.[lang] || row.crop?.en}</td>
                            <td className="p-4 font-bold text-emerald-400">{row.dosage?.[lang] || row.dosage?.en}</td>
                            <td className="p-4 text-amber-400 font-medium">{row.water?.[lang] || row.water?.en}</td>
                            <td className="p-4">{row.timing?.[lang] || row.timing?.en}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white/70 p-6 rounded-2xl border border-emerald-900/5">
                    <h3 className="text-lg font-black text-emerald-400 mb-4 flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      {lang === 'en' ? 'General Dosage' : 'عام مقدار'}
                    </h3>
                    <p className="text-neutral-700 leading-relaxed text-sm font-medium">
                      {specs.dosage[lang] || specs.dosage.en}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'safety' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10">
                  <h3 className="text-lg font-black text-red-400 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    {lang === 'en' ? 'Safety Instructions' : 'حفاظتی ہدایات'}
                  </h3>
                  <p className="text-neutral-700 leading-relaxed text-sm font-medium">
                    {specs.safety[lang] || specs.safety.en}
                  </p>
                </div>
                <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10">
                  <h3 className="text-lg font-black text-blue-400 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    {lang === 'en' ? 'Storage Guidelines' : 'ذخیرہ کرنے کی ہدایات'}
                  </h3>
                  <p className="text-neutral-700 leading-relaxed text-sm font-medium">
                    {specs.storage[lang] || specs.storage.en}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/70 p-5 rounded-2xl border border-emerald-900/5 flex justify-between items-center">
                  <span className="text-neutral-500 font-bold text-sm">Brand</span>
                  <span className="text-neutral-800 font-black text-sm">Vital Agro</span>
                </div>
                <div className="bg-white/70 p-5 rounded-2xl border border-emerald-900/5 flex justify-between items-center">
                  <span className="text-neutral-500 font-bold text-sm">Active Ingredient</span>
                  <span className="text-neutral-800 font-black text-sm max-w-[180px] truncate">{product.activeIngredient || product.genericName?.en || "Organic Formula"}</span>
                </div>
                <div className="bg-white/70 p-5 rounded-2xl border border-emerald-900/5 flex justify-between items-center">
                  <span className="text-neutral-500 font-bold text-sm">Product SKU</span>
                  <span className="text-neutral-800 font-black text-sm">{product.productCode || product.id.toUpperCase()}</span>
                </div>
                <div className="bg-white/70 p-5 rounded-2xl border border-emerald-900/5 flex justify-between items-center">
                  <span className="text-neutral-500 font-bold text-sm">Formulation</span>
                  <span className="text-neutral-800 font-black text-sm">{product.formulation || 'Liquid/Powder'}</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Ensure Sparkles icon is exported or imported if missing in standard lucide set
function Sparkles(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
