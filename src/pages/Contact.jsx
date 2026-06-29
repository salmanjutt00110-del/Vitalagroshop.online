import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Send, MessageCircle, Copy, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/LanguageContext';
import SEOHead from '@/lib/seo/SEOHead';

// Import Assets
import vitalAgroLogo from '@/assets/vital agro logo.webp';
import tagLogo from '@/assets/tag logo.webp';

const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

const CONTACT_TRANS = {
  en: {
    badge: "Get In Touch",
    title: "Contact Us",
    sub: "Have questions or need a quote? We're here to help.",
    connectHeader: "Let's Connect",
    connectDesc: "Whether you're a dealer looking to partner with us or a farmer seeking the best solutions for your crops, we'd love to hear from you.",
    formHeader: "Send us a Message",
    labelName: "Name",
    labelPhone: "Phone",
    labelType: "Inquiry Type",
    labelSubject: "Subject",
    labelMessage: "Message",
    inquiryGeneral: "General Inquiry",
    inquiryDealer: "Become a Dealer",
    inquiryProduct: "Product Inquiry",
    placeholderName: "Your full name",
    placeholderPhone: "Your phone number",
    placeholderSubject: "What is this about?",
    placeholderMessage: "Tell us how we can help...",
    btnSend: "Send Message",
    sending: "Sending...",
    officeLabel: "Head Office",
    phoneLabel: "Phone",
    hoursLabel: "Business Hours",
    waLabel: "WhatsApp Support",
    officeValue: "Plot No. 50 & 56, Vital Office,\nHaroonabad, Distt. Bahawalnagar, Pakistan",
    phoneValue: "063-2253137",
    hoursValue: "Monday - Saturday\n9:00 AM - 6:00 PM",
    waValue: "0301-1837160",
    chatWa: "Chat on WhatsApp",
    chatWaSub: "Quick response guaranteed",
    copyAddress: "Copy Address",
    addressCopied: "Address copied to clipboard!",
    getDirections: "Get Directions",
  },
  ur: {
    badge: "رابطہ کریں",
    title: "ہم سے رابطہ کریں",
    sub: "کوئی سوال ہے یا قیمت پوچھنا چاہتے ہیں؟ ہم مدد کے لیے موجود ہیں۔",
    connectHeader: "رابطہ بڑھائیں",
    connectDesc: "خواہ آپ ڈیلر بننا چاہیں یا اپنی فصلوں کے لیے بہترین مصنوعات تلاش کرنے والے کاشتکار ہوں، ہم سے بلا جھجھک رابطہ کریں۔",
    formHeader: "ہمیں پیغام بھیجیں",
    labelName: "نام",
    labelPhone: "فون نمبر",
    labelType: "انکوائری کی قسم",
    labelSubject: "موضوع",
    labelMessage: "پیغام",
    inquiryGeneral: "عام سوالات",
    inquiryDealer: "ڈیلر شپ حاصل کریں",
    inquiryProduct: "مصنوعات کی معلومات",
    placeholderName: "آپ کا مکمل نام",
    placeholderPhone: "آپ کا فون نمبر",
    placeholderSubject: "کس بارے میں معلومات چاہیے؟",
    placeholderMessage: "اپنا پیغام یہاں لکھیں...",
    btnSend: "پیغام جمع کروائیں",
    sending: "جمع کیا جا رہا ہے...",
    officeLabel: "ہیڈ آفس",
    phoneLabel: "فون نمبر",
    hoursLabel: "کام کے اوقات",
    waLabel: "واٹس ایپ سپورٹ",
    officeValue: "پلاٹ نمبر 50 اور 56، وائٹل آفس،\nہارون آباد، ضلع بہاولنگر، پاکستان",
    phoneValue: "063-2253137",
    hoursValue: "پیر تا ہفتہ\nصبح 9:00 بجے سے شام 6:00 بجے تک",
    waValue: "0301-1837160",
    chatWa: "واٹس ایپ چیٹ",
    chatWaSub: "فوری جواب کے لیے",
    copyAddress: "پتہ کاپی کریں",
    addressCopied: "پتہ کاپی کر لیا گیا ہے!",
    getDirections: "نقشہ دیکھیں",
  }
};

