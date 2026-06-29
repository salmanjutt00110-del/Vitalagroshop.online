import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, Sprout } from 'lucide-react';
import { askGemini } from '@/lib/gemini';
import { useLanguage } from '@/lib/LanguageContext';

const PRESETS = [
  { en: "Recommend protection for Wheat rust", ur: "گندم کی کنگی کا علاج بتائیں" },
  { en: "Best pesticide for Cotton whitefly", ur: "کپاس کی سفید مکھی کا تدارک" },
  { en: "Schedule leaf feeding for Rice crops", ur: "دھان کی فصل کے لیے سپرے کا شیڈول" }
];

const CROP_KNOWLEDGE_BASE = {
  whitefly: {
    en: "🌾 **Cotton Whitefly Control:**\nWhitefly is a sucking pest that damages cotton leaves and transmits leaf curl virus.\n\n*Treatment:* Spray **Conference Gold** systemic insecticide (150-200 ml / Acre) dissolved in 120-150 Liters of clean water. Spray in early morning or late evening, targeting the undersides of leaves.\n\n*Support:* Contact us at +92-301-1837160 for further details.",
    ur: "🌾 **کپاس کی سفید مکھی کا تدارک:**\nسفید مکھی پتوں سے رس چوستی ہے اور کپاس میں مروڑی پتا وائرس پھیلاتی ہے۔\n\n*علاج:* **کانفرنس گولڈ** سسٹمک کیڑے مار دوا (150 سے 200 ملی لیٹر فی ایکڑ) کو 120 سے 150 لیٹر صاف پانی میں حل کر کے صبح یا شام کے وقت سپرے کریں، خاص طور پر پتوں کے نچلے حصے پر۔\n\n*رابطہ:* مزید معلومات کے لیے +92-301-1837160 پر رابطہ کریں۔"
  },
  rust: {
    en: "🌾 **Wheat Rust & Fungal Control:**\nWheat rust is a fungal disease causing yellow, orange, or black powdery spores on leaves and stems.\n\n*Treatment:* Apply **Purifizin Extra** broad-spectrum systemic fungicide (250-500 ml / Acre) immediately upon symptom detection to prevent crop loss.\n\n*Support:* Contact our agronomists at +92-301-1837160.",
    ur: "🌾 **گندم کی کنگی کا تدارک:**\nگندم کی کنگی فنگس کی بیماری ہے جو پتوں اور تنے پر پیلے، نارنجی یا سیاہ رنگ کے دھبے پیدا کرتی ہے۔\n\n*علاج:* کنگی کے حملے کی صورت میں فوری طور پر **پیوریفیزن ایکسٹرا** سسٹمک فنگس کش دوا (250 سے 500 ملی لیٹر فی ایکڑ) کا سپرے کریں۔\n\n*رابطہ:* ہمارے زرعی ماہرین سے +92-301-1837160 پر مشورہ کریں۔"
  },
  aphids: {
    en: "🌱 **Aphids / Sucking Pests:**\nAphids feed on young shoots and leaves, stunting crop growth.\n\n*Treatment:* Use **Conference Gold** systemic protection (150 ml / Acre) or **Easy Grow** depending on crop stage.\n\n*Support:* WhatsApp us at +92-301-1837160 for custom recommendations.",
    ur: "🌱 **سست تیلا / چوسنے والے کیڑے:**\nتیلا نازک شاخوں اور پتوں سے رس چوس کر پودے کی نشوونما کو روکتا ہے۔\n\n*علاج:* فصل کے مرحلے کے مطابق **کانفرنس گولڈ** (150 ملی لیٹر فی ایکڑ) یا **ایزی گرو** کا استعمال کریں۔\n\n*رابطہ:* مزید رہنمائی کے لیے +92-301-1837160 پر واٹس ایپ کریں۔"
  },
  fertilizer: {
    en: "🌱 **Fertilizers & Plant Nutrition:**\nImprove crop yield and vigor with high-quality organic micronutrients and growth stimulators.\n\n*Products:* **Fatty** (organic fatty acids and chelated micronutrients) or **Easy Grow** (containing GA3, Potassium Humate, and Fulvic Acid).\n\n*Support:* Consult our team at +92-301-1837160 for schedule details.",
    ur: "🌱 **کھاد اور پلانٹ نیوٹریشن:**\nفصل کی پیداوار اور طاقت بڑھانے کے لیے اعلیٰ معیار کے نامیاتی مائیکرو نیوٹرینٹس اور گروتھ پروموٹرز استعمال کریں۔\n\n*مصنوعات:* **فیٹی** (نامیاتی فیٹی ایسڈز) یا **ایزی گرو** (ہیومک ایسڈ، فلوک ایسڈ اور جبرالک ایسڈ کا مرکب)۔\n\n*رابطہ:* سپرے کے شیڈول کے لیے ہمارے نمائندے سے +92-301-1837160 پر رابطہ کریں۔"
  },
  pricing: {
    en: "💰 **Pricing & Delivery Info:**\n*Price range:* PKR 500 to PKR 5,000 depending on the pack size (e.g. 100ml, 250ml, 500ml, 1L, or bulk carton).\n\n*Delivery:* 2-4 business days across Pakistan. Free delivery for Full Bank Advance Payment. Cash on Delivery (COD) requires a mandatory pre-confirmation payment of 299 PKR upfront.\n\n*Support:* +92-301-1837160.",
    ur: "💰 **قیمت اور ڈیلیوری کی معلومات:**\n*قیمت کا پیمانہ:* مختلف پیکنگ سائزز کے مطابق 500 روپے سے 5000 روپے تک۔\n\n*ڈیلیوری:* پاکستان بھر میں 2 سے 4 کاروباری دنوں میں۔ بینک میں مکمل پیشگی ادائیگی پر فری ڈیلیوری دستیاب ہے۔ کیش آن ڈیلیوری (COD) کے لیے 299 روپے کی ڈلیوری فیس پیشگی ادا کرنا لازمی ہے۔\n\n*رابطہ:* +92-301-1837160۔"
  },
  order: {
    en: "📦 **Order Status & Tracking:**\nYou can track your order in real-time. Simply head to the tracking section of the website `/track/:orderId` using your Order Number (e.g. VA-XXXXXX) to view status, history, and PDF invoice.\n\n*Support:* Contact +92-301-1837160 for instant help.",
    ur: "📦 **آرڈر کا اسٹیٹس اور ٹریکنگ:**\nآپ اپنے آرڈر کی لائیو ٹریکنگ کر سکتے ہیں۔ ویب سائٹ کے ٹریکنگ پیج `/track/:orderId` پر جائیں اور اپنا آرڈر نمبر درج کر کے اسٹیٹس اور انوائس دیکھیں۔\n\n*رابطہ:* فوری مدد کے لیے +92-301-1837160 پر رابطہ کریں۔"
  },
  default: {
    en: "Hello! Thank you for reaching out to Vital Agro.\nI specialize in crop protection, plant nutrition, and progressive farming in Pakistan.\n\nFor custom diagnostic advice or order assistance, please click the button below to chat with our agronomy team on WhatsApp (+92-301-1837160).",
    ur: "خوش آمدید! وائٹل ایگرو سے رابطہ کرنے کا شکریہ۔\nمیں پاکستان میں فصلوں کی حفاظت، پودوں کی غذائیت، اور جدید زراعت کا ماہر ہوں۔\n\nتفصیلی زرعی مشورے یا آرڈر کے متعلق رہنمائی کے لیے نیچے دیے گئے بٹن پر کلک کر کے واٹس ایپ (+92-301-1837160) پر رابطہ کریں۔"
  }
};

