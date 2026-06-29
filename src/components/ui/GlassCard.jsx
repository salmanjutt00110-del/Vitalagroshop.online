import React, { useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  tilt = true,
  maxTilt = 8, // max degrees to rotate
  glow = true,
  lift = true,
  blur = '20px',
  borderOpacity = 0.12,
  ...props
}) {
  const cardRef = useRef(null);

  // Springs for smooth responsive movement
  const x = useSpring(0, { stiffness: 150, damping: 20 });
  const y = useSpring(0, { stiffness: 150, damping: 20 });

  // Map normalized coordinates [-0.5, 0.5] to rotation degrees
  const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !tilt) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const normX = (mouseX / rect.width) - 0.5;
    const normY = (mouseY / rect.height) - 0.5;

    x.set(normX);
    y.set(normY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const borderStyle = {
    borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
    backdropFilter: `blur(${blur}) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blur}) saturate(180%)`,
  };

  return (
    <div style={{ perspective: '1000px' }} className="w-full">
      <motion.div
        ref={cardRef}
        className={`relative bg-white/5 border rounded-[26px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 ${
          lift ? 'hover:-translate-y-2' : ''
        } ${glow ? 'hover:border-[#76C945]/30' : ''} ${className}`}
        style={{
          ...borderStyle,
          rotateX: tilt ? rotateX : 0,
          rotateY: tilt ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  );
}
