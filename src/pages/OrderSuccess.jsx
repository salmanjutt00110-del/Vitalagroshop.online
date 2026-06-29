import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, doc, onSnapshot } from '@/lib/api';
import { motion } from 'framer-motion';
import { Check, Calendar, FileDown, ArrowRight, ShoppingBag, Truck, MessageCircle } from 'lucide-react';
import { downloadInvoice } from '@/lib/pdf/InvoiceGenerator';
import { useLanguage } from '@/lib/LanguageContext';
import SEOHead from '@/lib/seo/SEOHead';
import { buildOrderMessage } from '@/lib/whatsapp';

// Premium Steps Progress Indicator Component
const OrderProgressTracker = ({ order, lang }) => {
  const isCod = (order.paymentMethod || '').toLowerCase() === 'cod';
  
  // Determine active step index based on order status and type
  const getActiveIndex = () => {
    switch (order.status) {
      case 'pending_payment':
        return 0; // Awaiting payment
      case 'pending':
        return isCod ? 2 : 1; // COD bypasses verification, starts preparing at dispatch
      case 'payment_uploaded':
      case 'ai_reviewing':
      case 'payment_verified':
        return 2; // Verified, preparing dispatch
      case 'confirmed':
        return 2; // Preparing dispatch
      case 'dispatched':
        return 3; // In transit
      case 'delivered':
        return 4; // Complete
      default:
        return 1;
    }
  };

  const activeIndex = getActiveIndex();

  const steps = [
    {
      labelEn: 'Payment',
      labelUr: 'ادائیگی',
      descEn: isCod ? 'COD - Pay at Door' : 'Advance Received',
      descUr: isCod ? 'ڈیلیوری پر ادائیگی' : 'پیشگی ادائیگی موصول',
      status: activeIndex > 0 ? 'completed' : 'active'
    },
    {
      labelEn: 'Verification',
      labelUr: 'تصدیق',
      descEn: isCod ? 'Auto-Approved' : (activeIndex > 1 ? 'Receipt Verified' : 'Awaiting Review'),
      descUr: isCod ? 'فوری تصدیق' : (activeIndex > 1 ? 'تصدیق مکمل' : 'جائزہ جاری ہے'),
      status: isCod ? 'completed' : (activeIndex > 1 ? 'completed' : activeIndex === 1 ? 'active' : 'pending')
    },
    {
      labelEn: 'Dispatch',
      labelUr: 'روانگی',
      descEn: activeIndex > 2 ? 'Shipped / In Transit' : (activeIndex === 2 ? 'In Preparation' : 'Pending'),
      descUr: activeIndex > 2 ? 'روانہ کر دیا گیا' : (activeIndex === 2 ? 'تیاری جاری ہے' : 'پینڈنگ'),
      status: activeIndex > 2 ? 'completed' : activeIndex === 2 ? 'active' : 'pending'
    },
    {
      labelEn: 'Delivery',
      labelUr: 'وصولی',
      descEn: activeIndex > 3 ? 'Delivered Safely' : (activeIndex === 3 ? 'Out for Delivery' : 'Pending'),
      descUr: activeIndex > 3 ? 'پہنچ گیا ہے' : (activeIndex === 3 ? 'ڈیلیوری جاری ہے' : 'پینڈنگ'),
      status: activeIndex > 3 ? 'completed' : activeIndex === 3 ? 'active' : 'pending'
    }
  ];

  return (
    <div className="bg-white dark:bg-white/70 border border-border dark:border-emerald-900/10 rounded-3xl p-6 text-left shadow-sm mt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] filter blur-xl rounded-full" />
      <h3 className="text-xs font-black text-muted-foreground dark:text-neutral-500 uppercase tracking-wider mb-6">
        {lang === 'en' ? '📦 Order Processing Progress' : '📦 آرڈر پروسیسنگ کی صورتحال'}
      </h3>

      {/* Progress Connector Track */}
      <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-4 md:items-center">
        {/* Horizontal Connector Line for Desktop */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-[#F4F7F5] dark:bg-white/60 hidden md:block z-0">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${(Math.min(activeIndex, 3) / 3) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          
          return (
            <div key={idx} className="flex md:flex-col items-center md:items-center gap-4 md:gap-2.5 flex-1 relative z-10">
              {/* Step indicator node */}
              <motion.div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border font-mono text-sm font-bold shrink-0 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : isActive
                      ? 'bg-white dark:bg-[#071910] border-emerald-400 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse'
                      : 'bg-white dark:bg-[#071910] border-border dark:border-emerald-900/5 text-muted-foreground/30 dark:text-emerald-950/20'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {isCompleted ? (
                  <Check size={16} className="stroke-[3.5]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </motion.div>

              {/* Step Text Details */}
              <div className="text-left md:text-center space-y-0.5">
                <h4 className={`text-xs font-black tracking-wide ${
                  isCompleted 
                    ? 'text-foreground dark:text-emerald-950' 
                    : isActive 
                      ? 'text-emerald-500 font-extrabold' 
                      : 'text-muted-foreground/40 dark:text-neutral-400'
                }`}>
                  {lang === 'en' ? step.labelEn : step.labelUr}
                </h4>
                <p className="text-[10px] text-muted-foreground dark:text-neutral-500 leading-snug font-sans">
                  {lang === 'en' ? step.descEn : step.descUr}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function OrderSuccess() {
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
          <div className="w-10 h-10 rounded-full border-4 border-[#76C945] border-t-transparent animate-spin" />
          <p className="text-xs text-neutral-500 tracking-wider">Finalizing Order Success State...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#071910] text-emerald-950 px-4">
        <div className="max-w-md w-full text-center space-y-5 p-8 rounded-3xl border border-emerald-900/10 bg-white/60 backdrop-blur-xl">
          <h2 className="text-2xl font-black">Information currently unavailable.</h2>
          <p className="text-sm text-neutral-500 leading-relaxed font-semibold">
            {lang === 'en'
              ? 'We were unable to locate this order registry. It may still be syncing to Firestore database nodes.'
              : 'آرڈر کی تفصیلات فی الحال دستیاب نہیں ہیں۔ ہو سکتا ہے یہ آرڈر ابھی ڈیٹا بیس کے ساتھ ہم آہنگ ہو رہا ہو۔'}
          </p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-[#76C945] hover:bg-[#8AD65A] text-[#0A2E1F] rounded-full text-sm font-black transition-colors">
            <ShoppingBag size={16} />
            <span>{lang === 'en' ? 'Explore Catalog' : 'پروڈکٹس دیکھیں'}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Get dynamic dates
  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
  const deliveryMin = new Date(orderDate);
  deliveryMin.setDate(deliveryMin.getDate() + 2);
  const deliveryMax = new Date(orderDate);
  deliveryMax.setDate(deliveryMax.getDate() + 4);

  const formatEstDate = (d) => {
    return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'ur-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#F4F7F5] dark:bg-[#071910] text-foreground dark:text-emerald-950 transition-colors duration-300">
      <SEOHead
        title="Order Successful | Vital Agro"
        description="Thank you for shopping with Vital Agro Chemical Industries. Your agriculture order has been confirmed successfully."
      />

      <div className="max-w-2xl mx-auto px-4 text-center">
        
        {/* Animated Check Circle Banner */}
        <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
          <motion.div 
            className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-[#5cb85c]/10 border-2 border-dashed border-[#5cb85c]/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div 
            className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#2d6a2d] to-[#5cb85c] flex items-center justify-center shadow-lg shadow-[#5cb85c]/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 15 }}
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Check size={40} className="text-emerald-950 stroke-[3.5]" />
            </motion.div>
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-black tracking-tight"
        >
          {lang === 'en' ? 'Thank You for Your Order!' : 'آرڈر کرنے کا شکریہ!'}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground dark:text-neutral-500 max-w-md mx-auto mt-2 leading-relaxed font-sans"
        >
          {lang === 'en' 
            ? `Your order registry #${order.orderNumber} has been dispatched to our warehousing logisticians.` 
            : `آپ کا آرڈر نمبر #${order.orderNumber} ہمارے گودام کو بھیج دیا گیا ہے۔`}
        </motion.p>

        {/* Premium horizontal 4-step progress tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <OrderProgressTracker order={order} lang={lang} />
        </motion.div>

        {/* Order Info Card Details Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-white/70 border border-border dark:border-emerald-900/10 rounded-3xl p-6 shadow-sm mt-6 text-left"
        >
          <div className="flex justify-between items-center border-b border-border dark:border-emerald-900/5 pb-4">
            <div>
              <span className="text-[10px] text-muted-foreground dark:text-neutral-500 block font-bold uppercase">{lang === 'en' ? 'ORDER NUMBER' : 'آرڈر نمبر'}</span>
              <span className="font-mono text-base font-black text-primary dark:text-emerald-600">{order.orderNumber}</span>
            </div>
            <button
              onClick={() => downloadInvoice(order)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#5cb85c]/10 dark:bg-[#5cb85c]/15 border border-[#5cb85c]/20 hover:bg-[#5cb85c]/25 text-[#2d6a2d] dark:text-emerald-600 rounded-xl text-xs font-black transition-colors"
            >
              <FileDown size={14} />
              <span>{lang === 'en' ? 'Download Receipt' : 'رسید ڈاؤن لوڈ کریں'}</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-4">
            <div className="flex gap-3">
              <Calendar className="text-primary mt-0.5" size={18} />
              <div>
                <span className="text-[9px] text-muted-foreground dark:text-neutral-500 block font-bold uppercase">{lang === 'en' ? 'ESTIMATED DELIVERY' : 'توقعہ تاریخ وصولی'}</span>
                <span className="text-xs text-foreground dark:text-neutral-700 font-bold block mt-0.5">
                  {formatEstDate(deliveryMin)} – {formatEstDate(deliveryMax)}
                </span>
                <span className="text-[10px] text-muted-foreground dark:text-neutral-400 block mt-0.5 leading-snug font-sans">
                  Deliveries are managed within 2-4 business days.
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Truck className="text-primary mt-0.5" size={18} />
              <div>
                <span className="text-[9px] text-muted-foreground dark:text-neutral-500 block font-bold uppercase">{lang === 'en' ? 'SHIPPING ADDRESS' : 'ڈیلیوری ایڈریس'}</span>
                <span className="text-xs text-foreground dark:text-neutral-700 font-bold block mt-0.5">
                  {order.customer?.name || order.customerName} ({order.customer?.phone || order.customerPhone})
                </span>
                <span className="text-[10px] text-muted-foreground dark:text-neutral-400 block mt-0.5 leading-snug font-sans">
                  {order.customer?.address || order.customerAddress}, {order.customer?.city || order.customerCity}, {order.customer?.province || order.customerProvince}
                </span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border dark:border-emerald-900/5 text-xs mt-4">
            <div>
              <span className="text-[9px] text-muted-foreground dark:text-neutral-500 block font-bold uppercase">{lang === 'en' ? 'PAYMENT METHOD' : 'طریقہ ادائیگی'}</span>
              <span className="font-extrabold text-foreground dark:text-emerald-950/85 mt-1 block">
                {order.paymentMethod === 'cod' || order.paymentMethod === 'COD' || (order.paymentMethod || '').toLowerCase() === 'cod'
                  ? 'Cash On Delivery (COD)' 
                  : (order.paymentMethod || '').toUpperCase() + ' Advance Payment'}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-muted-foreground dark:text-neutral-500 block font-bold uppercase">{lang === 'en' ? 'TRANSACTION STATUS' : 'ٹرانزیکشن سٹیٹس'}</span>
              <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                order.paymentMethod === 'cod' || order.paymentMethod === 'COD' || (order.paymentMethod || '').toLowerCase() === 'cod'
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              }`}>
                {order.paymentMethod === 'cod' || order.paymentMethod === 'COD' || (order.paymentMethod || '').toLowerCase() === 'cod'
                  ? (lang === 'en' ? 'Order Received' : 'آرڈر موصول ہو گیا')
                  : (lang === 'en' ? 'Awaiting Verification' : 'تصدیق کا انتظار')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Controls */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
        >
          <a
            href={buildOrderMessage(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#25D366] hover:bg-[#20ba5a] hover:shadow-[#25D366]/20 text-emerald-950 rounded-full font-black text-sm transition-colors shadow-lg cursor-pointer"
          >
            <MessageCircle size={16} />
            <span>{lang === 'en' ? 'Confirm on WhatsApp' : 'واٹس ایپ پر آرڈر کنفرم کریں'}</span>
          </a>

          <Link
            to={`/track/${order.id}`}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#76C945] hover:bg-[#8AD65A] text-[#0A2E1F] rounded-full font-black text-sm transition-colors shadow-lg shadow-[#76C945]/15"
          >
            <span>{lang === 'en' ? 'Track Your Order' : 'آرڈر ٹریک کریں'}</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            to="/products"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-white/60 border border-border dark:border-emerald-900/10 hover:bg-muted dark:hover:bg-white/80 text-foreground dark:text-emerald-950 rounded-full font-bold text-sm transition-colors"
          >
            <ShoppingBag size={16} />
            <span>{lang === 'en' ? 'Continue Shopping' : 'خریداری جاری رکھیں'}</span>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