const getLocalAnswer = (query, lang) => {
  const q = query.toLowerCase();
  
  if (q.includes('whitefly') || q.includes('مکھی') || q.includes('fly')) {
    return CROP_KNOWLEDGE_BASE.whitefly[lang] || CROP_KNOWLEDGE_BASE.whitefly.en;
  }
  if (q.includes('rust') || q.includes('کنگی') || q.includes('blight') || q.includes('جھلساؤ') || q.includes('fung') || q.includes('fungs')) {
    return CROP_KNOWLEDGE_BASE.rust[lang] || CROP_KNOWLEDGE_BASE.rust.en;
  }
  if (q.includes('aphid') || q.includes('تیلا') || q.includes('suck') || q.includes('chous')) {
    return CROP_KNOWLEDGE_BASE.aphids[lang] || CROP_KNOWLEDGE_BASE.aphids.en;
  }
  if (q.includes('fertilizer') || q.includes('nutrition') || q.includes('کھاد') || q.includes('بڑھوتری') || q.includes('growth') || q.includes('fatty') || q.includes('easy grow') || q.includes('promoter')) {
    return CROP_KNOWLEDGE_BASE.fertilizer[lang] || CROP_KNOWLEDGE_BASE.fertilizer.en;
  }
  if (q.includes('price') || q.includes('rate') || q.includes('cost') || q.includes('delivery') || q.includes('payment') || q.includes('ship') || q.includes('چارجز') || q.includes('قیمت') || q.includes('پیسے')) {
    return CROP_KNOWLEDGE_BASE.pricing[lang] || CROP_KNOWLEDGE_BASE.pricing.en;
  }
  if (q.includes('order') || q.includes('track') || q.includes('status') || q.includes('آرڈر') || q.includes('ٹریک')) {
    return CROP_KNOWLEDGE_BASE.order[lang] || CROP_KNOWLEDGE_BASE.order.en;
  }
  
  return CROP_KNOWLEDGE_BASE.default[lang] || CROP_KNOWLEDGE_BASE.default.en;
};

