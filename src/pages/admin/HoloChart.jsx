import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { Activity, Terminal } from 'lucide-react';

export default function HoloChart({ stats }) {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [pulse, setPulse] = useState(true);
  const [liveNumbers, setLiveNumbers] = useState({ cpu: 42, ram: 58 });

  // Auto rotate the tech radar dials
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => (r + 0.6) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Pulse effect simulation for telemetry logs
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => !p);
      // Simulate live CPU/RAM fluctuating load
      setLiveNumbers({
        cpu: Math.floor(35 + Math.random() * 20 + (stats.pending * 3)),
        ram: Math.floor(50 + Math.random() * 12)
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [stats.pending]);

  // 3D Parallax Tilt coordinates tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 140, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);

  // Dynamic light reflection shine overlay
  const glowX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const total = stats.total || 1;
  const statusBars = [
    { label: 'Pending Approval', count: stats.pending, color: '#f59e0b' },
    { label: 'Confirmed Orders', count: stats.confirmed, color: '#60a5fa' },
    { label: 'Delivered', count: stats.delivered, color: '#8ad65a' },
  ];

  return (
    <div style={{ perspective: 1200 }} className="w-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative p-6 rounded-3xl border border-white/10 backdrop-blur-2xl bg-neutral-950/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-white overflow-hidden space-y-6 group cursor-pointer"
      >
        {/* Holographic scanning laser line */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-3xl">
          <div 
            className="w-full h-[1.5px] bg-[#10b981]/40 shadow-[0_0_12px_#10b981]" 
            style={{
              animation: 'scanline 5s linear infinite',
            }}
          />
        </div>

        {/* Dynamic shining light overlay */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(circle 180px at ${glowX} ${glowY}, rgba(16, 185, 129, 0.1), transparent 70%)`
          }}
        />

        {/* Tech Grid Backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

        {/* Header Widget Info */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#10b981]/15 rounded-xl border border-[#10b981]/30">
              <Activity className="w-4 h-4 text-[#8ad65a] animate-pulse" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-xs tracking-widest font-mono text-white uppercase">System Telemetry</h3>
              <p className="text-[8px] text-white/40 tracking-widest font-mono uppercase mt-0.5">Real-time DB Monitor</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[9px] font-black text-emerald-400 font-mono tracking-widest uppercase">
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${pulse ? 'scale-110 shadow-[0_0_8px_#10b981]' : 'scale-90'} transition-transform duration-500`} />
            SECURE
          </span>
        </div>

        {/* Center Section: Rotating Tech Radar Dial */}
        <div className="relative h-48 flex items-center justify-center" style={{ transform: 'translateZ(40px)' }}>
          
          {/* Radar Sweep sweep */}
          <div 
            className="absolute w-40 h-40 rounded-full border border-dashed border-[#10b981]/20 flex items-center justify-center"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="absolute top-0 w-2 h-2 bg-[#8ad65a] rounded-full shadow-[0_0_10px_#8ad65a]" />
            <div className="absolute inset-2 border border-dotted border-blue-500/10 rounded-full" />
          </div>
          
          {/* Middle DNA Genetic Dial */}
          <div 
            className="absolute w-32 h-32 rounded-full border border-double border-emerald-500/15 flex items-center justify-center text-[5px] text-white/10 tracking-widest uppercase select-none font-mono"
            style={{ transform: `rotate(${-rotation * 1.3}deg)` }}
          >
            LAT: 31.52 - LNG: 74.35 // ARID SOIL CHECK
          </div>

          {/* Concentric rings */}
          <div className="absolute w-20 h-20 rounded-full border border-white/[0.03]" />
          <div className="absolute w-12 h-12 rounded-full border border-white/[0.05]" />

          {/* Central Telemetry Stats */}
          <div className="z-10 text-center space-y-1">
            <span className="text-[9px] text-white/35 font-mono uppercase tracking-wider block">Server Load</span>
            <span className="text-3xl font-black font-mono text-white block tracking-tighter">
              {liveNumbers.cpu}%
            </span>
            <span className="text-[8px] text-[#8ad65a] font-mono tracking-widest uppercase block animate-pulse">
              SYNC ACTIVE
            </span>
          </div>
        </div>

        {/* Stats Metrics Progress Bars */}
        <div className="space-y-4" style={{ transform: 'translateZ(30px)' }}>
          <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest block text-left">
            Order Distribution Ratio
          </span>
          <div className="space-y-3.5">
            {statusBars.map((bar) => {
              const percentage = Math.round((bar.count / total) * 100) || 0;
              return (
                <div key={bar.label} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-white/60 font-bold">{bar.label}</span>
                    <span style={{ color: bar.color }} className="font-extrabold">{bar.count} ({percentage}%)</span>
                  </div>
                  {/* Progress track */}
                  <div className="h-2 rounded-full bg-white/5 border border-white/5 overflow-hidden p-[1px]">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: bar.color, boxShadow: `0 0 10px ${bar.color}` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ type: 'spring', stiffness: 90, damping: 15, delay: 0.15 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live system logs */}
        <div 
          className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 font-mono text-[9px] text-left text-white/45 space-y-2 relative"
          style={{ transform: 'translateZ(20px)' }}
        >
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/30 uppercase font-black flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              LOG TELEMETRY
            </span>
            <span className="text-[#8ad65a] animate-pulse">NODE_01_OK</span>
          </div>
          <div className="space-y-1">
            <p className="truncate text-emerald-400/80">✓ FETCH: orders snapshot loaded successfully</p>
            <p className="truncate text-white/40">✓ SOCKET: database active ({stats.total} registries synced)</p>
            <p className="truncate text-blue-400/80">✓ TELEMETRY: CPU {liveNumbers.cpu}% | RAM {liveNumbers.ram}%</p>
            <p className="truncate text-white/30">✓ SSL: 256-bit secure session verified</p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
