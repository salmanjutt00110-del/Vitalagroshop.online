import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import ThreeTruck from './ThreeTruck';

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const OrderConfirmButton = ({ onConfirm, onValidate, onComplete, disabled }) => {
  const [state, setState] = useState('idle'); // 'idle' | 'compress' | 'capsule' | 'shipping' | 'placed'
  const [progress, setProgress] = useState(0);

  const handleClick = async (e) => {
    if (e) e.preventDefault();
    if (state !== 'idle' || disabled) return;

    // 1. Run form validation first
    if (onValidate && !onValidate()) {
      return;
    }

    // STEP 1: Compress on click
    setState('compress');
    await sleep(250);

    // STEP 2: Transform to capsule loader
    setState('capsule');
    await sleep(400);

    // STEP 3: Start loading progress & enter the 3D truck
    setState('shipping');
    setProgress(0);

    // Trigger the backend API Firestore saving + WhatsApp payload assembly asynchronously
    const orderPromise = onConfirm();

    // Smoothly animate progress from 0 to 100% over 2.6 seconds
    const duration = 2600;
    const intervalTime = 40;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(currentProgress);
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    await sleep(duration);

    // Make sure database write completed
    let orderId = null;
    try {
      orderId = await orderPromise;
    } catch (err) {
      console.error("Order submission error:", err);
    }

    // STEP 7: Exit truck and morph to Success State
    setState('placed');
    
    // Trigger minimal premium green confetti burst
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#5cb85c', '#8AD65A', '#2d6a2d']
    });

    await sleep(2200);

    // Reset and complete checkout navigation
    if (onComplete) {
      onComplete(orderId);
    }
    setState('idle');
    setProgress(0);
  };

  return (
    <div className="relative flex items-center justify-center w-full select-none">
      <AnimatePresence mode="wait">

        {/* STATE 1: IDLE BUTTON */}
        {state === 'idle' && (
          <motion.button
            key="idle"
            onClick={handleClick}
            disabled={disabled}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.96 }}
            className="relative w-full h-[58px] rounded-full overflow-hidden
              font-extrabold text-base text-white uppercase tracking-wider
              bg-gradient-to-r from-[#2d6a2d] via-[#3d8c3d] to-[#2d6a2d]
              border border-[rgba(92,184,92,0.4)]
              disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center justify-center"
            style={{
              boxShadow: '0 0 35px rgba(92,184,92,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r
                from-transparent via-white/15 to-transparent
                -skew-x-12"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1 }}
            />
            <span className="relative flex items-center justify-center gap-2">
              Complete Order
            </span>
          </motion.button>
        )}

        {/* STATE 2: COMPRESS (short click squeeze) */}
        {state === 'compress' && (
          <motion.div
            key="compress"
            initial={{ scale: 1 }}
            animate={{ scale: 0.93, opacity: 0.8 }}
            exit={{ scale: 0.9 }}
            className="w-full h-[58px] rounded-full bg-[#1b441b] border border-[#5cb85c]/60"
            style={{
              boxShadow: '0 0 50px rgba(92,184,92,0.5)',
            }}
          />
        )}

        {/* STATE 3: CAPSULE MORPH & PROGRESS RUN */}
        {(state === 'capsule' || state === 'shipping') && (
          <motion.div
            key="shipping-container"
            initial={{ width: '100%', height: '58px', borderRadius: '999px' }}
            animate={{ 
              width: '100%', 
              height: '80px', 
              borderRadius: '24px',
              borderColor: 'rgba(92, 184, 92, 0.4)'
            }}
            exit={{ opacity: 0 }}
            className="relative overflow-hidden border bg-[#061208]/95 backdrop-blur-xl flex flex-col justify-end pb-2.5"
            style={{
              boxShadow: '0 0 30px rgba(92,184,92,0.2), inset 0 0 15px rgba(255,255,255,0.05)',
            }}
          >
            {/* Golden line starts filling */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300"
                style={{ 
                  width: `${progress}%`,
                  boxShadow: '0 0 10px #fbbf24'
                }}
              />
            </div>

            {/* Road lines animating */}
            <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-between px-6 pointer-events-none opacity-40">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-[1.5px] w-4 bg-[#5cb85c] rounded-full shrink-0"
                  animate={{ x: [0, -30] }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: Infinity, 
                    ease: 'linear'
                  }}
                />
              ))}
            </div>

            {/* Mount 3D React Three Fiber Truck */}
            {state === 'shipping' && (
              <motion.div
                className="absolute inset-0 z-10 w-full h-[68px] top-1 pointer-events-none"
                initial={{ x: '100%' }}
                animate={{ 
                  x: progress < 15 
                    ? '25%' 
                    : progress < 85 
                      ? '5%' 
                      : '-120%' 
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 85, 
                  damping: 15 
                }}
              >
                <ThreeTruck progress={progress} />
              </motion.div>
            )}

            {/* Micro road streaks */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-gradient-to-r from-transparent via-white/10 to-transparent rounded"
                  style={{
                    height: '1px',
                    width: '60px',
                    top: `${20 + i * 20}%`,
                    left: '100%'
                  }}
                  animate={{ left: ['100%', '-50%'] }}
                  transition={{
                    duration: 0.6 + i * 0.1,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>

            {/* Preparing / Dispatching Labels */}
            <div className="w-full text-center z-20">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8AD65A] drop-shadow">
                {progress < 40 
                  ? 'Assembling Order...' 
                  : progress < 85 
                    ? 'Order In Transit...' 
                    : 'Finalizing Delivery...'}
              </span>
            </div>
          </motion.div>
        )}

        {/* STATE 4: ORDER PLACED (neon glow success state) */}
        {state === 'placed' && (
          <motion.div
            key="placed"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative w-full"
          >
            {/* Ambient halo glow */}
            <div 
              className="absolute inset-0 rounded-full blur-2xl opacity-60"
              style={{ background: 'rgba(92,184,92,0.35)' }}
            />

            {/* Glowing Success Pill */}
            <div
              className="relative w-full h-[58px] rounded-full
                flex items-center justify-center
                border-2 overflow-hidden"
              style={{
                background: 'rgba(8, 22, 8, 0.95)',
                borderColor: '#5cb85c',
                boxShadow: `
                  0 0 40px rgba(92,184,92,0.85),
                  0 0 80px rgba(92,184,92,0.4),
                  inset 0 0 20px rgba(92,184,92,0.15)
                `,
              }}
            >
              {/* Conic neon border scan trace */}
              <motion.div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden">
                <motion.div
                  className="absolute inset-[-15%] rounded-full"
                  style={{
                    background: 'conic-gradient(#5cb85c 0deg, transparent 90deg, transparent 360deg)',
                    filter: 'blur(3px)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>

              {/* Success label */}
              <motion.span
                className="relative z-10 font-black tracking-[0.2em] text-sm text-[#8AD65A]"
                style={{
                  textShadow: '0 0 15px rgba(92,184,92,0.85)',
                }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
              >
                ✓ ORDER PLACED
              </motion.span>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default OrderConfirmButton;