export default function AICropAssistant() {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vital_agro_assistant_opened') === 'true';
    }
    return false;
  });

  const handleToggleOpen = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && !hasOpened) {
      setHasOpened(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vital_agro_assistant_opened', 'true');
      }
    }
  };

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: lang === 'en' 
        ? "Hello! I am your Vital Agro AI Farming Advisor. How can I help you grow healthier crops today?" 
        : "سلام! میں آپ کا وائٹل ایگرو اے آئی فارمنگ ایڈوائزر ہوں۔ آج میں آپ کی فصلوں کے لیے کیا مدد کر سکتا ہوں؟"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    if (!textToSend) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setIsLoading(true);

    const systemContext = `
      You are "Vital Agro's Agricultural AI Advisor".
      You are a professional agronomist specializing in crop protection, plant nutrition, and progressive farming in Pakistan.
      You must answer questions about:
      - Vital Agro Products (Conference Gold systemic insecticide, Vital Leaf feeds, growth promoters, fungicides, herbicides).
      - Prices (range from PKR 500 to PKR 5,000 depending on pack size and selection).
      - Categories (Insecticides, Herbicides, Fungicides, Plant Nutrition, Growth Promoters).
      - Crops (Cotton, Wheat, Rice, Sugarcane, Maize, Vegetables).
      - Delivery Time (2-4 business days across Pakistan. Free shipping on Full Bank Advance Payment; Cash on Delivery has 299 PKR upfront delivery fee).
      - Order Status (Customers can track orders in real-time at "/track/:orderId" using their document ID, or view invoices).
      - Payment Methods (Cash on Delivery with 299 PKR upfront deposit, Full Bank Advance Payment).
      - Refund Policy (Claims/complaints must be reported to support within 24 hours of delivery).
      - Company Info (Vital Agro Chemical Industries, located in Haroonabad, Bahawalpur, Punjab, Pakistan).
      - Contact Info (WhatsApp Support: +92-301-1837160, Email: support@vitalagro.com, hours: 9 AM - 6 PM Monday-Saturday).

      If a user asks about anything else outside of these agricultural and platform topics, or if you cannot answer, politely inform them of your limits and suggest they open WhatsApp Live Support (using phone +92-301-1837160).
      Keep your response detailed, clear, and bilingual (English + Urdu) to help Pakistani farmers.
      User query: ${query}
    `;

    try {
      const reply = await askGemini(systemContext);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      console.warn("AI Advisor network/auth error, falling back to local database:", err);
      const fallbackReply = getLocalAnswer(query, lang);
      setMessages(prev => [...prev, { role: 'model', text: fallbackReply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {/* Floating Action Button */}
      <motion.button
        onClick={handleToggleOpen}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-tr from-[#1e5c1e] to-[#76C945] text-emerald-950 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(118,201,69,0.35)] border border-[#76C945]/40 relative overflow-hidden"
        style={{ touchAction: 'manipulation' }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <MessageSquare size={24} />
              {!hasOpened && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Conversation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="absolute bottom-20 right-0 w-[90vw] max-w-[380px] h-[520px] rounded-3xl overflow-hidden border border-emerald-900/10 shadow-[0_30px_70px_rgba(0,0,0,0.5)] flex flex-col"
            style={{
              background: 'rgba(10, 26, 15, 0.96)',
              backdropFilter: 'blur(30px)'
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-emerald-900/5 bg-gradient-to-r from-white/[0.04] to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#76C945]/15 border border-[#76C945]/30 rounded-xl flex items-center justify-center text-emerald-600">
                  <Sprout size={18} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-emerald-950 font-bold text-sm tracking-wide flex items-center gap-1.5">
                    Vital Agro Advisor
                    <span className="flex items-center px-1.5 py-0.5 rounded-full bg-[#76C945]/15 text-emerald-600 text-[8px] font-black uppercase">
                      24/7 AI
                    </span>
                  </h4>
                  <p className="text-neutral-500 text-[10px] font-medium">
                    {lang === 'en' ? 'Online • Crop & Soil Specialist' : 'آن لائن • زرعی ماہر'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-emerald-950 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    m.role === 'user' 
                      ? 'bg-white/8 border-emerald-900/10 text-emerald-950' 
                      : 'bg-[#76C945]/10 border-[#76C945]/30 text-emerald-600'
                  }`}>
                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-[#225c22] to-[#2d7a2d] text-emerald-950 border border-[#76C945]/20 rounded-tr-none'
                      : 'bg-white/60 text-emerald-950/95 border border-emerald-900/5 rounded-tl-none'
                  }`}>
                    <div>{m.text}</div>
                    {m.role === 'model' && (m.text.includes('+92-301-1837160') || m.text.toLowerCase().includes('whatsapp')) && (
                      <div className="mt-3">
                        <a 
                          href="https://wa.me/923011837160" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25d366] hover:bg-[#20ba5a] text-[#0A2E1F] font-black text-[10px] rounded-xl transition-all shadow-md shadow-[#25d366]/20"
                        >
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.235-1.635l.359.214a9.818 9.818 0 005.007 1.368c5.42 0 9.818-4.398 9.818-9.818 0-2.618-1.018-5.08-2.868-6.932A9.784 9.784 0 0012 2.182c-5.42 0-9.818 4.398-9.818 9.818 0 2.13.554 4.2 1.613 6.002l.234.372-.993 3.629 3.722-.977z"/>
                          </svg>
                          <span>WhatsApp Support</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#76C945]/10 border-[#76C945]/30 text-emerald-600 flex items-center justify-center shrink-0">
                    <Bot size={14} className="animate-spin" />
                  </div>
                  <div className="bg-white/60 border border-emerald-900/5 rounded-2xl rounded-tl-none p-4 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Presets and Input */}
            <div className="p-3 border-t border-emerald-900/5 bg-white/60 space-y-3">
              {/* Prompt Suggestion Chips */}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest pl-1">
                    {lang === 'en' ? 'SUGGESTED TOPICS:' : 'تجویز کردہ موضوعات:'}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(p[lang])}
                        className="w-full text-left p-2.5 bg-white/60 border border-emerald-900/5 hover:border-[#76C945]/40 hover:bg-white/8 rounded-xl text-[10px] sm:text-xs text-neutral-600 hover:text-emerald-950 transition-all flex items-center gap-1.5"
                      >
                        <Sparkles size={10} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{p[lang]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TextInput Form */}
              <div className="flex items-center gap-2 bg-white/60 rounded-2xl border border-emerald-900/5 p-1.5 focus-within:border-[#76C945]/40 transition-colors">
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'Ask about crops, diseases...' : 'فصلوں یا بیماریوں کے بارے میں پوچھیں...'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-transparent border-none outline-none pl-3 text-xs sm:text-sm text-emerald-950 placeholder:text-neutral-400"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 bg-[#76C945] hover:bg-[#8AD65A] disabled:bg-white/80 text-[#0A2E1F] disabled:text-neutral-400 rounded-xl flex items-center justify-center transition-colors shrink-0"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
