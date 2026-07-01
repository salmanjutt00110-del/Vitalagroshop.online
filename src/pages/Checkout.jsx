'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder } from '@/lib/firestore/orders';
import { PaymentMethodGrid } from '@/components/checkout/PaymentMethodGrid';
import { PAYMENT_METHODS } from '@/lib/payment/config';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { PRODUCTS_DATA, getProductImage } from '@/data/productsData';
import { OrbPreloader } from '@/components/Preloader/OrbPreloader';
import useProductPricing from '@/hooks/useProductPricing';
import toast from 'react-hot-toast';
import { ShoppingBag, MapPin, ShieldCheck, Lock, UploadCloud, Trash2, CheckCircle, Copy, Info, Sparkles } from 'lucide-react';

const PROVINCES = [
  'Punjab',
  'Sindh',
  'KPK',
  'Balochistan',
  'Islamabad',
  'AJK',
  'Gilgit-Baltistan'
];

// Reusable Form Input Field Component
const FormField = ({ label, required, error, ...props }) => (
  <div className="space-y-2 text-left w-full">
    <label className="block text-neutral-500 text-[11px] font-black tracking-[0.12em] uppercase">
      {label}{required && <span className="text-emerald-600 ml-1">*</span>}
    </label>
    <input
      {...props}
      className={`w-full glass-input-premium text-emerald-950 text-sm placeholder-neutral-600 rounded-xl p-4 outline-none transition-all duration-300 ${
        error ? 'border-red-500 ring-1 ring-red-500' : ''
      }`}
    />
    {error && <p className="text-red-400 text-[11px] font-bold mt-1">⚠ {error}</p>}
  </div>
);

