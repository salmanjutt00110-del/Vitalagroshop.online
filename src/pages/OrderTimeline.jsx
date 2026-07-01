import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, doc, onSnapshot } from '@/lib/api';
import { motion } from 'framer-motion';
import { FileDown, MapPin, Truck, CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { downloadInvoice } from '@/lib/pdf/InvoiceGenerator';
import { useLanguage } from '@/lib/LanguageContext';
import SEOHead from '@/lib/seo/SEOHead';

const TRACKING_STEPS = [
  { status: 'pending', labelEn: 'Order Registered', labelUr: 'آرڈر رجسٹرڈ ہوا', descEn: 'Order recorded. Awaiting payment processing.', descUr: 'آرڈر درج کر لیا گیا ہے۔ ادائیگی کا عمل شروع ہونے کا انتظار ہے۔' },
  { status: 'payment_verified', labelEn: 'AI Payment Verified', labelUr: 'اے آئی ادائیگی کی تصدیق', descEn: 'Receipt screenshot read and verified by AI.', descUr: 'رسید کا سکرین شاٹ اے آئی سے تصدیق شدہ ہے۔' },
  { status: 'confirmed', labelEn: 'Order Confirmed', labelUr: 'آرڈر کنفرمڈ', descEn: 'Warehouse logistics approved the dispatch details.', descUr: 'گودام سے آرڈر کی تیاری شروع کر دی گئی ہے۔' },
  { status: 'dispatched', labelEn: 'Dispatched / In Transit', labelUr: 'روانہ کر دیا گیا', descEn: 'Your package is on the way via courier logistics.', descUr: 'آپ کا آرڈر کوریئر سروس کے ذریعے روانہ کر دیا گیا ہے۔' },
  { status: 'delivered', labelEn: 'Delivered', labelUr: 'پہنچ گیا', descEn: 'The shipment has arrived at your destination address.', descUr: 'آرڈر کامیابی کے ساتھ آپ کے پتے پر پہنچ گیا ہے۔' }
];

export default function OrderTimeline() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, 'orders', id);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        setOrder(null);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#071910] text-emerald-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#0E7A43] border-t-transparent animate-spin" />
          <p className="text-xs text-neutral-500 tracking-wider">Loading Tracking Timeline...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#071910] text-emerald-950 px-4">
        <div className="max-w-md w-full text-center space-y-5 p-8 rounded-3xl border border-emerald-900/10 bg-white/60 backdrop-blur-xl">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-black">Information currently unavailable.</h2>
          <p className="text-sm text-neutral-500 leading-relaxed font-semibold">
            {lang === 'en' 
              ? 'The tracking ID is invalid or has expired. Please verify your link and try again.'
              : 'آرڈر ٹریکنگ آئی ڈی درست نہیں ہے۔ براہ کرم لنک چیک کر کے دوبارہ کوشش کریں۔'}
          </p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0E7A43] hover:bg-[#18C964] text-[#0A2E1F] rounded-full text-sm font-black transition-colors">
            <ShoppingBag size={16} />
            <span>{lang === 'en' ? 'Go to Products' : 'مصنوعات پر جائیں'}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Determine current active step index
  const getActiveStepIndex = () => {
    switch (order.status) {
      case 'pending_payment':
      case 'pending': 
        return 0;
      case 'payment_uploaded':
      case 'ai_reviewing':
      case 'payment_verified':
        return 1;
      case 'confirmed': 
        return 2;
      case 'dispatched': 
        return 3;
      case 'delivered': 
        return 4;
      default: 
        return 0;
    }
  };

  const currentStepIndex = getActiveStepIndex();

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#F4F7F5] dark:bg-[#071910] transition-colors duration-300 text-foreground dark:text-emerald-950">
      <SEOHead
        title={`Track Order ${order.orderNumber || ''} | Vital Agro`}
        description="Track your agricultural crop protection order timeline and download invoices in real time."
      />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link 
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{lang === 'en' ? 'Back to Catalog' : 'کیٹلاگ پر واپس جائیں'}</span>
        </Link>

        {/* Order Details Title Summary */}
        <div className="p-6 bg-white dark:bg-white/80 border border-border dark:border-emerald-900/10 rounded-3xl shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-primary uppercase tracking-widest block mb-1">
              {lang === 'en' ? 'ORDER TRACKING SYSTEM' : 'آرڈر ٹریکنگ سسٹم'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Order: <span className="font-mono text-primary">{order.orderNumber}</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {lang === 'en' ? 'Tracking real-time courier statuses & payment confirmations' : 'کوریئر سٹیٹس اور ادائیگیوں کی ریئل ٹائم مانیٹرنگ'}
            </p>
          </div>
          
          <button
            onClick={() => downloadInvoice(order)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#0E7A43] hover:bg-[#18C964] text-[#0A2E1F] rounded-2xl text-xs font-black transition-colors shadow-md shadow-[#0E7A43]/10"
          >
            <FileDown size={14} />
            <span>{lang === 'en' ? 'Download PDF Bill' : 'بل پی ڈی ایف ڈاؤن لوڈ کریں'}</span>
          </button>
        </div>

        {/* Timeline Visual Track */}
        <div className="p-8 bg-white dark:bg-white/80 border border-border dark:border-emerald-900/10 rounded-3xl shadow-sm">
          <div className="relative border-l-2 border-border dark:border-emerald-900/10 ml-4 pl-8 space-y-10">
            {TRACKING_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isActive = idx === currentStepIndex;

              return (
                <motion.div 
                  key={step.status}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative text-left"
                >
                  {/* Step Dot Icon Indicator */}
                  <span className={`absolute -left-[43px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primary border-primary text-[#0A2E1F]'
                      : 'bg-background dark:bg-[#071910] border-border dark:border-emerald-900/10 text-muted-foreground/40'
                  }`}>
                    {step.status === 'delivered' ? (
                      <CheckCircle2 size={12} className="stroke-[3]" />
                    ) : step.status === 'dispatched' ? (
                      <Truck size={10} className="stroke-[3]" />
                    ) : (
                      <span className="w-1.5 h-1.5 bg-current rounded-full" />
                    )}
                  </span>

                  {/* Step Info Text Details */}
                  <div className="space-y-1">
                    <h3 className={`font-black text-base transition-colors ${
                      isActive ? 'text-primary' : isCompleted ? 'text-foreground dark:text-emerald-950' : 'text-muted-foreground/50'
                    }`}>
                      {lang === 'en' ? step.labelEn : step.labelUr}
                    </h3>
                    <p className="text-xs text-muted-foreground dark:text-emerald-950/55 leading-relaxed max-w-lg">
                      {lang === 'en' ? step.descEn : step.descUr}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Customer Address Summary Info Box */}
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <div className="p-5 bg-white dark:bg-white/70 border border-border dark:border-emerald-900/10 rounded-2xl flex gap-3 text-left">
            <MapPin className="text-[#C5A059] shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">{lang === 'en' ? 'DELIVERY DESTINATION' : 'ڈیلیوری ایڈریس'}</span>
              <p className="text-xs text-foreground dark:text-neutral-700 font-semibold leading-relaxed">
                {order.customer?.name} ({order.customer?.phone})
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {order.customer?.address}, {order.customer?.city}
              </p>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-white/70 border border-border dark:border-emerald-900/10 rounded-2xl flex gap-3 text-left">
            <ShoppingBag className="text-primary shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">{lang === 'en' ? 'ITEM ORDER DETAILS' : 'آرڈر کی تفصیلات'}</span>
              <p className="text-xs text-foreground dark:text-neutral-700 font-bold leading-relaxed">
                {order.item?.productName}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                {order.item?.packSize} × {order.item?.quantity} • PKR {order.totalAmount?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
