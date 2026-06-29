const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const NEW_LOGO = "https://media.db.com/images/public/6a27b32ce4fd7a7b0f5a130c/dd29aaf14_db7454da-0043-4419-8e66-4441ca915357_removalai_preview.png";

export default function AnimatedLogo({ isDark }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-30, 30], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-60, 60], [-20, 20]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 400, transformStyle: 'preserve-3d', display: 'inline-block' }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', display: 'inline-block' }}
      >
        {/* Glow layer */}
        <motion.div
          className="absolute inset-0 rounded-xl blur-xl"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse, rgba(118,201,69,0.35) 0%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(118,201,69,0.2) 0%, transparent 70%)',
            transform: 'translateZ(-8px) scale(1.3)',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Shadow layer */}
        <motion.div
          className="absolute inset-0"
          style={{
            transform: 'translateZ(-4px) translateY(4px)',
            filter: 'blur(6px)',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 8,
          }}
        />

        <motion.img
          src={NEW_LOGO}
          alt="Vital Group"
          className="relative h-10 w-auto object-contain"
          style={{
            transform: 'translateZ(8px)',
            filter: isDark
              ? 'brightness(10) saturate(0)'
              : 'brightness(1) drop-shadow(0 2px 8px rgba(118,201,69,0.3))',
            transition: 'filter 0.5s ease',
          }}
          animate={{ rotateZ: [0, 0.5, -0.5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}