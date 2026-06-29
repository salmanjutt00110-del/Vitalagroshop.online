'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const OrderConfirmButton = ({ onConfirm, disabled }) => {
  const [stage, setStage] = useState('idle');

  const run = async () => {
    if (stage !== 'idle' || disabled) return;
    setStage('packing');
    await sleep(950);
    setStage('shipping');
    try { 
      await onConfirm(); 
    } catch (err) {
      console.error(err);
    }
    await sleep(1300);
    setStage('placed');
  };

  return (
    <div className="relative w-full h-14">
      <AnimatePresence mode="wait">

        {/* IDLE — Normal green button */}
        {stage === 'idle' && (
          <motion.button key="idle"
            onClick={run} disabled={disabled}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            whileTap={{ scale: 0.97 }}
            className="absolute inset-0 rounded-full font-bold text-sm
              text-white overflow-hidden cursor-pointer
              disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg,#1a5c1a,#2d7a2d,#1a5c1a)',
              boxShadow: '0 0 30px rgba(92,184,92,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
              border: '1px solid rgba(92,184,92,0.4)',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r
                from-transparent via-white/12 to-transparent -skew-x-12"
              animate={{ x: ['-200%', '250%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.8 }}
            />
            <span className="relative flex items-center justify-center gap-2">
              <span>COMPLETE ORDER</span>
            </span>
          </motion.button>
        )}

        {/* PACKING — Bag enters capsule */}
        {stage === 'packing' && (
          <motion.div key="packing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: 'rgba(8,22,8,0.95)',
              border: '1px solid rgba(92,184,92,0.25)',
            }}
          >
            {/* Progress fill */}
            <motion.div className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: 'rgba(45,106,45,0.3)' }}
              initial={{ width: '0%' }}
              animate={{ width: '50%' }}
              transition={{ duration: 0.85 }}
            />
            {/* Dashes */}
            <div className="absolute inset-x-0 bottom-4 flex gap-2 px-6">
              {[...Array(7)].map((_, i) => (
                <motion.div key={i}
                  className="flex-1 h-[2px] rounded-full bg-[rgba(92,184,92,0.25)]"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.07 }}
                />
              ))}
            </div>
            {/* Bag icon */}
            <motion.span
              className="absolute top-1/2 -translate-y-1/2 text-2xl"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 22, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.16,1,0.3,1] }}
            >
              🛍
            </motion.span>
            {/* Label */}
            <motion.span
              className="absolute right-5 top-1/2 -translate-y-1/2
                text-white/40 text-xs font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Packing...
            </motion.span>
          </motion.div>
        )}

        {/* SHIPPING — Truck drives through neon */}
        {stage === 'shipping' && (
          <motion.div key="shipping"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: 'rgba(5,18,5,0.98)',
              border: '2px solid rgba(92,184,92,0.55)',
              boxShadow: [
                '0 0 20px rgba(92,184,92,0.4)',
                '0 0 60px rgba(92,184,92,0.15)',
                'inset 0 0 20px rgba(92,184,92,0.05)',
              ].join(','),
            }}
          >
            {/* Animated neon border trace */}
            <motion.div
              className="absolute inset-[-2px] rounded-full pointer-events-none"
              style={{
                background: 'conic-gradient(rgba(92,184,92,0.8) 0deg, transparent 90deg, transparent 360deg)',
                filter: 'blur(4px)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
            {/* Road dashes */}
            <div className="absolute bottom-3.5 inset-x-6 flex gap-2">
              {[...Array(8)].map((_, i) => (
                <motion.div key={i}
                  className="flex-1 h-[2px] rounded-full bg-[rgba(92,184,92,0.2)]"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                />
              ))}
            </div>
            {/* Truck (emoji + speed lines) */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 flex items-center"
              initial={{ x: '110%' }}
              animate={{ x: '8%' }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Speed lines */}
              <div className="flex flex-col gap-1 mr-2">
                {[14, 10, 7].map((w, i) => (
                  <motion.div key={i}
                    style={{ width: w, height: 2, borderRadius: 9,
                      background: 'rgba(92,184,92,0.45)',
                      marginLeft: i * 3 }}
                    animate={{ opacity: [0.7, 0.2, 0.7], scaleX: [1, 0.5, 1] }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
              <span className="text-[28px]">🚛</span>
            </motion.div>
            {/* Label */}
            <motion.span
              className="absolute right-5 top-1/2 -translate-y-1/2
                text-[#5cb85c] text-[11px] font-bold tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              On the way!
            </motion.span>
          </motion.div>
        )}

        {/* PLACED — Neon ORDER PLACED */}
        {stage === 'placed' && (
          <motion.div key="placed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="absolute inset-0"
          >
            {/* Particle burst */}
            {[...Array(14)].map((_, i) => {
              const angle = (i / 14) * 360
              const dist = 55 + Math.random() * 25;
              return (
                <motion.div key={i}
                  className="absolute top-1/2 left-1/2 rounded-full"
                  style={{ width: 4+Math.random()*3, height: 4+Math.random()*3,
                    background: '#5cb85c',
                    boxShadow: '0 0 6px #5cb85c' }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((angle*Math.PI)/180)*dist,
                    y: Math.sin((angle*Math.PI)/180)*dist,
                    opacity: 0, scale: 0,
                  }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              );
            })}

            {/* Success button */}
            <div className="absolute inset-0 rounded-full overflow-hidden
              flex items-center justify-center"
              style={{
                background: 'rgba(5,18,5,0.98)',
                border: '2px solid #5cb85c',
                boxShadow: [
                  '0 0 25px rgba(92,184,92,0.7)',
                  '0 0 70px rgba(92,184,92,0.3)',
                  '0 0 120px rgba(92,184,92,0.12)',
                  'inset 0 0 25px rgba(92,184,92,0.06)',
                ].join(','),
              }}
            >
              <motion.span
                className="font-bold tracking-[0.18em] text-sm"
                style={{
                  color: '#5cb85c',
                  textShadow: '0 0 20px rgba(92,184,92,0.9)',
                }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                ✓ ORDER PLACED
              </motion.span>
            </div>

            {/* Ambient glow */}
            <motion.div
              className="absolute inset-0 -z-10 rounded-full blur-2xl"
              style={{ background: 'rgba(92,184,92,0.18)' }}
              animate={{ scale: [1,1.4,1], opacity: [0.7,0.3,0.7] }}
              transition={{ duration: 1.6, repeat: 3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderConfirmButton;