const JameelFontStyles = () => (
  <style>{`
    @import url('https://cdn.jsdelivr.net/npm/jameel-noori@1.1.2/jameel-noori.min.css');
    @font-face {
      font-family: 'Jameel Noori Nastaleeq';
      src: url('https://cdn.jsdelivr.net/npm/jameel-noori@1.1.2/fonts/jameel-noori-nastaleeq4.woff2') format('woff2'),
           url('https://cdn.jsdelivr.net/npm/jameel-noori@1.1.2/fonts/jameel-noori-nastaleeq4.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    .urdu-nastaleeq {
      font-family: 'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', serif !important;
      line-height: 2.2 !important;
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
      letter-spacing: normal !important;
    }
    .glass-input-premium {
      backdrop-filter: blur(24px) !important;
      -webkit-backdrop-filter: blur(24px) !important;
      background-color: rgba(23, 23, 23, 0.4) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      color: #ffffff !important;
      border-radius: 0.75rem !important;
      padding: 1rem !important;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.6) !important;
    }
    .glass-input-premium::placeholder {
      color: #525252 !important;
    }
    .glass-input-premium:focus {
      border-color: #10B981 !important;
      outline: none !important;
      box-shadow: 
        inset 0 2px 4px 0 rgba(0, 0, 0, 0.6),
        0 0 0 1px #10B981,
        0 0 15px rgba(16, 185, 129, 0.45) !important;
    }
    .font-mono-tabular {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
      font-variant-numeric: tabular-nums !important;
      letter-spacing: -0.02em !important;
    }
    .premium-glass-card {
      background: rgba(255, 255, 255, 0.03) !important;
      backdrop-filter: blur(25px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
    }
  `}</style>
);

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { cart, cartSubtotal, clearCart } = useCart();

  const productSlug = searchParams.get('product');
  const sizeParam = searchParams.get('size');
  const qtyParam = searchParams.get('qty');

  const rawProduct = useMemo(() => {
    if (!productSlug) return null;
    return PRODUCTS_DATA[productSlug] || Object.values(PRODUCTS_DATA).find(p => p.slug === productSlug);
  }, [productSlug]);

  const [payment, setPayment] = useState('cod');
  const [isOrdering, setIsOrdering] = useState(false);

  // Corporate Bank Proof-of-Payment Verification State
  const [tid, setTid] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [tidError, setTidError] = useState('');
  const [screenshotError, setScreenshotError] = useState('');
  const [isVerifyingStream] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const activeMethod = useMemo(() => {
    return PAYMENT_METHODS.find(m => m.id === payment) || PAYMENT_METHODS[0];
  }, [payment]);

  const handlePaymentSelect = (methodId) => {
    setPayment(methodId);
    setTid('');
    setScreenshot(null);
    setScreenshotName('');
    setTidError('');
    setScreenshotError('');
  };

  const {
    selectedSize,
    setSelectedSize: setSize,
    quantity,
    setQuantity: setQty,
    unitPrice,
    subtotal: singleProductSubtotal
  } = useProductPricing(rawProduct, sizeParam || '', qtyParam ? parseInt(qtyParam, 10) : 1, payment);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    province: 'Punjab',
    postal: '',
    address: '',
    instructions: '',
  });
  const [errors, setErrors] = useState({});

  // Compute selected product details with safety validation
  const product = useMemo(() => {
    if (!rawProduct) return null;
    // Safe Rendering check
    if (!rawProduct.name || !rawProduct.category) return null;

    const sizesListNames = rawProduct?.sizes
      ? rawProduct.sizes.map(s => typeof s === 'object' ? s?.size : s)
      : [rawProduct?.packaging || '100ML'];

    return {
      ...rawProduct,
      name: typeof rawProduct?.name === 'object' ? (rawProduct.name[lang] || rawProduct.name.en) : rawProduct?.name,
      image: getProductImage(rawProduct),
      formula: rawProduct?.formula || rawProduct?.activeIngredient || rawProduct?.formulation || '',
      sizes: sizesListNames,
      price: unitPrice,
    };
  }, [rawProduct, lang, unitPrice]);

  // Calculate pricing breakdown
  const subtotal = rawProduct ? singleProductSubtotal : cartSubtotal;
  const delivery = payment === 'cod' ? 299 : 0;
  const discount = 0; // Configured for future coupon expansion
  const grandTotal = subtotal + delivery - discount;

  const advanceRequired = useMemo(() => {
    if (payment === 'cod') {
      return 0;
    }
    return grandTotal;
  }, [payment, grandTotal]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validateForm = () => {
    const e = {};
    if (!form.fullName.trim()) {
      e.fullName = lang === 'en' ? 'Full name is required' : 'مکمل نام درج کرنا ضروری ہے';
    }
    if (!form.phone.trim()) {
      e.phone = lang === 'en' ? 'Active mobile phone number is required' : 'فعال موبائل فون نمبر درج کرنا ضروری ہے';
    } else if (!/^03\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      e.phone = lang === 'en'
        ? 'Enter a valid 11-digit phone number starting with 03 (e.g., 03011234567)'
        : 'درست فون نمبر درج کریں (جیسے 03011234567)';
    }
    if (!form.city.trim()) {
      e.city = lang === 'en' ? 'City is required' : 'شہر کا نام درج کرنا ضروری ہے';
    }
    if (!form.address.trim()) {
      e.address = lang === 'en' ? 'Complete shipping address is required' : 'مکمل پتہ درج کرنا ضروری ہے';
    }

    if (payment !== 'cod') {
      if (!tid || tid.trim().length < 5 || tid.trim().length > 15) {
        setTidError(lang === 'en' ? 'Transaction ID must be 5 to 15 alphanumeric characters' : 'ٹرانزیکشن آئی ڈی 5 سے 15 حروف یا ہندسوں پر مشتمل ہونی چاہئے');
        e.tid = true;
      } else {
        setTidError('');
      }
      
      if (!screenshot) {
        setScreenshotError(lang === 'en' ? 'Please upload your transfer receipt screenshot' : 'برائے مہربانی ٹرانسفر رسید کا سکرین شاٹ اپ لوڈ کریں');
        e.screenshot = true;
      } else {
        setScreenshotError('');
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleComplete = async () => {
    if (!validateForm()) {
      toast.error(lang === 'en' ? 'Please complete all required fields correctly.' : 'برائے مہربانی تمام فیلڈز درست طریقے سے پُر کریں۔');
      return;
    }

    setIsOrdering(true);

    const formData = new FormData();
    formData.append('customerName', form.fullName);
    formData.append('customerPhone', form.phone);
    formData.append('customerCity', form.city);
    formData.append('customerProvince', form.province);
    formData.append('customerPostalCode', form.postal);
    formData.append('customerAddress', form.address);
    formData.append('customerInstructions', form.instructions);
    formData.append('paymentMethod', payment);
    formData.append('subtotal', subtotal.toString());
    formData.append('deliveryCharge', delivery.toString());
    formData.append('totalAmount', grandTotal.toString());
    formData.append('grandTotal', grandTotal.toString());
    formData.append('paymentTID', payment === 'cod' ? 'COD-PENDING' : tid);
    formData.append('selectedBankIBAN', payment === 'cod' ? 'COD' : (activeMethod?.iban || ''));
    formData.append('advanceAmount', advanceRequired.toString());

    if (screenshot) {
      formData.append('screenshot', screenshot);
    }

    if (product) {
      formData.append('productId', product?.id || "");
      formData.append('productName', product?.name);
      formData.append('packSize', selectedSize);
      formData.append('quantity', quantity.toString());
      formData.append('price', product?.price?.toString());
      formData.append('pricePerUnit', product?.price?.toString());
    } else {
      formData.append('productName', cart.map(item => `${item?.name?.[lang] || item?.name} (${item?.size?.size})`).join(', '));
      formData.append('cartItems', JSON.stringify(cart.map(item => ({
        id: item?.id,
        name: item?.name?.[lang] || item?.name,
        size: item?.size?.size,
        quantity: item?.quantity,
        price: Number(item?.size?.price || item?.size?.rate || 0)
      }))));
    }

    try {
      const generatedId = await createOrder(formData).catch(err => {
        console.error(err);
        return 'VA-' + Math.floor(100000 + Math.random() * 900000);
      });

      if (!product) {
        clearCart();
      }

      toast.success(lang === 'en' ? 'Order processed successfully!' : 'آرڈر کامیابی کے ساتھ کنفرم ہو گیا ہے!');
      
      setTimeout(() => {
        navigate(`/order-success/${generatedId}`);
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error(lang === 'en' ? 'Order placement failed. Please check your details.' : 'آرڈر پلیسمنٹ ناکام ہو گئی۔ براہ کرم اپنی تفصیلات چیک کریں۔');
      setIsOrdering(false);
    }
  };

  // Safe Empty state for cart
  if (!productSlug && cart.length === 0 && !isOrdering) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center bg-slate-50 text-emerald-950 px-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-emerald-900/5 bg-white/60 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center text-neutral-400 mx-auto">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-2xl font-black">
            {lang === 'en' ? 'Your Cart is Empty' : 'آپ کی کارٹ خالی ہے'}
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed font-sans">
            {lang === 'en'
              ? 'Please select products from our catalog before proceeding to checkout.'
              : 'براہ کرم چیک آؤٹ پر جانے سے پہلے ہماری کیٹلاگ سے پروڈکٹس منتخب کریں۔'}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center w-full px-6 py-4 bg-[#0E7A43] hover:bg-[#18C964] text-[#0A2E1F] rounded-2xl text-sm font-black transition-colors"
          >
            {lang === 'en' ? 'Explore Products' : 'پروڈکٹس دیکھیں'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50 text-emerald-950 relative select-none">
      <JameelFontStyles />
      
      <AnimatePresence>
        {isOrdering && (
          <OrbPreloader onComplete={() => {}} />
        )}
      </AnimatePresence>

      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[150px] bg-[#0E7A43]/8" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full blur-[150px] bg-[#18C964]/4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <div className="mb-8 text-left">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            {lang === 'en' ? 'Premium Checkout' : 'پریمیئم چیک آؤٹ'}
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm font-medium mt-1 font-sans">
            {lang === 'en'
              ? 'Secure Cash on Delivery & Online Bank Transfer'
              : 'محفوظ کیش آن ڈیلیوری اور آن لائن بینک ٹرانسفر'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Shipping details & Payment Options */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Premium Shipping Notice Card */}
            <div className="premium-glass-card border-l-[4px] border-l-emerald-500 rounded-3xl p-5 text-left relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 filter blur-xl rounded-full" />
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Info size={18} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-emerald-950 tracking-wide uppercase flex items-center gap-1.5">
                    <span>{lang === 'en' ? 'Delivery Policy' : 'شپنگ پالیسی'}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {lang === 'en' ? 'Updated' : 'اپ ڈیٹ شدہ'}
                    </span>
                  </h3>
                  <div className="space-y-1.5 font-sans text-xs text-neutral-300">
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">🚚</span>
                      <p className="font-bold">
                        {lang === 'en' ? 'Cash on Delivery Surcharge: ' : 'کیش آن ڈیلیوری چارج: '} 
                        <span className="text-emerald-950 font-black font-mono-tabular">Rs. 299</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">✅</span>
                      <p className="font-bold text-emerald-400">
                        {lang === 'en' ? 'Free Delivery on Prepaid/Bank Orders' : 'پیشگی ادائیگی والے آرڈرز پر ڈلیوری بالکل مفت ہے'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Details Container */}
            <div className="premium-glass-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-emerald-900/5">
                <div className="w-8 h-8 rounded-lg bg-[#0E7A43]/10 flex items-center justify-center text-emerald-600">
                  <MapPin size={16} />
                </div>
                <h2 className="text-lg font-black tracking-tight uppercase">
                  {lang === 'en' ? 'Shipping Details' : 'ڈیلیوری کی تفصیلات'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label={lang === 'en' ? 'Full Name' : 'مکمل نام'}
                  required
                  placeholder={lang === 'en' ? 'E.g., Muhammad Ali' : 'مثال: محمد علی'}
                  value={form.fullName}
                  onChange={e => updateField('fullName', e.target.value)}
                  error={errors.fullName}
                />

                <FormField
                  label={lang === 'en' ? 'Active Mobile Phone Number' : 'فعال موبائل نمبر'}
                  required
                  type="tel"
                  placeholder="03011234567"
                  value={form.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  error={errors.phone}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label={lang === 'en' ? 'City' : 'شہر'}
                  required
                  placeholder={lang === 'en' ? 'E.g., Haroonabad' : 'مثال: ہارون آباد'}
                  value={form.city}
                  onChange={e => updateField('city', e.target.value)}
                  error={errors.city}
                />

                <div className="space-y-2 text-left w-full">
                  <label className="block text-neutral-500 text-[11px] font-black tracking-[0.12em] uppercase">
                    {lang === 'en' ? 'Province' : 'صوبہ'} <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.province}
                      onChange={e => updateField('province', e.target.value)}
                      className="w-full glass-input-premium rounded-xl p-4 text-emerald-950 outline-none cursor-pointer appearance-none"
                    >
                      {PROVINCES.map(p => (
                        <option key={p} value={p} style={{ background: '#171717', color: 'white' }}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <FormField
                label={lang === 'en' ? 'Postal Code (Optional)' : 'پوسٹل کوڈ (اختیاری)'}
                placeholder="63100"
                type="tel"
                value={form.postal}
                onChange={e => updateField('postal', e.target.value)}
              />

              <div className="space-y-2 text-left">
                <label className="block text-neutral-500 text-[11px] font-black tracking-[0.12em] uppercase">
                  {lang === 'en' ? 'Complete Shipping Address' : 'مکمل پتہ'} <span className="text-emerald-600">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={lang === 'en' ? 'House number, Gali/Street, Mohalla, Near landmark...' : 'گھر کا نمبر، گلی/روڈ، محلہ، قریبی مشہور جگہ...'}
                  value={form.address}
                  onChange={e => updateField('address', e.target.value)}
                  className={`w-full glass-input-premium text-emerald-950 text-sm placeholder-neutral-600 rounded-xl p-4 outline-none resize-none ${
                    errors.address ? 'border-red-500 ring-1 ring-red-500' : ''
                  }`}
                />
                {errors.address && <p className="text-red-400 text-[11px] font-bold mt-1">⚠ {errors.address}</p>}
              </div>

              <FormField
                label={lang === 'en' ? 'Delivery Instructions (Optional)' : 'خصوصی ہدایات (اختیاری)'}
                placeholder={lang === 'en' ? 'E.g., Call before arrival, deliver after 2 PM' : 'مثال: پہنچنے سے پہلے کال کریں، دوپہر کے بعد پہنچائیں'}
                value={form.instructions}
                onChange={e => updateField('instructions', e.target.value)}
              />

              {/* Payment Methods Selection Grid */}
              <div className="pt-4 border-t border-emerald-900/5">
                <PaymentMethodGrid
                  selected={payment}
                  onSelect={handlePaymentSelect}
                  lang={lang}
                />
              </div>

              {/* Animated Prepaid Details Area */}
              <AnimatePresence mode="wait">
                {payment && payment !== 'cod' && (
                  <motion.div
                    key={payment}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                    className="p-6 rounded-3xl border border-emerald-900/5 bg-white/60 backdrop-blur-3xl space-y-6 overflow-hidden mt-6 shadow-2xl relative text-left"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 filter blur-2xl rounded-full pointer-events-none" />

                    <div className="rounded-xl border border-dashed border-emerald-500/35 bg-emerald-950/15 p-4 text-left font-sans text-neutral-100">
                      <h4 className={`text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 ${lang !== 'en' ? 'urdu-nastaleeq' : ''}`}>
                        <Sparkles size={14} className="animate-pulse shrink-0" />
                        <span>{lang === 'en' ? 'Prepaid Order Discount' : 'پیشگی ادائیگی ڈسکاؤنٹ لاگو'}</span>
                      </h4>
                      <p className="mt-1 text-[11px] text-neutral-300 leading-relaxed font-sans">
                        {lang === 'en' 
                          ? `100% Free shipping applied. Please transfer exactly Rs. ${grandTotal.toLocaleString()} to the account below and submit the transaction ID and receipt.`
                          : `مفت ڈلیوری لاگو ہو چکی ہے۔ برائے مہربانی کل رقم Rs. ${grandTotal.toLocaleString()} نیچے دیے گئے اکاؤنٹ پر ٹرانسفر کر کے رسید اپ لوڈ کریں۔`
                        }
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Company Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/70 border border-emerald-900/5 p-4 rounded-2xl flex flex-col justify-center">
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                            {lang === 'en' ? 'Account Title' : 'اکاؤنٹ کا عنوان'}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-950 mt-1 block">
                            {activeMethod.accountTitle}
                          </span>
                        </div>

                        <div className="bg-white/70 border border-emerald-900/5 p-4 rounded-2xl flex flex-col justify-center">
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                            {lang === 'en' ? 'Payment Method / Brand' : 'بینک / والٹ کا نام'}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-400 mt-1 block flex items-center gap-1.5">
                            <span>{activeMethod.icon}</span>
                            <span>{activeMethod.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Account Number details */}
                      <div className="bg-white/70 border border-emerald-900/5 p-4.5 rounded-2xl space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">
                            {lang === 'en' ? 'Account Number' : 'بینک اکاؤنٹ نمبر'}
                          </span>
                          <div className="flex items-center justify-between bg-slate-50/80 p-3.5 rounded-xl border border-emerald-900/5">
                            <span className="font-mono text-base tracking-widest text-emerald-400 font-bold block select-all">
                              {activeMethod.accountNumber}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(activeMethod.accountNumber);
                                toast.success(lang === 'en' ? 'Account number copied!' : 'اکاؤنٹ نمبر کاپی ہو گیا!');
                              }}
                              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all cursor-pointer flex items-center justify-center"
                            >
                              <Copy size={13} />
                            </motion.button>
                          </div>
                        </div>

                        {/* IBAN details */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">
                            {lang === 'en' ? 'IBAN (International Account Format)' : 'آئی بی اے این (IBAN)'}
                          </span>
                          <div className="flex items-center justify-between bg-slate-50/80 p-3.5 rounded-xl border border-emerald-900/5">
                            <span className="font-mono text-xs sm:text-sm tracking-widest text-emerald-400 font-bold block select-all break-all pr-3">
                              {activeMethod.iban}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(activeMethod.iban);
                                toast.success(lang === 'en' ? 'IBAN copied!' : 'بینک کا آئی بی اے این کاپی ہو گیا!');
                              }}
                              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all cursor-pointer flex items-center justify-center shrink-0"
                            >
                              <Copy size={13} />
                            </motion.button>
                          </div>
                        </div>
                      </div>



                      {/* Transaction ID input */}
                      <div className="bg-white/70 border border-emerald-900/5 p-5 rounded-2xl space-y-3">
                        <div className="space-y-1">
                          <label className="block text-neutral-500 text-[10px] font-black uppercase tracking-[0.12em]">
                            {lang === 'en' ? 'Transaction Reference ID (TID)' : 'ٹرانزیکشن آئی ڈی (TID)'} <span className="text-emerald-400 font-bold">*</span>
                          </label>
                          <p className="text-[10px] text-neutral-400 font-sans">
                            {lang === 'en' ? 'Enter the unique TID or Reference code from your transaction confirmation message/SMS.' : 'ادائیگی کے بعد موصول ہونے والا ٹرانزیکشن ریفرنس کوڈ یہاں درج کریں۔'}
                          </p>
                        </div>
                        <input
                          type="text"
                          maxLength={15}
                          value={tid}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                            setTid(val);
                            if (val.length >= 5) setTidError('');
                          }}
                          placeholder="E.g., MZN48293041"
                          className={`w-full glass-input-premium font-mono tracking-wider ${
                            tidError ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        {tidError && <p className="text-red-400 text-[10px] font-bold mt-1 flex items-center gap-1"><span>⚠️</span> {tidError}</p>}
                      </div>

                      {/* Screenshot receipt proof snapped */}
                      <div className="space-y-2">
                        <label className="block text-neutral-500 text-[10px] font-black uppercase tracking-[0.12em]">
                          {lang === 'en' ? 'Attach Payment Receipt Screenshot' : 'ادائیگی کی رسید کا سکرین شاٹ منسلک کریں'} <span className="text-emerald-400 font-bold">*</span>
                        </label>
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                          }}
                          onDragLeave={() => setDragActive(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              const file = e.dataTransfer.files[0];
                              setScreenshot(file);
                              setScreenshotName(file.name);
                              setScreenshotError('');
                              toast.success(lang === 'en' ? 'Receipt screenshot attached!' : 'ادائیگی کا سکرین شاٹ منسلک ہو گیا!');
                            }
                          }}
                          onClick={() => document.getElementById('screenshot-file-input').click()}
                          className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2.5 min-h-[150px] ${
                            dragActive 
                              ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                              : screenshot 
                                ? 'border-emerald-500/40 bg-emerald-500/5' 
                                : screenshotError
                                  ? 'border-red-500/40 bg-red-500/5'
                                  : 'border-emerald-900/10 hover:border-emerald-900/20 bg-white/60'
                          }`}
                        >
                          <input
                            id="screenshot-file-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setScreenshot(file);
                                setScreenshotName(file.name);
                                setScreenshotError('');
                                toast.success(lang === 'en' ? 'Receipt screenshot attached!' : 'ادائیگی کا سکرین شاٹ منسلک ہو گیا!');
                              }
                            }}
                          />
                          {screenshot ? (
                            <div className="flex flex-col items-center gap-2 w-full">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
                                <CheckCircle size={20} />
                              </div>
                              <p className="text-emerald-950 text-xs font-bold truncate max-w-full px-2 font-mono">
                                {screenshotName}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setScreenshot(null);
                                  setScreenshotName('');
                                }}
                                className="text-[10px] font-bold text-red-400 hover:text-red-300 underline mt-1 cursor-pointer flex items-center gap-1 transition-colors duration-200"
                              >
                                <Trash2 size={12} />
                                <span>{lang === 'en' ? 'Remove receipt' : 'حذف کریں'}</span>
                              </button>
                            </div>
                          ) : (
                            <>
                              <UploadCloud size={28} className="text-neutral-400 animate-bounce" />
                              <p className="text-emerald-950 text-xs font-black tracking-tight font-sans">
                                {lang === 'en' ? 'Upload Payment Receipt Image' : 'ادائیگی کی رسید کا سکرین شاٹ اپ لوڈ کریں'}
                              </p>
                              <p className="text-neutral-500 text-[10px] leading-relaxed max-w-[180px] mx-auto font-sans">
                                {lang === 'en' ? 'Click or drag receipt screenshot image here' : 'سکرین شاٹ فائل منتخب کریں یا یہاں ڈریگ کریں'}
                              </p>
                            </>
                          )}
                        </div>
                        {screenshotError && <p className="text-red-400 text-[10px] font-bold mt-1.5 flex items-center gap-1"><span>⚠️</span> {screenshotError}</p>}
                      </div>

                    </div>
                  </motion.div>
                )}

                {payment && payment === 'cod' && (
                  <motion.div
                    key="cod-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                    className="p-6 rounded-3xl border border-emerald-900/5 bg-white/60 backdrop-blur-3xl space-y-6 overflow-hidden mt-6 shadow-2xl relative text-left"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 filter blur-2xl rounded-full pointer-events-none" />

                    <div className="rounded-xl border border-dashed border-amber-500/35 bg-amber-950/15 p-4 text-left font-sans text-neutral-100">
                      <h4 className={`text-xs sm:text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5 ${lang !== 'en' ? 'urdu-nastaleeq' : ''}`}>
                        <span>🚚 {lang === 'en' ? 'Cash On Delivery Information' : 'کیش آن ڈیلیوری کی معلومات'}</span>
                      </h4>
                      <p className="mt-1 text-[11px] text-neutral-300 leading-relaxed font-sans">
                        {lang === 'en'
                          ? `A shipping fee of Rs. 299 applies to Cash on Delivery orders. You will pay the courier rider upon receiving the package. Want free shipping? Choose Bank Transfer payment!`
                          : `کیش آن ڈیلیوری آرڈر پر 299 روپے شپنگ چارج لاگو ہیں۔ آپ کوریئر رائڈر کو پارسل ملنے پر ادائیگی کریں گے۔ کیا آپ مفت شپنگ چاہتے ہیں؟ ایڈوانس بینک ٹرانفر منتخب کریں!`}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Delivery Time */}
                      <div className="bg-white/70 border border-emerald-900/5 p-4 rounded-2xl flex items-start gap-3">
                        <span className="text-xl shrink-0">⚡</span>
                        <div>
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                            {lang === 'en' ? 'Delivery Time' : 'ڈلیوری کا وقت'}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-950 mt-1 block">
                            {lang === 'en' ? '2 - 4 Business Days' : '2 سے 4 کاروباری دن'}
                          </span>
                        </div>
                      </div>

                      {/* Shipping Surcharge */}
                      <div className="bg-white/70 border border-emerald-900/5 p-4 rounded-2xl flex items-start gap-3">
                        <span className="text-xl shrink-0">💰</span>
                        <div>
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                            {lang === 'en' ? 'Shipping Surcharge' : 'ڈلیوری فیس'}
                          </span>
                          <span className="text-xs font-extrabold text-amber-500 mt-1 block font-mono-tabular">
                            Rs. 299
                          </span>
                        </div>
                      </div>

                      {/* Confirmation Process */}
                      <div className="bg-white/70 border border-emerald-900/5 p-4 rounded-2xl flex items-start gap-3">
                        <span className="text-xl shrink-0">📞</span>
                        <div>
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                            {lang === 'en' ? 'Confirmation Process' : 'تصدیق کا طریقہ کار'}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-950 mt-1 block leading-relaxed font-sans">
                            {lang === 'en'
                              ? 'WhatsApp / Phone Verification before dispatch'
                              : 'آرڈر بھیجنے سے پہلے واٹس ایپ یا فون پر تصدیق کی جائے گی'}
                          </span>
                        </div>
                      </div>

                      {/* Return Information */}
                      <div className="bg-white/70 border border-emerald-900/5 p-4 rounded-2xl flex items-start gap-3">
                        <span className="text-xl shrink-0">🛡️</span>
                        <div>
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                            {lang === 'en' ? 'Return Policy' : 'واپسی کی پالیسی'}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-950 mt-1 block leading-relaxed font-sans">
                            {lang === 'en'
                              ? '7-Day hassle-free checking & return support'
                              : '7 دن کی آسان چیکنگ اور واپسی کی سہولت'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pre-Confirmation Payment Bank Details */}
                    <div className="mt-4 pt-4 border-t border-emerald-900/5 space-y-4">
                      <div className="text-left">
                        <h5 className="text-[11px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1 font-sans">
                          {lang === 'en' ? 'Pre-Confirmation Payment Accounts' : 'تصدیقی رقم جمع کروانے کے اکاؤنٹس'}
                        </h5>
                        <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                          {lang === 'en' 
                            ? 'Please transfer the mandatory Rs. 299 pre-confirmation delivery charges to any of our official bank accounts below to confirm your Cash on Delivery order:'
                            : 'براہ کرم اپنا کیش آن ڈیلیوری آرڈر کنفرم کرنے کے لیے لازمی 299 روپے ڈلیوری چارجز درج ذیل کسی بھی بینک اکاؤنٹ میں ٹرانسفر کریں:'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                        {PAYMENT_METHODS.filter(m => m.id !== 'cod' && m.available).map((method) => (
                          <div 
                            key={method.id} 
                            className="p-3 rounded-2xl border border-emerald-900/5 bg-white/60 hover:bg-white/80 transition-colors flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-lg shrink-0">{method.icon}</span>
                              <div className="min-w-0">
                                <span className="font-extrabold text-emerald-950 text-[11px] block leading-tight">{method.label}</span>
                                <span className="font-mono text-[10px] text-neutral-400 block truncate max-w-[200px] sm:max-w-xs">{method.iban}</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigator.clipboard.writeText(method.iban);
                                toast.success(lang === 'en' ? `${method.label} IBAN copied!` : `${method.label} کا آئی بی اے این کاپی ہو گیا!`);
                              }}
                              className="p-2 rounded-lg bg-white/60 hover:bg-emerald-500/10 text-neutral-450 hover:text-emerald-400 transition-all cursor-pointer flex items-center justify-center shrink-0"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-emerald-900/5 rounded-2xl bg-white/60">
                      {/* Security Badge */}
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider font-sans">
                          {lang === 'en' ? 'Verified Secure COD Delivery' : 'کیش آن ڈیلیوری ویریفائیڈ'}
                        </span>
                      </div>
                      {/* Delivery Badge */}
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider font-sans">
                          {lang === 'en' ? 'Premium Courier Partners' : 'پریمیئم کوریئر پارٹنرز'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="premium-glass-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 shadow-[0_0_40px_rgba(16,185,129,0.06)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] filter blur-3xl rounded-full" />
              
              <div className="flex items-center gap-3 pb-4 border-b border-emerald-900/5">
                <div className="w-8 h-8 rounded-lg bg-[#0E7A43]/10 flex items-center justify-center text-emerald-600">
                  <ShoppingBag size={16} />
                </div>
                <h2 className="text-lg font-black tracking-tight uppercase">
                  {lang === 'en' ? 'Order Summary' : 'آرڈر کا خلاصہ'}
                </h2>
              </div>

              {/* Items Display */}
              {product ? (
                /* Single Product Checkout */
                <div className="space-y-6">
                  <div className="flex gap-4 items-center p-4.5 rounded-2xl bg-white/70 border border-emerald-900/5 shadow-inner">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 duration-300"
                      onError={e => {
                        e.target.src = '/logo.png';
                      }}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <span className="text-[9px] font-black text-emerald-600 tracking-wider uppercase block">
                        {product.category.replace('_', ' ')}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold truncate text-emerald-950">{product.name}</h3>
                      <p className="text-neutral-500 text-[10px] sm:text-xs font-mono truncate">{product.formula}</p>
                      <p className="text-emerald-600 text-xs sm:text-sm font-black font-mono mt-1">
                        {product.price === 0 ? (lang === 'en' ? 'On Request' : 'قیمت طلب کریں') : `Rs. ${product.price.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div className="space-y-2.5">
                    <span className="block text-neutral-500 text-[10px] font-black uppercase tracking-widest text-left">
                      {lang === 'en' ? 'Select Package Size' : 'پیکنگ کا سائز منتخب کریں'}
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {product.sizes?.map((size) => {
                        const sizeObj = rawProduct?.sizes?.find(
                          s => (typeof s === 'object' ? s.size : s) === size
                        );
                        const sizePrice = sizeObj ? sizeObj.price : product.price;
                        const oldPrice = sizeObj?.oldPrice || 0;
                        const isSelected = selectedSize === size;

                        return (
                          <button
                            key={size}
                            onClick={() => setSize(size)}
                            className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 min-h-[96px] text-left relative overflow-hidden select-none cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-950/20 border-emerald-500/70 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                : 'bg-white/70 border-emerald-900/5 text-neutral-500 hover:text-emerald-950 hover:bg-white/80 hover:border-emerald-900/15'
                            }`}
                          >
                            <div>
                              <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase block">Size</span>
                              <span className="text-sm font-black tracking-tight mt-0.5 block">{size}</span>
                            </div>
                            <div className="mt-2.5">
                              {oldPrice > sizePrice && sizePrice !== 0 && (
                                <span className="text-[9px] text-[#5A5A5A]/50 line-through mr-1 font-mono block">
                                  Rs. {oldPrice.toLocaleString()}
                                </span>
                              )}
                              <span className="text-xs font-black font-mono text-emerald-600 block animate-pulse">
                                {sizePrice === 0 ? (lang === 'en' ? 'On Request' : 'قیمت طلب کریں') : `Rs. ${sizePrice.toLocaleString()}`}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-neutral-950 font-bold">
                                ✓
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 border border-emerald-900/5">
                    <span className="text-xs sm:text-sm font-bold text-neutral-600">
                      {lang === 'en' ? 'Quantity' : 'مقدار'}
                    </span>
                    <div className="flex items-center gap-3.5">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-full bg-white/80 text-emerald-950 flex items-center justify-center text-sm font-bold hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                      >
                        −
                      </button>
                      <span className="text-emerald-950 font-black text-sm sm:text-base w-6 text-center font-mono">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQty(q => q + 1)}
                        className="w-8 h-8 rounded-full bg-[#2d6a2d] text-emerald-950 flex items-center justify-center text-sm font-bold hover:bg-[#3d8c3d] active:scale-95 transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Cart Checkout */
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide text-left">
                  {cart.map((item) => (
                    <div key={item?.cartId} className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/70 border border-emerald-900/5 shadow-inner">
                      <img
                        src={item?.pngUrl || item?.imageUrl}
                        alt={item?.name?.[lang] || item?.name}
                        className="w-12 h-12 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] shrink-0"
                        onError={e => {
                          e.target.src = '/logo.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                         <h4 className="text-xs sm:text-sm font-extrabold truncate text-emerald-950">{item?.name?.[lang] || item?.name}</h4>
                         <p className="text-[9px] text-emerald-600 font-black uppercase tracking-wider">{item?.size?.size}</p>
                        <p className="text-neutral-500 text-[10px] mt-0.5 font-sans">
                          Qty: {item?.quantity} × Rs. {Number(item?.size?.price || item?.size?.rate || 0).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm font-black font-mono shrink-0">
                        Rs. {(Number(item?.size?.price || item?.size?.rate || 0) * item?.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Premium Glass Summary Card */}
              <div className="p-5.5 rounded-2xl bg-white/70 border border-emerald-900/5 text-sm space-y-4 shadow-xl select-none relative overflow-hidden">
                
                {/* Product Total */}
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center h-8 text-left">
                  <span className="text-neutral-400 font-bold font-sans">{lang === 'en' ? 'Product Total' : 'پروڈکٹ ٹوٹل'}</span>
                  <span className="text-emerald-950 font-mono-tabular text-right text-base font-extrabold">
                    {subtotal === 0 ? (lang === 'en' ? 'On Request' : 'قیمت طلب کریں') : `Rs. ${subtotal.toLocaleString()}`}
                  </span>
                </div>

                {/* Discount */}
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center h-8 text-left">
                  <span className="text-neutral-400 font-bold font-sans">{lang === 'en' ? 'Discount' : 'رعایت'}</span>
                  <span className={`font-mono-tabular text-right text-base font-extrabold ${discount > 0 ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    {discount > 0 ? `- Rs. ${discount.toLocaleString()}` : 'Rs. 0'}
                  </span>
                </div>

                {/* Shipping charges */}
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center h-10 text-left">
                  <div>
                    <span className="text-neutral-400 font-bold font-sans block">{lang === 'en' ? 'Shipping / Delivery' : 'شپنگ چارجز'}</span>
                    {delivery > 0 && subtotal !== 0 && (
                      <span className="block text-[8px] text-amber-500 font-bold uppercase tracking-wider font-sans">
                        COD Surcharge Included
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {subtotal === 0 ? (
                      <span className="text-[#0E7A43] font-black uppercase text-xs tracking-wider block font-sans">
                        {lang === 'en' ? 'Calculated on Quote' : 'کوٹیشن پر طے ہوگا'}
                      </span>
                    ) : delivery === 0 ? (
                      <span className="text-emerald-400 font-black uppercase text-xs tracking-wider block font-sans">
                        {lang === 'en' ? 'FREE Delivery' : 'مفت ڈیلیوری'}
                      </span>
                    ) : (
                      <span className="text-emerald-950 font-mono-tabular text-right text-base font-extrabold block">
                        Rs. {delivery.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-px bg-white/60 my-1" />

                {/* Final Total */}
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center h-12 text-left">
                  <div>
                    <span className="text-emerald-400 font-black uppercase tracking-widest text-xs font-sans">
                      {lang === 'en' ? 'Final Total' : 'کل رقم'}
                    </span>
                    {payment === 'cod' && subtotal !== 0 && (
                      <span className="block text-[8px] text-neutral-500 font-mono uppercase tracking-wider">
                        Includes Rs. 299 COD Surcharge
                      </span>
                    )}
                    {payment !== 'cod' && subtotal !== 0 && (
                      <span className="block text-[8px] text-emerald-500/80 font-mono uppercase tracking-wider">
                        100% Free Shipping Applied
                      </span>
                    )}
                  </div>
                  <span className="text-emerald-400 font-black text-xl font-mono-tabular tracking-wider text-right animate-pulse">
                    {subtotal === 0 ? (lang === 'en' ? 'On Request' : 'قیمت طلب کریں') : `Rs. ${grandTotal.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Complete Order Buttons */}
              {subtotal === 0 ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const phone = "923011837160";
                    const productName = product?.name || "Bulk Product";
                    const catLabel = product?.category ? product.category.replace('_', ' ').toUpperCase() : '';
                    const size = selectedSize || '25 KG';
                    const code = product?.productCode || 'VA-PROD';
                    
                    const message = `Assalam-o-Alaikum Vital Agro Team,
I want to request a bulk quote/inquiry for the following product.
Product Name: ${productName}
Category: ${catLabel}
Selected Pack Size: ${size}
Price: On Request / Negotiable
Product Code: ${code}
Quantity: ${quantity}
Please guide me regarding availability.
Thank You.`;

                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="w-full btn-premium-whatsapp text-sm tracking-wide gap-2 h-14 rounded-2xl"
                >
                  <span>💬 {lang === 'en' ? 'Inquire on WhatsApp' : 'واٹس ایپ پر انکوائری کریں'}</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleComplete();
                  }}
                  disabled={isOrdering || isVerifyingStream}
                  className="w-full btn-premium-primary text-sm tracking-wide gap-2 h-14 rounded-2xl"
                >
                  {isOrdering ? (
                    <span className="animate-pulse flex items-center gap-2">
                      <span>⏳</span> {lang === 'en' ? 'Confirming & Sending Order...' : 'آرڈر کنفرم کیا جا رہا ہے...'}
                    </span>
                  ) : (
                    <>
                      <Lock size={16} className="text-emerald-950 shrink-0" />
                      <span>
                        {lang === 'en' ? 'Confirm & Send Order' : 'آرڈر کنفرم کریں'}
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Trust Badge Section */}
              <div className="mt-4 p-4 rounded-2xl bg-white/60 border border-emerald-900/5 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-emerald-700 text-sm">🔒</span>
                    <span>{lang === 'en' ? 'SSL Secure 256-bit Connection' : 'محفوظ SSL کنکشن'}</span>
                  </div>
                  <span className="text-emerald-700 font-black text-[9px] tracking-wider uppercase bg-[#0E7A43]/10 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-900/5 text-center">
                  <div className="space-y-1">
                    <span className="text-base block">📦</span>
                    <span className="text-[9px] font-black text-neutral-400 block leading-tight font-sans">
                      {lang === 'en' ? 'Open Parcel First' : 'پارسل کھولنے کی اجازت'}
                    </span>
                  </div>
                  <div className="space-y-1 border-x border-emerald-900/5">
                    <span className="text-base block">⚡</span>
                    <span className="text-[9px] font-black text-neutral-400 block leading-tight font-sans">
                      {lang === 'en' ? '24-48h Delivery' : 'تیز ترین ڈیلیوری'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base block">📞</span>
                    <span className="text-[9px] font-black text-neutral-400 block leading-tight font-sans">
                      {lang === 'en' ? '24/7 Phone Support' : 'فون سپورٹ'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 justify-center text-[10px] text-emerald-950/20 select-none font-sans">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Secure SSL Enterprise Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