// Premium Floating Label Glass Input Component
const GlassInput = ({ label, required, error, value, onChange, placeholder, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="relative w-full text-left font-sans">
      <motion.label
        className="absolute left-4 pointer-events-none text-xs tracking-wider transition-all duration-300 select-none z-10"
        animate={{
          top: (isFocused || hasValue) ? 8 : 18,
          fontSize: (isFocused || hasValue) ? '9px' : '12px',
          fontWeight: (isFocused || hasValue) ? 900 : 700,
          color: isFocused ? '#10B981' : 'rgba(255, 255, 255, 0.4)',
        }}
      >
        {label} {required && <span className="text-[#8AD65A] ml-0.5">*</span>}
      </motion.label>
      <input
        {...props}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`w-full bg-black/45 border rounded-2xl px-4 pb-2.5 pt-6 text-sm text-white outline-none transition-all duration-300 backdrop-blur-xl ${
          isFocused 
            ? 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30' 
            : error 
              ? 'border-red-500/50' 
              : 'border-white/8 hover:border-white/15'
        }`}
      />
      {error && (
        <p className="text-red-400 text-[10px] font-bold mt-1.5 ml-1 flex items-center gap-1">
          <AlertCircle size={10} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

// Premium Floating Label Glass Textarea Component
const GlassTextarea = ({ label, required, error, value, onChange, placeholder, rows = 4, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="relative w-full text-left font-sans">
      <motion.label
        className="absolute left-4 pointer-events-none text-xs tracking-wider transition-all duration-300 select-none z-10"
        animate={{
          top: (isFocused || hasValue) ? 8 : 18,
          fontSize: (isFocused || hasValue) ? '9px' : '12px',
          fontWeight: (isFocused || hasValue) ? 900 : 700,
          color: isFocused ? '#10B981' : 'rgba(255, 255, 255, 0.4)',
        }}
      >
        {label} {required && <span className="text-[#8AD65A] ml-0.5">*</span>}
      </motion.label>
      <textarea
        {...props}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-black/45 border rounded-2xl px-4 pb-2.5 pt-6 text-sm text-white outline-none resize-none transition-all duration-300 backdrop-blur-xl ${
          isFocused 
            ? 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30' 
            : error 
              ? 'border-red-500/50' 
              : 'border-white/8 hover:border-white/15'
        }`}
      />
      {error && (
        <p className="text-red-400 text-[10px] font-bold mt-1.5 ml-1 flex items-center gap-1">
          <AlertCircle size={10} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default function Contact() {
  const location = useLocation();
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '', type: 'general' });
  const [validationErrors, setValidationErrors] = useState({});
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { lang } = useLanguage();
  const isRTL = lang === 'ur' || lang === 'pb';

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const typeParam = queryParams.get('type') || queryParams.get('inquiry');
    if (typeParam === 'dealer' || typeParam === 'dealer_inquiry') {
      setForm(prev => ({ ...prev, type: 'dealer_inquiry' }));
    } else if (typeParam === 'product' || typeParam === 'product_inquiry') {
      setForm(prev => ({ ...prev, type: 'product_inquiry' }));
    } else {
      setForm(prev => ({ ...prev, type: 'general' }));
    }
  }, [location.search]);

  const cTrans = CONTACT_TRANS[lang] || CONTACT_TRANS.en;

  // Real-time validaton checks
  const handleNameChange = (val) => {
    setForm(prev => ({ ...prev, name: val }));
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: null }));
    }
  };

  const handlePhoneChange = (val) => {
    setForm(prev => ({ ...prev, phone: val }));
    if (validationErrors.phone) {
      setValidationErrors(prev => ({ ...prev, phone: null }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = lang === 'en' ? 'Name is required' : 'نام درج کرنا ضروری ہے';
    }
    if (form.phone.trim() && !/^03\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      errs.phone = lang === 'en'
        ? 'Enter a valid 11-digit phone number starting with 03 (e.g., 03001234567)'
        : 'درست فون نمبر درج کریں (جیسے 03001234567)';
    }
    if (!form.message.trim()) {
      errs.message = lang === 'en' ? 'Message is required' : 'پیغام لکھنا ضروری ہے';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'فیلڈز درست کریں' : 'Please correct errors',
        description: isRTL ? 'برائے مہربانی تمام فیلڈز درست طریقے سے پُر کریں۔' : 'Please complete the form correctly.'
      });
      return;
    }

    setSending(true);
    try {
      await db.entities.ContactMessage.create(form);
      toast({ 
        title: isRTL ? 'پیغام بھیج دیا گیا ہے!' : 'Message Sent!', 
        description: isRTL ? 'ہم سے رابطہ کرنے کا شکریہ۔ ہم جلد آپ سے رابطہ کریں گے۔' : 'Thank you for contacting us. We will get back to you soon.' 
      });
      setForm({ name: '', phone: '', subject: '', message: '', type: 'general' });
      setValidationErrors({});
    } catch (err) {
      toast({ 
        variant: 'destructive', 
        title: isRTL ? 'جمع کروانے میں ناکامی' : 'Submission Failed', 
        description: isRTL ? 'پیغام نہیں بھیجا جا سکا۔ دوبارہ کوشش کریں۔' : 'Could not send the message. Please try again.' 
      });
    }
    setSending(false);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(cTrans.officeValue);
    toast({
      title: cTrans.copyAddress,
      description: cTrans.addressCopied,
    });
  };

  const openMapNavigation = (mode = 'directions') => {
    const address = "Plot No. 50 & 56, Vital Office, Haroonabad, Distt. Bahawalnagar, Pakistan";
    const encodedAddress = encodeURIComponent(address);
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    let url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    if (mode === 'directions' || mode === 'navigate') {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      url = (mode === 'directions' || mode === 'navigate')
        ? `maps://maps.apple.com/?daddr=${encodedAddress}`
        : `maps://maps.apple.com/?q=${encodedAddress}`;
    } else if (/Android/.test(userAgent)) {
      url = `geo:0,0?q=${encodedAddress}`;
    }
    
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen pt-20 bg-transparent text-white" dir={isRTL ? "rtl" : "ltr"}>
      <SEOHead
        title="Contact Us | Vital Agro Chemical Industries"
        description="Get in touch with Vital Agro. Send us a message, locate our Head Office, or connect via WhatsApp for inquiries."
        url="https://vital-agro.vercel.app/contact"
      />
      
      {/* Dynamic Jameel Nastaleeq typography block */}
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/jameel-noori@1.1.2/jameel-noori.min.css');
        .urdu-nastaleeq-font {
          font-family: 'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', serif !important;
        }
      `}</style>

      {/* Header section with forest atmosphere */}
      <section className="bg-gradient-to-b from-[#020703] via-[#051107] to-[#020d06] py-24 relative overflow-hidden border-b border-white/5">
        {/* Clean Linear Grid System Background */}
        <div 
          className="absolute inset-0 z-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '45px 45px',
            backgroundPosition: 'center center',
          }}
        />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-black tracking-widest uppercase text-[#76C945] bg-[#76C945]/10 px-3 py-1 rounded-full">{cTrans.badge}</span>
            <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black text-white mt-5 mb-4 uppercase tracking-tight">
              {cTrans.title}
            </h1>
            <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              {cTrans.sub}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            
            {/* Left side: Premium Glass Contact Cards */}
            <div className="lg:col-span-2 space-y-8">
              {/* Brand Logos banner */}
              <div className="flex items-center gap-4 mb-4 select-none">
                <img
                  src={vitalAgroLogo}
                  alt="Vital Agro Logo"
                  className="h-10 w-auto object-contain"
                />
                <span className="h-6 w-px bg-white/10" />
                <img
                  src={tagLogo}
                  alt="Tag Logo"
                  className="h-8 w-auto object-contain"
                />
              </div>

              <div className="text-left">
                <h2 className="text-3xl font-black text-white tracking-tight">{cTrans.connectHeader}</h2>
                <p className="text-white/50 text-sm mt-3 leading-relaxed">
                  {cTrans.connectDesc}
                </p>
              </div>

              {/* Glass Details Cards (Phone, WhatsApp, Address, Working Hours) */}
              <div className="grid gap-4">
                {[
                  { icon: MapPin, label: cTrans.officeLabel, value: cTrans.officeValue, isAddress: true, color: 'text-amber-400' },
                  { icon: Phone, label: cTrans.phoneLabel, value: cTrans.phoneValue, isPhone: true, color: 'text-sky-400' },
                  { icon: MessageCircle, label: cTrans.waLabel, value: cTrans.waValue, isWhatsApp: true, color: 'text-emerald-400' },
                  { icon: Clock, label: cTrans.hoursLabel, value: cTrans.hoursValue, color: 'text-teal-400' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: isRTL ? 25 : -25 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 220, damping: 20 }}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.25)', boxShadow: '0 8px 30px rgba(0,0,0,0.45)' }}
                    className="flex gap-4 p-5 bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-2xl shadow-xl relative overflow-hidden transition-all duration-300 text-left group"
                  >
                    <div className="absolute inset-0 bg-emerald-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-emerald-500/30 transition-colors">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="flex-1 relative z-10">
                      <div className="flex justify-between items-center">
                        <p className="font-black text-white text-xs uppercase tracking-wider">{item.label}</p>
                        {item.isAddress && (
                          <button
                            onClick={handleCopyAddress}
                            className="inline-flex items-center gap-1.5 text-[9px] text-emerald-400 font-black hover:underline cursor-pointer border-none bg-transparent"
                          >
                            <Copy size={11} />
                            <span>{cTrans.copyAddress}</span>
                          </button>
                        )}
                      </div>
                      <p className="text-white/60 text-sm font-semibold whitespace-pre-line mt-2 leading-relaxed">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Dynamic WhatsApp Support Action card */}
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="https://wa.me/923011837160"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-emerald-950/15 rounded-2xl border border-emerald-500/25 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer min-h-[70px] shadow-2xl relative overflow-hidden text-left"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 filter blur-xl rounded-full" />
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-neutral-950 shrink-0 shadow-lg shadow-emerald-500/20">
                  <MessageCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <p className="font-black text-white text-base leading-tight">{cTrans.chatWa}</p>
                  <p className="text-[#8AD65A] text-xs font-bold mt-0.5">{cTrans.chatWaSub}</p>
                </div>
              </motion.a>
            </div>

            {/* Right side: Modern Glass Inquiry Form */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -25 : 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-left">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#76C945] to-teal-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] filter blur-3xl rounded-full pointer-events-none" />
                
                <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <span>{cTrans.formHeader}</span>
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <GlassInput
                        label={cTrans.labelName}
                        required
                        value={form.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        error={validationErrors.name}
                        placeholder={cTrans.placeholderName}
                      />
                    </div>
                    <div className="col-span-1">
                      <GlassInput
                        label={cTrans.labelPhone}
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        error={validationErrors.phone}
                        placeholder="03001234567"
                      />
                    </div>
                  </div>

                  {/* Glass drop-down selection for inquiry category */}
                  <div className="space-y-2">
                    <span className="block text-[9px] font-black text-white/35 uppercase tracking-widest ml-1">
                      {cTrans.labelType}
                    </span>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger className="w-full bg-black/45 border border-white/8 rounded-2xl px-4 py-6 text-sm text-white outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 backdrop-blur-xl transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl bg-[#090f0a]/95 border border-white/10 text-white backdrop-blur-xl">
                        <SelectItem value="general" className="rounded-xl focus:bg-emerald-500/10 focus:text-emerald-400 font-bold">{cTrans.inquiryGeneral}</SelectItem>
                        <SelectItem value="dealer_inquiry" className="rounded-xl focus:bg-emerald-500/10 focus:text-emerald-400 font-bold">{cTrans.inquiryDealer}</SelectItem>
                        <SelectItem value="product_inquiry" className="rounded-xl focus:bg-emerald-500/10 focus:text-emerald-400 font-bold">{cTrans.inquiryProduct}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <GlassInput
                    label={cTrans.labelSubject}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder={cTrans.placeholderSubject}
                  />
                  
                  <GlassTextarea
                    label={cTrans.labelMessage}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    error={validationErrors.message}
                    placeholder={cTrans.placeholderMessage}
                    rows={4}
                  />
                  
                  {/* Premium Gradient submit button */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full btn-premium-primary text-sm tracking-wide gap-2 h-14 rounded-2xl"
                  >
                    {sending ? (
                      <span className="animate-pulse flex items-center gap-2">
                        <span>⏳</span> {cTrans.sending}
                      </span>
                    ) : (
                      <>
                        <Send size={15} className="text-white shrink-0" />
                        <span>{cTrans.btnSend}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
          
          {/* Integrated Google Map inside a massive rounded glass frame container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            className="mt-16 bg-white/[0.02] border border-white/8 rounded-[32px] p-6 shadow-2xl backdrop-blur-3xl overflow-hidden group relative text-left"
            style={{
              boxShadow: '0 25px 60px rgba(0,0,0,0.65), 0 0 45px rgba(16,185,129,0.05)'
            }}
          >
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
              <div className="flex-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">
                  {lang === 'en' ? 'Interactive Directions & Navigation Control' : 'نقشہ اور نیویگیشن کنٹرول'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#76C945] animate-bounce" />
                  <span>{lang === 'en' ? 'Head Office Location Map' : 'ہیڈ آفس نقشہ مقام'}</span>
                </h3>
                <p className="text-xs text-white/50 mt-2 font-bold whitespace-pre-line leading-relaxed">{cTrans.officeValue}</p>
              </div>
              
              {/* Premium Glass Actions overlay buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full lg:w-auto shrink-0 z-10">
                <button
                  onClick={() => openMapNavigation('directions')}
                  className="flex items-center justify-center gap-1.5 btn-premium-primary text-xs tracking-wider border-none w-full"
                >
                  <MapPin size={13} className="text-white shrink-0" />
                  <span>{lang === 'en' ? 'Get Directions' : 'راستہ تلاش کریں'}</span>
                </button>

                <button
                  onClick={() => openMapNavigation('search')}
                  className="flex items-center justify-center gap-1.5 btn-premium-secondary text-xs tracking-wider w-full"
                >
                  <MapPin size={13} className="text-emerald-400 shrink-0" />
                  <span>{lang === 'en' ? 'Open in Maps' : 'گوگل میپ'}</span>
                </button>

                <button
                  onClick={() => openMapNavigation('navigate')}
                  className="flex items-center justify-center gap-1.5 btn-premium-secondary text-xs tracking-wider w-full"
                >
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  <span>{lang === 'en' ? 'Navigate' : 'نیویگیشن'}</span>
                </button>

                <button
                  onClick={handleCopyAddress}
                  className="flex items-center justify-center gap-1.5 btn-premium-secondary text-xs tracking-wider w-full"
                >
                  <Copy size={13} className="text-emerald-400 shrink-0" />
                  <span>{cTrans.copyAddress}</span>
                </button>

                <a
                  href="tel:+920632253137"
                  className="flex items-center justify-center gap-1.5 btn-premium-secondary text-xs tracking-wider no-underline w-full"
                >
                  <Phone size={13} className="text-emerald-400 shrink-0" />
                  <span>{lang === 'en' ? 'Call Office' : 'دفتر کال کریں'}</span>
                </a>

                <a
                  href="https://wa.me/923011837160"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 py-3 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20 hover:border-[#25D366]/40 transition-all duration-300 rounded-xl text-xs font-black no-underline shadow-sm"
                >
                  <MessageCircle size={13} className="text-[#25D366] shrink-0" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
            
            {/* Round Iframe frame */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 shadow-inner">
              <iframe
                src="https://maps.google.com/maps?q=Plot%20No.%2050%20%26%2056,%20Vital%20Office,%20Haroonabad,%20Bahawalnagar,%20Pakistan&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-[320px] sm:h-[450px] rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 relative z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020d06]/30 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}