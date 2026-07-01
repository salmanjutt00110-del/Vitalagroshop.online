import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertCircle } from 'lucide-react';
import { analyzeImageWithGemini } from '@/lib/gemini';
import { useLanguage } from '@/lib/LanguageContext';
import { PRODUCTS_DATA } from '@/data/productsData';
import SEOHead from '@/lib/seo/SEOHead';

export default function AIDiseaseScanner() {
  const { lang } = useLanguage();
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result);
      setResult(null);
      setError(null);
      startScan(file, e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const startScan = async (file, base64Url) => {
    setScanning(true);
    setError(null);

    const commaIndex = base64Url.indexOf(',');
    const base64Data = base64Url.substring(commaIndex + 1);
    const mimeType = file.type || 'image/jpeg';

    const prompt = `
      You are an expert plant pathologist.
      Analyze this plant leaf/stem image. Identify the crop/plant type, any disease symptoms, and diagnose the pathology.
      If the crop is healthy, diagnose it as "Healthy Crop" with 100% confidence.

      Respond ONLY with a valid JSON object. Do not wrap the JSON in markdown blocks (e.g. do not include \`\`\`json). The JSON structure must match the following format exactly:
      {
        "disease": "Disease Name (in English) / بیماری کا نام (Urdu)",
        "confidence": 85,
        "severity": 45,
        "description": "Short description of visual symptoms in English / علامات کی تفصیل in Urdu",
        "treatments": [
          "Treatment step 1 (in English) / طریقہ 1 (Urdu)",
          "Treatment step 2 (in English) / طریقہ 2 (Urdu)"
        ],
        "suggestedProductSlugs": ["conference-gold-fs", "easy-grow-sc"]
      }

      Choose suggestedProductSlugs from this list of available slugs matching the crop disease context:
      - "aaqab"
      - "vac-zinc"
      - "dr-pp"
      - "easy-grow-sc"
      - "purifizin"
      - "fatty"
      - "conference-gold-fs"
      - "output"
      - "sector"
      - "farbasin"
      - "super-4g"
    `;

    try {
      const response = await analyzeImageWithGemini(base64Data, mimeType, prompt);
      const cleanJsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const diagnosis = JSON.parse(cleanJsonStr);

      const suggestedProducts = (diagnosis.suggestedProductSlugs || [])
        .map((slug) => PRODUCTS_DATA[slug])
        .filter(Boolean)
        .map((p) => ({
          slug: p.slug,
          name: p.name[lang] || p.name.en,
          price: p.sizes?.[0]?.price || p.price,
          image: p.pngUrl || p.imageUrl
        }));

      setResult({
        ...diagnosis,
        suggestedProducts
      });
    } catch (err) {
      console.error(err);
      setError(
        lang === 'en'
          ? "Failed to complete AI diagnosis. Please verify your internet connection or try again."
          : "اے آئی تشخیص مکمل کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔"
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="w-full bg-[#061406] py-10 rounded-3xl">
      <SEOHead
        title="AI Crop Disease Scanner | Vital Agro"
        description="Instantly diagnose crop diseases by uploading a photo. Get AI-powered treatment recommendations."
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden py-10 px-4 text-center select-none">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2
          w-[500px] h-[300px] rounded-full opacity-20
          bg-[radial-gradient(ellipse,#2d6a2d_0%,transparent_70%)]
          blur-[60px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-[rgba(45,106,45,0.25)] border border-[rgba(92,184,92,0.3)]
            text-[#0E7A43] text-[11px] tracking-[0.2em] uppercase font-bold mb-5 shadow-inner">
            🤖 AI DISEASE SCANNER
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-emerald-950 mb-3 tracking-tight">
            {lang === 'en' ? 'Scan Crop Health' : 'فصل کی صحت سکین کریں'}
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            {lang === 'en'
              ? 'Snap or upload a photo of leaf or stem symptoms. Get instant AI diagnosis + Vital Agro treatment recommendations.'
              : 'پتے یا تنے کی بیماری کی تصویر اپ لوڈ کریں۔ فوری اے آئی تشخیص اور علاج پائیں۔'}
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pb-10">
        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT — Upload Panel */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={`relative rounded-3xl overflow-hidden min-h-[380px] transition-all duration-300 ${
              dragOver ? 'border-[#0E7A43] bg-[rgba(92,184,92,0.05)] scale-[1.01]' : 'border-emerald-900/5 bg-white/80'
            }`}
            style={{
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpg,image/jpeg,image/webp"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />

            {/* Drag & Drop Zone */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-8 cursor-pointer group select-none"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files[0]) handleImageUpload(e.dataTransfer.files[0]);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
            >
              {image ? (
                // Show uploaded image
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={image}
                    alt="Uploaded crop"
                    className="max-h-64 object-contain rounded-2xl"
                    style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
                  />
                  
                  {/* Scanning beam */}
                  {scanning && (
                    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
                      <motion.div
                        className="w-full h-1 bg-gradient-to-r from-transparent via-[#0E7A43] to-transparent shadow-[0_0_15px_#0E7A43]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                        style={{ position: 'absolute', left: 0 }}
                      />
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); setError(null); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full
                      bg-black/70 hover:bg-black/90 text-neutral-600 hover:text-emerald-950 border border-emerald-900/10
                      flex items-center justify-center text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                // Upload prompt
                <div className="text-center">
                  <motion.div
                    className="w-20 h-20 rounded-2xl mx-auto mb-5
                      bg-[rgba(45,106,45,0.2)] border border-[rgba(92,184,92,0.2)]
                      flex items-center justify-center
                      group-hover:bg-[rgba(45,106,45,0.3)]
                      transition-colors duration-300 shadow-inner"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Camera size={32} className="text-[#0E7A43]" />
                  </motion.div>
                  <p className="text-emerald-950 font-semibold text-base mb-2">
                    {lang === 'en' ? 'Take Photo or Upload Image' : 'تصویر لیں یا فائل اپ لوڈ کریں'}
                  </p>
                  <p className="text-neutral-400 text-xs">
                    {lang === 'en' ? 'PNG, JPG, JPEG · up to 10MB' : 'پی این جی، جے پی جی · 10 ایم بی تک'}
                  </p>
                  <div className="mt-4 px-5 py-2 rounded-full border border-[rgba(92,184,92,0.3)]
                    text-[#0E7A43] text-xs font-bold inline-block
                    group-hover:bg-[rgba(92,184,92,0.1)] transition-colors">
                    {lang === 'en' ? 'Choose File' : 'فائل منتخب کریں'}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT — Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              minHeight: 380,
            }}
          >
            {scanning ? (
              // SCANNING STATE
              <ScanningAnimation lang={lang} />
            ) : error ? (
              // ERROR STATE
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-red-400 select-none">
                <AlertCircle size={36} className="mb-4 opacity-80" />
                <p className="text-sm font-semibold leading-relaxed">{error}</p>
              </div>
            ) : result ? (
              // RESULTS STATE
              <ScanResults result={result} lang={lang} />
            ) : (
              // AWAITING STATE
              <AwaitingScan lang={lang} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const ScanningAnimation = ({ lang }) => (
  <div className="h-full flex flex-col items-center justify-center p-8 select-none">
    {/* Radar scan animation */}
    <div className="relative w-28 h-28 mb-8">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-[#0E7A43]"
          animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.55, ease: 'easeOut' }}
        />
      ))}
      <div className="absolute inset-0 rounded-full
        bg-[rgba(45,106,45,0.2)] border-2 border-[#0E7A43]
        flex items-center justify-center text-3xl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          🔬
        </motion.div>
      </div>
    </div>

    <p className="text-emerald-950 font-semibold text-base mb-2">
      {lang === 'en' ? 'Analyzing Crop...' : 'فصل کا معائنہ کیا جا رہا ہے...'}
    </p>
    <p className="text-neutral-500 text-xs text-center leading-relaxed">
      {lang === 'en' 
        ? 'AI is identifying disease patterns and pathology symptoms'
        : 'اے آئی بیماری کے خدوخال اور علامات کا تجزیہ کر رہا ہے'}
    </p>

    {/* Scanning progress bar */}
    <div className="mt-6 w-full max-w-xs h-1.5 rounded-full bg-white/80 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-[#0E7A43]"
        animate={{ width: ['0%', '100%'] }}
        transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
      />
    </div>
  </div>
);

const AwaitingScan = ({ lang }) => (
  <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none">
    <div className="w-16 h-16 rounded-2xl bg-white/60 border border-emerald-900/10
      flex items-center justify-center text-3xl mb-5">
      🌿
    </div>
    <p className="text-neutral-500 text-[10px] tracking-[0.15em] uppercase font-bold mb-2">
      {lang === 'en' ? 'AWAITING SCAN' : 'سکین کا انتظار ہے'}
    </p>
    <p className="text-emerald-950/25 text-xs leading-relaxed max-w-xs">
      {lang === 'en'
        ? 'Upload an image on the left to receive an instant AI diagnostic report.'
        : 'رپورٹ حاصل کرنے کے لیے بائیں جانب تصویر اپ لوڈ کریں۔'}
    </p>
    <div className="mt-8 space-y-3.5 text-left w-full max-w-xs border-t border-emerald-900/5 pt-6">
      {[
        { icon: '🔍', text: lang === 'en' ? 'Disease identification' : 'بیماری کی شناخت' },
        { icon: '💊', text: lang === 'en' ? 'Treatment recommendations' : 'علاج کی تجاویز' },
        { icon: '🧪', text: lang === 'en' ? 'Vital Agro product suggestions' : 'وائٹل ایگرو پراڈکٹس' },
        { icon: '📋', text: lang === 'en' ? 'Severity assessment' : 'سنجیدگی کا اندازہ' },
      ].map(item => (
        <div key={item.text}
          className="flex items-center gap-3 text-emerald-950/45 text-xs font-semibold">
          <span className="text-sm shrink-0">{item.icon}</span>
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  </div>
);

const ScanResults = ({ result, lang }) => (
  <div className="p-6 h-full overflow-y-auto space-y-6 scrollbar-thin text-left">
    {/* Confidence badge */}
    <div className="flex items-center gap-3 pb-4 border-b border-emerald-900/5">
      <div className="w-10 h-10 rounded-xl bg-[rgba(45,106,45,0.25)]
        flex items-center justify-center text-lg shadow-inner">🔬</div>
      <div>
        <p className="text-emerald-950 font-black text-sm">{lang === 'en' ? 'Diagnosis Complete' : 'تشخیص مکمل ہو گئی'}</p>
        <p className="text-[#0E7A43] text-[11px] font-bold font-mono">
          {result.confidence}% {lang === 'en' ? 'confidence' : 'یقین دہانی'}
        </p>
      </div>
    </div>

    {/* Disease name */}
    <div className="p-5 rounded-2xl bg-[rgba(230,57,70,0.06)] border border-red-500/15">
      <p className="text-red-400/80 text-[9px] uppercase tracking-widest font-black mb-1.5">
        {lang === 'en' ? 'Detected Disease' : 'پائی جانے والی بیماری'}
      </p>
      <p className="text-emerald-950 font-extrabold text-base leading-snug">{result.disease}</p>
      <p className="text-neutral-500 text-xs mt-2 leading-relaxed">{result.description}</p>
    </div>

    {/* Severity */}
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold text-neutral-500">
        <span>{lang === 'en' ? 'Severity Assessment:' : 'شدت کا اندازہ:'}</span>
        <span className="text-emerald-950 font-mono">{result.severity}%</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-white/80 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${result.severity}%`,
              background: result.severity > 70 ? '#e63946' : '#fbbf24',
            }}
          />
        </div>
      </div>
    </div>

    {/* Treatment */}
    <div className="space-y-2.5">
      <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-black">
        {lang === 'en' ? 'Recommended Treatment' : 'تجویز کردہ علاج'}
      </p>
      <ul className="space-y-2">
        {result.treatments?.map((t, i) => (
          <li key={i} className="text-emerald-950/75 text-xs flex gap-2.5 leading-relaxed items-start">
            <span className="text-[#0E7A43] text-sm shrink-0">✓</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Vital Agro Products */}
    {result.suggestedProducts?.length > 0 && (
      <div className="pt-2 border-t border-emerald-900/5">
        <p className="text-[#0E7A43] text-[10px] uppercase tracking-widest font-black mb-3">
          ✦ {lang === 'en' ? 'Vital Agro Recommends' : 'وائٹل ایگرو کی تجویز کردہ پروڈکٹس'}
        </p>
        <div className="space-y-2.5">
          {result.suggestedProducts.map(product => (
            <a
              key={product.slug}
              href={`/products/${product.slug}`}
              className="flex items-center gap-4.5 p-3 rounded-2xl
                bg-[rgba(45,106,45,0.15)] border border-[rgba(92,184,92,0.2)]
                hover:bg-[rgba(45,106,45,0.25)] hover:border-[rgba(92,184,92,0.4)]
                transition-all duration-300"
            >
              <img src={product.image} alt={product.name}
                className="w-12 h-12 object-contain shrink-0 drop-shadow-md" />
              <div className="flex-1 min-w-0">
                <p className="text-emerald-950 text-xs font-bold truncate">{product.name}</p>
                <p className="text-[#0E7A43] text-[11px] font-mono font-bold mt-0.5">
                  PKR {product.price?.toLocaleString()} →
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    )}
  </div>
);
