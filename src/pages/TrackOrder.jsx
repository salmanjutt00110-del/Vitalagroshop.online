import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ArrowLeft, Search, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import { db, isFirebaseEnabled } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function TrackOrder() {
  const [searchCode, setSearchCode] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = searchCode.trim();
    if (!trimmed) {
      setError('Please enter an order registry code.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      if (!isFirebaseEnabled) {
        // Query Flask Backend
        try {
          const res = await apiClient.get(`/orders/track/${trimmed}`);
          if (res.data) {
            setOrder(res.data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Backend query failed, trying local storage:', err);
        }

        // Fallback to Local Storage
        const local = JSON.parse(localStorage.getItem('vital_sb_orders') || '[]');
        const found = local.find(o => o.orderNumber === trimmed);
        if (found) {
          // Normalize dates for local orders
          const normalized = {
            ...found,
            createdAt: found.createdAt,
            customer: found.customer || {
              name: found.customerName,
              phone: found.customerPhone,
              city: found.city,
              address: found.address
            },
            item: found.item || {
              productName: found.productName,
              packSize: found.packSize,
              quantity: found.quantity
            }
          };
          setOrder(normalized);
        } else {
          setError('❌ Order Registry Code not found. Please verify the code (e.g. VA-2026-0001) and try again.');
        }
      } else {
        // Query Firestore Directly
        const q = query(collection(db, 'orders'), where('orderNumber', '==', trimmed));
        const snap = await getDocs(q);
        if (snap.empty) {
          setError('❌ Order Registry Code not found. Please verify the code (e.g. VA-2026-0001) and try again.');
        } else {
          const docSnap = snap.docs[0];
          setOrder({ id: docSnap.id, ...docSnap.data() });
        }
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while tracking the order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLocalDateString = (createdAt) => {
    if (!createdAt) return 'Just now';
    const dateObj = typeof createdAt.toDate === 'function' 
      ? createdAt.toDate() 
      : (createdAt.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt));
    return new Date(dateObj).toLocaleString();
  };

  const getTimelineSteps = (status, paymentMethod) => {
    const isAdvance = paymentMethod && (
      paymentMethod.toLowerCase().includes('advance') ||
      paymentMethod.toLowerCase() === 'cod'
    );

    if (status === 'cancelled') {
      return [
        { label: 'Order Placed 📦', status: 'completed', desc: 'Order was successfully recorded in our registry.' },
        { label: 'Order Cancelled ❌', status: 'active_alert', desc: 'This order was cancelled by administrator review.' }
      ];
    }

    switch (status) {
      case 'pending':
        return [
          { label: 'Order Placed 📦', status: 'completed', desc: 'Your order was successfully recorded.' },
          { label: 'Verification Pending ⏳', status: 'active_pulse', desc: 'Our administrative audit is verifying your order and payment details.' },
          { label: 'Order Confirmed ✅', status: 'upcoming', desc: 'Waiting for verification completion.' },
          { label: 'Ready for Dispatch 🚚', status: 'upcoming', desc: 'Waiting for confirmation.' }
        ];
      case 'confirmed':
        return [
          { label: 'Order Placed 📦', status: 'completed', desc: 'Your order was successfully recorded.' },
          { label: isAdvance ? 'Payment Verified 💎' : 'Verification Complete ✅', status: 'completed', desc: 'Administrative audit has verified your order successfully.' },
          { label: 'Order Confirmed & Approved ✅', status: 'completed', desc: 'Order details verified.' },
          { label: 'Ready for Dispatch 🚚', status: 'active_pulse', desc: 'Logistics crew is packaging your agricultural cargo for shipping.' }
        ];
      case 'dispatched':
        return [
          { label: 'Order Placed & Confirmed ✅', status: 'completed', desc: 'Order successfully verified.' },
          { label: 'Cargo Dispatched 🚚', status: 'completed', desc: 'Package has left the warehouse.' },
          { label: 'In Transit / On the Way 📦', status: 'active_pulse', desc: 'Your package is on the way via courier logistics.' },
          { label: 'Out for Delivery 🗺️', status: 'upcoming', desc: 'Arriving soon at your local hub.' }
        ];
      case 'delivered':
        return [
          { label: 'Order Placed & Confirmed ✅', status: 'completed', desc: 'Order successfully verified.' },
          { label: 'Cargo Dispatched & Shipped 🚚', status: 'completed', desc: 'Package left the warehouse.' },
          { label: 'Out for Delivery 🗺️', status: 'completed', desc: 'Arrived at the destination local hub.' },
          { label: 'Order Delivered Successfully 🎉', status: 'completed_glowing', desc: 'The agricultural shipment has arrived at your destination address.' }
        ];
      default:
        return [
          { label: 'Order Placed 📦', status: 'completed', desc: 'Your order was successfully recorded.' },
          { label: 'Verification Pending ⏳', status: 'active_pulse', desc: 'Awaiting admin processing.' }
        ];
    }
  };

  const customerName = order?.customerName || order?.customer?.name || 'N/A';
  const city = order?.city || order?.customer?.city || '';
  const address = order?.address || order?.customer?.address || '';
  const productName = order?.productName || order?.item?.productName || 'N/A';
  const packSize = order?.packSize || order?.item?.packSize || 'N/A';
  const quantity = order?.quantity || order?.item?.quantity || 1;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50 text-emerald-950 relative select-none overflow-hidden flex flex-col items-center justify-start px-4">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[150px] bg-[#76C945]/10" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full blur-[150px] bg-[#8AD65A]/5" />
      </div>

      <div className="w-full max-w-xl z-10">
        {/* Back Link */}
        <Link 
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Input Search Container */}
      <div className="w-full max-w-xl backdrop-blur-xl bg-neutral-955/60 border border-emerald-900/10 shadow-[0_0_30px_rgba(16,185,129,0.1)] text-emerald-950 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden z-10 bg-slate-50/80">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#76C945]/5 filter blur-2xl rounded-full pointer-events-none" />
        
        {/* Heading */}
        <div className="text-center">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">
            Registry Operations
          </span>
          <h2 className="text-2xl font-black tracking-tight text-emerald-950 uppercase">
            Live Order Tracking
          </h2>
          <p className="text-neutral-500 text-xs mt-1">
            Enter your unique registry code to audit shipment status
          </p>
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-neutral-500 text-[10px] font-black tracking-wider uppercase text-left">
              Registry Code
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="E.g., VA-2026-0001"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                className="w-full px-5 py-4 rounded-2xl text-emerald-950 text-sm bg-white/60 border border-emerald-900/10 outline-none placeholder:text-emerald-950/20 font-mono tracking-widest focus:border-[#76C945] focus:bg-white/80 transition-all duration-300"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2d6a2d] to-[#3d8c3d] text-emerald-950 font-extrabold text-sm hover:shadow-[0_0_20px_rgba(92,184,92,0.3)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-950" />
                <span>Auditing Registry...</span>
              </>
            ) : (
              <>
                <Search size={14} />
                <span>Track Status</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Alert Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl flex gap-2.5 items-start p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs mt-6 font-bold text-left z-10"
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracked Details & Timeline Results */}
      <AnimatePresence>
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl backdrop-blur-xl bg-slate-50/80 border border-emerald-900/10 shadow-[0_0_30px_rgba(16,185,129,0.1)] text-emerald-950 rounded-3xl p-6 sm:p-8 mt-6 space-y-6 relative overflow-hidden z-10"
          >
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-emerald-900/5 pb-4">
              <div className="text-left">
                <span className="text-[10px] text-neutral-500 uppercase font-black tracking-wider block">Registry ID</span>
                <span className="text-emerald-600 font-mono font-black text-lg block tracking-wide">{order.orderNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 text-[10px] uppercase font-black tracking-wider block">Placed At</span>
                <span className="text-emerald-950 font-mono text-xs block mt-0.5">{getLocalDateString(order.createdAt)}</span>
              </div>
            </div>

            {/* Timeline steps */}
            <div className="relative border-l-2 border-emerald-900/10 ml-4 pl-8 space-y-8 py-2 text-left">
              {getTimelineSteps(order.status, order.paymentMethod).map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isCompletedGlowing = step.status === 'completed_glowing';
                const isActivePulse = step.status === 'active_pulse';
                const isAlert = step.status === 'active_alert';

                return (
                  <div key={idx} className="relative">
                    {/* Circle dot icon */}
                    <span className={`absolute -left-[43px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-[#76C945] border-[#76C945] text-[#0A2E1F] shadow-[0_0_10px_rgba(118,201,69,0.3)] font-black text-xs' 
                        : isCompletedGlowing
                          ? 'bg-emerald-500 border-emerald-500 text-emerald-950 shadow-[0_0_15px_#10b981]'
                          : isActivePulse
                            ? 'bg-amber-500 border-amber-500 text-emerald-950 shadow-[0_0_15px_#f59e0b]'
                            : isAlert
                              ? 'bg-red-500 border-red-500 text-emerald-950 shadow-[0_0_15px_#ef4444]'
                              : 'bg-slate-50 border-emerald-900/10 text-emerald-950/20'
                    }`}>
                      {isCompleted ? (
                        <span>✓</span>
                      ) : isCompletedGlowing ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                      ) : isActivePulse ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                      ) : isAlert ? (
                        <span className="text-[10px] font-black">!</span>
                      ) : (
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                      )}
                    </span>

                    {/* Step Title & Details */}
                    <div className="space-y-1">
                      <h4 className={`font-black text-sm transition-colors ${
                        isCompleted || isCompletedGlowing ? 'text-emerald-950' : isActivePulse ? 'text-amber-400' : isAlert ? 'text-red-400' : 'text-neutral-400'
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-neutral-500 text-[11px] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom info grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-emerald-900/5 pt-4 text-left text-xs">
              <div className="space-y-1 bg-white/60 border border-emerald-900/5 p-3.5 rounded-xl">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Receiver</span>
                <p className="font-bold text-neutral-700">{customerName}</p>
                <p className="text-[10px] text-neutral-500 leading-relaxed truncate">{address}, {city}</p>
              </div>
              <div className="space-y-1 bg-white/60 border border-emerald-900/5 p-3.5 rounded-xl">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Item Details</span>
                <p className="font-bold text-neutral-700 truncate">{productName}</p>
                <p className="text-[10px] text-neutral-500 font-mono">{packSize} • Qty {quantity}</p>
              </div>
            </div>

            {/* WhatsApp Tracking Inquiry Action */}
            <div className="pt-3 border-t border-emerald-900/5">
              <a
                href={`https://wa.me/923011837160?text=${encodeURIComponent(
                  `Assalam-o-Alaikum Vital Agro Support Team,\nI would like to inquire about my order tracking status.\nOrder Number: ${order.orderNumber || 'Pending'}\nCurrent Status: ${(order.status || 'Pending').toUpperCase()}\nReceiver: ${customerName}\nProduct: ${productName}\n\nPlease share delivery details. Thank you!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] hover:shadow-[0_0_15px_rgba(37,211,102,0.3)] text-emerald-950 font-extrabold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle size={14} />
                <span>Inquire Status on WhatsApp</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
