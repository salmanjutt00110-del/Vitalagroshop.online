import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    dir: 'ltr',
    nav: {
      home: 'Home',
      about: 'About Us',
      products: 'Products',
      whyUs: 'Why Vital Agro',
      contact: 'Contact',
      aiScanner: 'AI Scanner',
      getQuote: 'Get a Quote',
      phone: '063-2253137',
    },
    hero: {
      badge: 'Premium Agricultural Solutions',
      heading1: 'Growing Agriculture',
      heading2: 'Through Innovation',
      sub: 'Premium Crop Protection, Plant Nutrition & Modern Agricultural Solutions by Vital Agro Chemical Industries.',
      explore: 'Explore Products',
      dealer: 'Become a Dealer',
      whatsapp: 'WhatsApp',
      years: 'Years Experience',
      products: 'Products',
      farmers: 'Farmers Served',
    },
    stats: {
      experience: 'Years Experience',
      products: 'Products Available',
      dealers: 'Active Dealers',
      farmers: 'Farmers Served',
      customers: 'Happy Customers',
    },
    about: {
      badge: 'About Us',
      title: 'Pioneering Agricultural Excellence',
      desc: "Vital Agro Chemical Industries (Pvt.) Ltd. is committed to revolutionizing Pakistan's agriculture through premium imported formulations, cutting-edge research, and unwavering quality standards. We empower farmers with the best crop protection and nutrition solutions.",
      qualityTitle: 'Quality First',
      qualityDesc: 'Imported premium formulations',
      researchTitle: 'Research Driven',
      researchDesc: 'Science-backed solutions',
      supportTitle: 'Farmer Support',
      supportDesc: 'Dedicated field teams',
      learnMore: 'Learn More About Us',
      yearsExcellence: 'Years of Excellence',
    },
    showcase: {
      badge: 'Our Products',
      title: 'Premium Agricultural Solutions',
      desc: 'Discover our range of high-quality crop protection, plant nutrition, and growth promotion products.',
      viewAll: 'View All Products',
      viewDetails: 'View Details',
    },
    whyUs: {
      badge: 'Why Choose Us',
      title: 'The Vital Agro Advantage',
      desc: 'What sets us apart as a premium agricultural solutions provider.',
      r1Title: 'Premium Imported Formulations',
      r1Desc: 'World-class ingredients sourced from leading international manufacturers for superior performance.',
      r2Title: 'High Quality Standards',
      r2Desc: 'Rigorous quality control at every stage ensures consistent, reliable products.',
      r3Title: 'Research Based Products',
      r3Desc: 'Scientifically developed solutions backed by extensive field trials and research.',
      r4Title: 'Maximum Yield',
      r4Desc: 'Proven to deliver higher crop yields and better-quality produce for farmers.',
      r5Title: 'Expert Team',
      r5Desc: 'Experienced agronomists and field staff providing on-ground support.',
      r6Title: 'Farmer Support',
      r6Desc: 'Dedicated helplines, field visits, and ongoing agricultural advisory services.',
      r7Title: 'Fast Delivery Network',
      r7Desc: 'Extensive distribution network ensuring timely product availability nationwide.',
      r8Title: 'Reliable Performance',
      r8Desc: 'Trusted by thousands of dealers and farmers across Pakistan for consistent results.',
    },
    quality: {
      badge: 'Quality Assurance',
      title: 'Uncompromising Quality at Every Step',
      desc: 'Our commitment to quality is embedded in every process — from sourcing the finest raw materials to delivering the finished product to the farmer.',
      iso: 'ISO Certified',
      isoDesc: 'Quality Standards',
      s1Title: 'Raw Material Sourcing',
      s1Desc: 'Premium ingredients imported from global leaders.',
      s2Title: 'Laboratory Testing',
      s2Desc: 'Every batch tested for purity, concentration and efficacy.',
      s3Title: 'Field Trials',
      s3Desc: 'Rigorous field testing across multiple crop zones.',
      s4Title: 'Quality Certification',
      s4Desc: 'Meets all regulatory standards before market release.',
    },
    cta: {
      title: 'Ready to Transform Your Harvest?',
      desc: 'Connect with our team of agricultural experts and discover the right solutions for your crops. Become a dealer or get a personalized product recommendation.',
      btnGetInTouch: 'Get in Touch',
      btnCallNow: 'Call Now',
    },
    footer: {
      desc: 'Premium Crop Protection, Plant Nutrition & Modern Agricultural Solutions for progressive farmers across Pakistan.',
      quickLinks: 'Quick Links',
      categories: 'Categories',
      contact: 'Contact Us',
      copy: `© ${new Date().getFullYear()} Vital Agro Chemical Industries (Pvt.) Ltd. All Rights Reserved.`,
      tagline: 'Premium Agricultural Solutions Since Inception',
    },
    categories: {
      insecticide: 'Insecticide',
      herbicide: 'Herbicide',
      fungicide: 'Fungicide',
      plant_nutrition: 'Plant Nutrition',
      'plant-nutrition': 'Plant Nutrition',
      'seed-treatment': 'Seed Treatment',
      growth_promoter: 'Growth Promoter',
      special_product: 'Special Product',
      soil_conditioner: 'Soil Conditioner',
    },
    pricing: {
      packSize: 'Pack Size',
      cartonPacking: 'Carton Packing',
      netRate: 'Net Rate',
      genericName: 'Generic Name',
      retailPrice: 'Retail Price (PKR)',
    },
  },
  ur: {
    dir: 'rtl',
    nav: {
      home: 'ہوم',
      about: 'ہمارے بارے میں',
      products: 'مصنوعات',
      whyUs: 'وائٹل ایگرو کیوں',
      contact: 'رابطہ',
      aiScanner: 'اے آئی سکینر',
      getQuote: 'قیمت پوچھیں',
      phone: '٠٦٣-٢٢٥٣١٣٧',
    },
    hero: {
      badge: 'اعلیٰ زرعی حل',
      heading1: 'زراعت کو ترقی دیں',
      heading2: 'جدت کے ذریعے',
      sub: 'وائٹل ایگرو کیمیکل انڈسٹریز کی جانب سے اعلیٰ فصل تحفظ، پودوں کی غذائیت اور جدید زرعی حل۔',
      explore: 'مصنوعات دیکھیں',
      dealer: 'ڈیلر بنیں',
      whatsapp: 'واٹس ایپ',
      years: 'سال کا تجربہ',
      products: 'مصنوعات',
      farmers: 'کاشتکار',
    },
    stats: {
      experience: 'سالوں کا تجربہ',
      products: 'دستیاب مصنوعات',
      dealers: 'فعال ڈیلرز',
      farmers: 'خدمت خلق کاشتکار',
      customers: 'مطمئن گاہک',
    },
    about: {
      badge: 'ہمارے بارے میں',
      title: 'زرعی فضیلت کا پیش خیمہ',
      desc: 'وائٹل ایگرو کیمیکل انڈسٹریز (پرائیویٹ) لمیٹڈ پاکستان کی زراعت میں درآمدی فارمولیشنز، جدید ترین تحقیق، اور اعلیٰ ترین معیار کے ذریعے انقلاب لانے کے لیے پرعزم ہے۔ ہم کاشتکاروں کو بہترین فصل تحفظ اور پودوں کی غذائیت کے حل فراہم کرتے ہیں۔',
      qualityTitle: 'معیار اول',
      qualityDesc: 'درآمد شدہ اعلیٰ فارمولیشنز',
      researchTitle: 'تحقیق پر مبنی',
      researchDesc: 'سائنس سے تصدیق شدہ حل',
      supportTitle: 'کاشتکار رہنمائی',
      supportDesc: 'مخصوص فیلڈ ٹیمیں',
      learnMore: 'ہمارے بارے میں مزید جانیں',
      yearsExcellence: 'سالہ شاندار خدمات',
    },
    showcase: {
      badge: 'ہماری مصنوعات',
      title: 'اعلیٰ زرعی حل',
      desc: 'فصلوں کے تحفظ، پودوں کی غذائیت اور نمو بڑھانے کے لیے ہماری بہترین مصنوعات دیکھیں۔',
      viewAll: 'تمام مصنوعات دیکھیں',
      viewDetails: 'تفصیلات دیکھیں',
    },
    whyUs: {
      badge: 'ہمیں کیوں منتخب کریں',
      title: 'وائٹل ایگرو کا فائدہ',
      desc: 'کون سی چیز ہمیں ایک بہترین زرعی حل فراہم کار کے طور پر ممتاز کرتی ہے۔',
      r1Title: 'اعلیٰ درآمدی فارمولیشنز',
      r1Desc: 'بہترین کارکردگی کے لیے معروف عالمی مینوفیکچررز سے حاصل کردہ بین الاقوامی معیار کے اجزاء۔',
      r2Title: 'اعلیٰ معیار کے معیارات',
      r2Desc: 'ہر مرحلے پر سخت کوالٹی کنٹرول مسلسل اور قابل اعتماد مصنوعات کو یقینی بناتا ہے۔',
      r3Title: 'تحقیق پر مبنی مصنوعات',
      r3Desc: 'وسیع فیلڈ ٹرائلز اور سائنسی تحقیق سے تیار کردہ ثابت شدہ حل۔',
      r4Title: 'زیادہ سے زیادہ پیداوار',
      r4Desc: 'کاشتکاروں کے لیے زیادہ پیداوار اور بہتر معیار کے اناج کی ضمانت۔',
      r5Title: 'ماہر ٹیم',
      r5Desc: 'زمین پر براہ راست مدد فراہم کرنے والے تجربہ کار زرعی ماہرین اور فیلڈ عملہ۔',
      r6Title: 'کاشتکار سپورٹ',
      r6Desc: 'مخصوص ہیلپ لائنز، فیلڈ وزٹس اور مسلسل زرعی مشاورتی خدمات۔',
      r7Title: 'تیز ترین سپلائی نیٹ ورک',
      r7Desc: 'ملک بھر میں مصنوعات کی بروقت فراہمی کو یقینی بنانے والا وسیع نیٹ ورک۔',
      r8Title: 'قابل اعتماد کارکردگی',
      r8Desc: 'پاکستان بھر میں ہزاروں ڈیلرز اور کاشتکاروں کا مسلسل نتائج کے لیے وائٹل ایگرو پر بھروسہ۔',
    },
    quality: {
      badge: 'کوالٹی اشورینس',
      title: 'ہر قدم پر غیر سمجھوتہ معیار',
      desc: 'معیار کے ساتھ ہماری وابستگی ہر عمل کا حصہ ہے — بہترین خام مال کے حصول سے لے کر کاشتکار تک حتمی مصنوع کی فراہمی تک۔',
      iso: 'آئی ایس او مصدقہ',
      isoDesc: 'معیاری ضوابط',
      s1Title: 'خام مال کا حصول',
      s1Desc: 'عالمی اداروں سے درآمد کردہ بہترین اور خالص اجزاء۔',
      s2Title: 'لیبارٹری ٹیسٹنگ',
      s2Desc: 'ہر بیج کا خالصیت، ارتکاز اور افادیت کے لیے لیبارٹری ٹیسٹ۔',
      s3Title: 'فیلڈ ٹرائلز',
      s3Desc: 'مختلف زرعی علاقوں میں فصلوں پر سخت فیلڈ ٹیسٹنگ۔',
      s4Title: 'کوالٹی سرٹیفیکیشن',
      s4Desc: 'مارکیٹ میں لانچ سے پہلے تمام ریگولیٹری معیارات پر پورا اترنا۔',
    },
    cta: {
      title: 'اپنی فصل کی پیداوار کو بدلنے کے لیے تیار ہیں؟',
      desc: 'ہمارے زرعی ماہرین کی ٹیم سے رابطہ کریں اور اپنی فصلوں کے لیے بہترین حل تلاش کریں۔ ڈیلر بنیں یا ذاتی نوعیت کی مصنوعات کی تجویز حاصل کریں۔',
      btnGetInTouch: 'رابطہ کریں',
      btnCallNow: 'ابھی کال کریں',
    },
    footer: {
      desc: 'پاکستان بھر کے ترقی پسند کاشتکاروں کے لیے اعلیٰ فصل تحفظ، پودوں کی غذائیت اور جدید زرعی حل۔',
      quickLinks: 'فوری لنکس',
      categories: 'زمرہ جات',
      contact: 'ہم سے رابطہ کریں',
      copy: `© ${new Date().getFullYear()} وائٹل ایگرو کیمیکل انڈسٹریز (پرائیویٹ) لمیٹڈ۔ جملہ حقوق محفوظ ہیں۔`,
      tagline: 'آغاز سے اعلیٰ زرعی حل',
    },
    categories: {
      insecticide: 'کیڑے مار دوا',
      herbicide: 'جڑی بوٹی مار دوا',
      fungicide: 'فنگس مار دوا',
      plant_nutrition: 'پودوں کی غذائیت',
      'plant-nutrition': 'پودوں کی غذائیت',
      'seed-treatment': 'بیج کی صفائی',
      growth_promoter: 'نمو بڑھانے والا',
      special_product: 'خاص مصنوع',
      soil_conditioner: 'مٹی کا کنڈیشنر',
    },
    pricing: {
      packSize: 'پیکنگ سائز',
      cartonPacking: 'کارٹن پیکنگ',
      netRate: 'نیٹ ریٹ',
      genericName: 'جنرک نام',
      retailPrice: 'ریٹیل پرائس (روپے)',
    },
  },
  pb: {
    dir: 'rtl',
    nav: {
      home: 'ہوم',
      about: 'ساڈے بارے',
      products: 'مصنوعات',
      whyUs: 'وائٹل ایگرو کیوں',
      contact: 'رابطہ',
      aiScanner: 'اے آئی سکینر',
      getQuote: 'قیمت پُچھو',
      phone: '٠٦٣-٢٢٥٣١٣٧',
    },
    hero: {
      badge: 'اعلیٰ زرعی حل',
      heading1: 'کھیتی نوں ترقی دیو',
      heading2: 'جدت دے نال',
      sub: 'وائٹل ایگرو کیمیکل انڈسٹریز ولوں اعلیٰ فصل تحفظ، پودیاں دی غذائیت تے جدید زرعی حل۔',
      explore: 'مصنوعات ویکھو',
      dealer: 'ڈیلر بنو',
      whatsapp: 'واٹس ایپ',
      years: 'سال دا تجربہ',
      products: 'مصنوعات',
      farmers: 'کاشتکار',
    },
    stats: {
      experience: 'سالاں دا تجربہ',
      products: 'دستیاب مصنوعات',
      dealers: 'فعال ڈیلرز',
      farmers: 'خدمت گزار کاشتکار',
      customers: 'خوش گاہک',
    },
    about: {
      badge: 'ساڈے بارے',
      title: 'زرعی فضیلت دا پیش خیمہ',
      desc: 'وائٹل ایگرو کیمیکل انڈسٹریز (پرائیویٹ) لمیٹڈ پاکستان دی کھیتی وچ درآمدی فارمولیشنز، جدید تحقیق، تے اعلیٰ معیار دے نال انقلاب لیاون لئی پرعزم اے۔',
      qualityTitle: 'معیار اول',
      qualityDesc: 'درآمد شدہ اعلیٰ فارمولیشنز',
      researchTitle: 'تحقیق تے مبنی',
      researchDesc: 'سائنس نال تصدیق شدہ حل',
      supportTitle: 'کاشتکار رہنمائی',
      supportDesc: 'مخصوص فیلڈ ٹیماں',
      learnMore: 'ساڈے بارے ہور جانو',
      yearsExcellence: 'سالہ شاندار خدمات',
    },
    showcase: {
      badge: 'ساڈیاں مصنوعات',
      title: 'اعلیٰ زرعی حل',
      desc: 'فصلاں دے تحفظ، پودیاں دی غذائیت تے نمو ودھاون لئی ساڈیاں بہترین مصنوعات ویکھو۔',
      viewAll: 'سب مصنوعات ویکھو',
      viewDetails: 'تفصیلات ویکھو',
    },
    whyUs: {
      badge: 'سانوں کیوں چُنو',
      title: 'وائٹل ایگرو دا فائدہ',
      desc: 'کیہڑی شے سانوں اک بہترین زرعی حل فراہم کار بناوندی اے۔',
      r1Title: 'اعلیٰ درآمدی فارمولیشنز',
      r1Desc: 'بہترین کارکردگی لئی عالمی مینوفیکچررز توں حاصل کردہ اجزاء۔',
      r2Title: 'اعلیٰ معیار دے ضوابط',
      r2Desc: 'ہر مرحلے تے سخت کوالٹی کنٹرول۔',
      r3Title: 'تحقیق تے مبنی مصنوعات',
      r3Desc: 'وسیع فیلڈ ٹرائلز تے سائنسی تحقیق نال تیار کردہ حل۔',
      r4Title: 'ودھ توں ودھ پیداوار',
      r4Desc: 'کاشتکاراں لئی ودھ پیداوار تے بہتر معیار دی ضمانت۔',
      r5Title: 'ماہر ٹیم',
      r5Desc: 'تجربہ کار زرعی ماہرین تے فیلڈ عملہ جو زمین تے مدد دیندے نیں۔',
      r6Title: 'کاشتکار سپورٹ',
      r6Desc: 'مخصوص ہیلپ لائنز، فیلڈ وزٹس تے مسلسل زرعی مشاورت۔',
      r7Title: 'تیز ترین سپلائی نیٹ ورک',
      r7Desc: 'ملک بھر وچ مصنوعات دی ویلے سر فراہمی۔',
      r8Title: 'قابل اعتماد کارکردگی',
      r8Desc: 'پاکستان بھر وچ ہزاراں ڈیلرز تے کاشتکاراں دا بھروسہ۔',
    },
    quality: {
      badge: 'کوالٹی اشورینس',
      title: 'ہر قدم تے غیر سمجھوتہ معیار',
      desc: 'معیار نال ساڈی وابستگی ہر عمل دا حصہ اے — خام مال توں لے کے کاشتکار تک۔',
      iso: 'آئی ایس او مصدقہ',
      isoDesc: 'معیاری ضوابط',
      s1Title: 'خام مال دا حصول',
      s1Desc: 'عالمی اداریاں توں درآمد کردہ بہترین اجزاء۔',
      s2Title: 'لیبارٹری ٹیسٹنگ',
      s2Desc: 'ہر بیج دا خالصیت تے افادیت لئی ٹیسٹ۔',
      s3Title: 'فیلڈ ٹرائلز',
      s3Desc: 'مختلف زرعی علاقیاں وچ فصلاں تے سخت ٹیسٹنگ۔',
      s4Title: 'کوالٹی سرٹیفیکیشن',
      s4Desc: 'مارکیٹ وچ لانچ توں پہلاں سب ضوابط پورے کرنا۔',
    },
    cta: {
      title: 'اپنی فصل دی پیداوار بدلن لئی تیار او؟',
      desc: 'ساڈے زرعی ماہرین نال رابطہ کرو تے اپنیاں فصلاں لئی بہترین حل لبھو۔ ڈیلر بنو یا ذاتی مصنوعات دی تجویز حاصل کرو۔',
      btnGetInTouch: 'رابطہ کرو',
      btnCallNow: 'ہنے کال کرو',
    },
    footer: {
      desc: 'پاکستان بھر دے ترقی پسند کاشتکاراں لئی اعلیٰ فصل تحفظ، پودیاں دی غذائیت تے جدید زرعی حل۔',
      quickLinks: 'فوری لنکس',
      categories: 'زمرے',
      contact: 'سانوں رابطہ کرو',
      copy: `© ${new Date().getFullYear()} وائٹل ایگرو کیمیکل انڈسٹریز (پرائیویٹ) لمیٹڈ۔ سارے حق محفوظ نیں۔`,
      tagline: 'آغاز توں اعلیٰ زرعی حل',
    },
    categories: {
      insecticide: 'کیڑے مار دوائی',
      herbicide: 'جڑی بوٹی مار دوائی',
      fungicide: 'فنگس مار دوائی',
      plant_nutrition: 'پودیاں دی غذائیت',
      'plant-nutrition': 'پودیاں دی غذائیت',
      'seed-treatment': 'بیج دی صفائی',
      growth_promoter: 'نمو ودھاون والا',
      special_product: 'خاص مصنوع',
      soil_conditioner: 'مٹی دا کنڈیشنر',
    },
    pricing: {
      packSize: 'پیکنگ سائز',
      cartonPacking: 'کارٹن پیکنگ',
      netRate: 'نیٹ ریٹ',
      genericName: 'جنرک ناں',
      retailPrice: 'ریٹیل پرائس (روپے)',
    },
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('vital_agro_lang');
        if (saved === 'ur' || saved === 'pb') return saved;
      }
    } catch (e) {
      console.warn("localStorage check failed in LanguageProvider:", e);
    }
    return 'en';
  });

  // State to trigger re-renders when CMS overrides are updated
  const [cmsUpdateToken, setCmsUpdateToken] = useState(0);

  useEffect(() => {
    const handleCmsUpdate = () => {
      setCmsUpdateToken(prev => prev + 1);
    };
    window.addEventListener('vital_cms_updated', handleCmsUpdate);
    return () => window.removeEventListener('vital_cms_updated', handleCmsUpdate);
  }, []);

  useEffect(() => {
    const direction = lang === 'ur' || lang === 'pb' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vital_agro_lang', newLang);
      }
    } catch (e) {
      console.warn("localStorage set failed in LanguageProvider:", e);
    }
  };

  const t = React.useMemo(() => {
    const baseLang = translations[lang] ? lang : 'en';
    const base = JSON.parse(JSON.stringify(translations[baseLang]));
    try {
      if (typeof window !== 'undefined') {
        const overridesStr = localStorage.getItem(`vital_cms_overrides_${baseLang}`);
        if (overridesStr) {
          const overrides = JSON.parse(overridesStr);
          Object.keys(overrides).forEach(sectionKey => {
            if (base[sectionKey] && typeof base[sectionKey] === 'object') {
              base[sectionKey] = { ...base[sectionKey], ...overrides[sectionKey] };
            } else {
              base[sectionKey] = overrides[sectionKey];
            }
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load CMS overrides:", e);
    }
    return base;
  }, [lang, cmsUpdateToken]);
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div 
        dir={t.dir} 
        lang={lang}
        className={lang === 'ur' || lang === 'pb' ? 'lang-ur' : ''}
        style={{ fontFamily: (lang === 'ur' || lang === 'pb') ? "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', serif" : undefined }}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}