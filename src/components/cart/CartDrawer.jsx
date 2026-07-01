import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard, Lock, MessageCircle, Truck } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const formatPrice = (val) => {
    if (val === 0) return lang === 'en' ? 'On Request' : 'قیمت طلب کریں';
    return `Rs. ${Math.round(val).toLocaleString()}`;
  };

  if (!isCartOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[999] overflow-hidden font-body select-none">
          {/* Dark blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsCartOpen(false);
            }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md"
            >
              {/* Frosted Glass Drawer Container */}
              <div className="h-full flex flex-col bg-[#050f07]/95 backdrop-blur-3xl border-l border-emerald-900/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-emerald-950 relative">
                
                {/* Aurora background glow */}
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#0E7A43]/10 blur-[100px] pointer-events-none z-0" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#C5A059]/5 blur-[100px] pointer-events-none z-0" />

                {/* Header */}
                <div className="px-6 py-5 border-b border-emerald-900/10 flex items-center justify-between z-10 relative">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-lg font-black uppercase tracking-wider">
                      {lang === 'en' ? 'Your Shopping Cart' : 'آپ کی شاپنگ کارٹ'}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                    }}
                    className="p-1.5 rounded-lg bg-white/60 border border-emerald-900/10 hover:bg-white/80 text-neutral-700 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-4 z-10 relative scrollbar-hide">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 gap-4">
                      <div className="w-20 h-20 rounded-full bg-white/60 border border-emerald-900/10 flex items-center justify-center text-neutral-400">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-neutral-800">
                          {lang === 'en' ? 'Your cart is empty' : 'آپ کی کارٹ خالی ہے'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1 max-w-xs font-medium leading-relaxed">
                          {lang === 'en'
                            ? 'Browse our premium agricultural products and add items to your cart.'
                            : 'ہماری بہترین زرعی مصنوعات دیکھیں اور انہیں کارٹ میں شامل کریں۔'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                        }}
                        className="mt-4 btn-premium-primary text-xs tracking-wider font-extrabold"
                      >
                        {lang === 'en' ? 'Shop Our Products' : 'مصنوعات خریدیں'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <motion.div
                          key={item.cartId}
                          layout
                          className="flex gap-4 p-4 rounded-2xl bg-white/60 border border-emerald-900/10 hover:border-emerald-900/20 transition-all flex-row items-center justify-between"
                        >
                          <div className="w-16 h-16 rounded-xl bg-white/60 p-2 flex items-center justify-center border border-emerald-900/5">
                            <img
                              src={item.pngUrl || item.imageUrl}
                              alt={item.name[lang] || item.name}
                              className="max-h-full max-w-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-sm text-emerald-950 truncate">
                              {item.name[lang] || item.name}
                            </h3>
                            <p className="text-[10px] text-emerald-700 font-black uppercase mt-0.5 tracking-wider">
                              {item.size.size}
                            </p>
                            
                            {/* Quantity adjustments */}
                            <div className="flex items-center gap-2.5 mt-2">
                              <button
                                onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                className="w-6 h-6 rounded-md bg-white/80 hover:bg-white/20 flex items-center justify-center font-bold text-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-black w-6 text-center font-mono">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                className="w-6 h-6 rounded-md bg-white/80 hover:bg-white/20 flex items-center justify-center font-bold text-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end justify-between h-full py-1">
                            <span className="text-sm font-black text-emerald-950 font-mono">
                              {formatPrice(Number(item.size.price || item.size.rate || 0) * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.cartId)}
                              className="text-neutral-500 hover:text-red-400 p-1.5 mt-3 rounded-lg hover:bg-white/60 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                      {/* Trust Badges */}
                      <div className="trust-badges mt-8 pt-6 border-t border-emerald-900/10 space-y-3">
                        <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3 border border-emerald-900/5 select-none">
                          <Lock className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-semibold text-neutral-600">
                            {lang === 'en' ? 'Secure Checkout Encryption' : 'محفوظ چیک آؤٹ انکرپشن'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3 border border-emerald-900/5 select-none">
                          <MessageCircle className="w-4 h-4 text-green-400" />
                          <span className="text-xs font-semibold text-neutral-600">
                            {lang === 'en' ? '24/7 WhatsApp Support' : '24/7 واٹس ایپ سپورٹ'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3 border border-emerald-900/5 select-none">
                          <Truck className="w-4 h-4 text-[#C5A059]" />
                          <span className="text-xs font-semibold text-neutral-600">
                            {lang === 'en' ? 'Fast Delivery Across Pakistan' : 'پورے پاکستان میں تیز ڈیلیوری'}
                          </span>
                        </div>
                      </div>

                      {/* Continue Shopping button */}
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-6 text-sm text-neutral-500 hover:text-neutral-700 underline w-full text-center block cursor-pointer transition-colors"
                      >
                        {lang === 'en' ? '← Continue Shopping' : '← خریداری جاری رکھیں'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Summary */}
                {cart.length > 0 && (
                  <div className="px-6 py-6 border-t border-emerald-900/10 bg-white/70 backdrop-blur-md z-10 relative">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-neutral-500 font-bold uppercase">Subtotal</span>
                      <span className="text-lg font-black text-emerald-700 font-mono">
                        {formatPrice(cartSubtotal)}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mb-5 leading-normal">
                      {lang === 'en'
                        ? 'Shipping and taxes are calculated at checkout. WhatsApp support available 24/7.'
                        : 'ڈیلیوری چارجز کی تفصیلات اور کارٹ کے نرخ فائنل چیک آؤٹ پر کنفرم کیے جائیں گے۔'}
                    </p>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate('/checkout');
                        }}
                        className="flex-1 btn-premium-primary text-xs tracking-wider flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>{lang === 'en' ? 'Proceed to Checkout' : 'چیک آؤٹ کریں'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        </div>
      </AnimatePresence>
    </>
  );
}
