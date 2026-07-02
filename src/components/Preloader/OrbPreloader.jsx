'use client'
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'


const MESSAGES = [
  '...Initializing Systems',
  '...Loading Product Catalog',
  '...Calibrating Agricultural Data',
  '...Preparing Premium Experience',
  '...Almost Ready',
]

export const OrbPreloader = ({ onComplete }) => {
  const [pct,    setPct]    = useState(0)
  const [msgIdx, setMsgIdx] = useState(0)
  const [done,   setDone]   = useState(false)
  const [startupStep, setStartupStep] = useState(0)
  const canvasRef = useRef(null)
  const animRef   = useRef()

  useEffect(() => {
    const t1 = setTimeout(() => setStartupStep(1), 150);
    const t2 = setTimeout(() => setStartupStep(2), 350);
    const t3 = setTimeout(() => setStartupStep(3), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // ── CANVAS: 3D PARTICLE SPHERE ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 280  // logical canvas size (scaled by CSS)
    const H = 280
    canvas.width  = W
    canvas.height = H

    const NUM_DOTS = window.innerWidth < 640 ? 90 : 180
    const RADIUS   = 90   // sphere radius

    // Golden angle spiral placement (even distribution on sphere)
    const dots = Array.from({ length: NUM_DOTS }, (_, i) => {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / NUM_DOTS)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      return {
        phi,
        theta,
        baseSize: 0.8 + Math.random() * 1.6,
        phase:    Math.random() * Math.PI * 2,
      }
    })

    let angle  = 0
    let angleY = 0.3
    let time   = 0

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      time  += 0.012
      angle += 0.008
      angleY = 0.3 + Math.sin(time * 0.3) * 0.2

      // Sort dots by depth (z) for painter's algorithm
      const projected = dots.map(d => {
        // Rotate around Y axis
        const x0 = Math.sin(d.phi) * Math.cos(d.theta + angle)
        const y0 = Math.cos(d.phi)
        const z0 = Math.sin(d.phi) * Math.sin(d.theta + angle)

        // Rotate around X axis (tilt)
        const x = x0
        const y = y0 * Math.cos(angleY) - z0 * Math.sin(angleY)
        const z = y0 * Math.sin(angleY) + z0 * Math.cos(angleY)

        // Project to 2D
        const perspective = 320
        const scale  = perspective / (perspective + z * RADIUS)
        const px     = W / 2 + x * RADIUS * scale
        const py     = H / 2 - y * RADIUS * scale
        const depth  = (z + 1) / 2   // 0=back, 1=front
        const pSize  = d.baseSize * scale
        const alpha  = 0.15 + depth * 0.7 + Math.sin(time + d.phase) * 0.1

        return { px, py, depth, pSize, alpha, z }
      }).sort((a, b) => a.depth - b.depth)

      // Draw connections (only close pairs near the front)
      ctx.lineWidth = 0.4
      for (let i = 0; i < projected.length; i += 3) {
        for (let j = i + 1; j < Math.min(i + 8, projected.length); j++) {
          const a = projected[i]
          const b = projected[j]
          const dx = a.px - b.px
          const dy = a.py - b.py
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 40 && a.depth > 0.4 && b.depth > 0.4) {
            const lineAlpha = (1 - dist / 40) * Math.min(a.depth, b.depth) * 0.25
            ctx.beginPath()
            ctx.moveTo(a.px, a.py)
            ctx.lineTo(b.px, b.py)
            ctx.strokeStyle = `rgba(92,184,92,${lineAlpha})`
            ctx.stroke()
          }
        }
      }

      // Draw dots
      projected.forEach(({ px, py, depth, pSize, alpha }) => {
        // Glow for front dots
        if (depth > 0.75) {
          const glow = ctx.createRadialGradient(px, py, 0, px, py, pSize * 4)
          glow.addColorStop(0, `rgba(92,184,92,${alpha * 0.5})`)
          glow.addColorStop(1, 'rgba(92,184,92,0)')
          ctx.beginPath()
          ctx.arc(px, py, pSize * 4, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(px, py, Math.max(0.4, pSize), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(92,184,92,${Math.min(1, alpha)})`
        ctx.fill()
      })

      // Center core glow
      const core = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 30)
      core.addColorStop(0, `rgba(92,184,92,${0.08 + Math.sin(time) * 0.04})`)
      core.addColorStop(1, 'rgba(92,184,92,0)')
      ctx.beginPath()
      ctx.arc(W/2, H/2, 30, 0, Math.PI * 2)
      ctx.fillStyle = core
      ctx.fill()

      animRef.current = requestAnimationFrame(draw)
    }
    draw()

  }, [startupStep])

  // ── PROGRESS ──
  useEffect(() => {
    if (startupStep < 3) return;

    const startTime = Date.now();
    const DURATION = 500; // Smooth 0.5 second loading progress
    let animId;
    let completed = false;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / DURATION) * 100);
      setPct(progress);

      if (progress >= 100 && !completed) {
        completed = true;
        try {
          sessionStorage.setItem('vitalAgro_loaded', 'true');
          sessionStorage.setItem('vital_agro_loaded', 'true');
          sessionStorage.setItem('vital_platform_loaded', 'true');
          sessionStorage.setItem('vital_global_hydrated', 'true');
        } catch (e) {
          console.warn("sessionStorage setItem failed in OrbPreloader:", e);
        }
        
        // Wait 100ms at 100% full bar, then trigger exit fadeout, then trigger navigation callback
        setTimeout(() => {
          setDone(true);
          setTimeout(onComplete, 350); // 350ms duration for exit transition
        }, 100);
      } else {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);

    const mi = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length);
    }, 200); // Rotate message text every 200ms during fast loading

    return () => {
      if (animId) cancelAnimationFrame(animId);
      clearInterval(mi);
    };
  }, [startupStep, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 110% 100% at 50% 55%,
            #0e2d0e 0%, #061406 48%, #020c02 100%)
        `,
      }}
      animate={done ? { opacity: 0, scale: 1.04 } : { opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >


      {/* Scan line */}
      <motion.div
        className="absolute inset-x-0 h-px z-1 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(92,184,92,0.35), transparent)',
        }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 55%, transparent 40%, rgba(2,10,2,0.82) 100%)',
        }}
      />

      {/* ── STAGE 1: LOGO ── */}
      {startupStep >= 0 && (
        <motion.div
          className="relative z-10 mb-4"
          initial={{ opacity: 0, scale: 0.82, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="p-4 rounded-[22px] bg-white/60 border border-emerald-900/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-md"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src="/logo.webp" alt="Vital Agro"
              className="h-12 md:h-14 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(92,184,92,0.25)]"
            />
          </motion.div>
        </motion.div>
      )}

      {/* ── STAGE 2: WELCOME TITLE ── */}
      {startupStep >= 1 && (
        <motion.div
          className="flex flex-col items-center text-center z-10 mb-4 px-4"
          initial={{ opacity: 0, y: 12, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-emerald-950 font-extrabold tracking-widest text-lg md:text-xl font-heading uppercase">
            Welcome to <span className="text-emerald-400">Vital Agro</span>
          </h2>
          <p className="text-neutral-500 text-[9px] md:text-[10px] tracking-[0.25em] uppercase font-mono mt-2">
            ♦ VITAL AGRO CHEMICAL INDUSTRIES ♦
          </p>
        </motion.div>
      )}

      {/* ── STAGE 3: DETAILS ── */}
      {startupStep >= 2 && (
        <motion.div
          className="flex flex-col items-center text-center z-10 mb-6 px-6 max-w-sm"
          initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-neutral-600 text-[10px] tracking-wider font-medium uppercase leading-relaxed max-w-xs">
            Empowering progressive farmers with premium imported biotech formulations.
          </p>
        </motion.div>
      )}

      {/* ── STAGE 4: LOADING SYSTEM ── */}
      {startupStep >= 3 && (
        <motion.div
          className="flex flex-col items-center z-10"
          initial={{ opacity: 0, scale: 0.94, filter: 'blur(3px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* 3D PARTICLE ORB */}
          <div className="relative mb-5 flex items-center justify-center">
            {/* Outer ambient glow */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 200, height: 200,
                background: 'radial-gradient(ellipse, rgba(45,106,45,0.12) 0%, transparent 65%)',
                filter: 'blur(30px)',
              }}
            />

            {/* Rotating rings around the orb */}
            {[1,2].map(i => (
              <motion.div key={i}
                className="absolute rounded-full border pointer-events-none"
                style={{
                  width: 160 + i * 30, height: 160 + i * 30,
                  borderColor: `rgba(92,184,92,${0.08 - i * 0.02})`,
                  borderStyle: 'dashed',
                  borderWidth: '1px',
                }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 12 + i * 6, repeat: Infinity, ease: 'linear' }}
              />
            ))}

            {/* Canvas orb */}
            <canvas
              ref={canvasRef}
              className="relative z-10"
              style={{ width: 180, height: 180 }}
            />

            {/* Orb label */}
            <div className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none">
              <motion.span
                className="text-[#0E7A43] text-[8px] tracking-[0.3em] uppercase font-bold"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                Agricultural Intelligence
              </motion.span>
            </div>
          </div>

          {/* PROGRESS INDICATOR */}
          <div className="flex flex-col items-center gap-2 w-full px-8" style={{ width: 260 }}>
            {/* Big % */}
            <motion.span
              className="font-black animate-pulse"
              style={{
                fontSize: '3rem',
                lineHeight: 1,
                color: '#0E7A43',
                textShadow: '0 0 25px rgba(92,184,92,0.6)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {Math.round(pct)}%
            </motion.span>

            {/* Bar */}
            <div
              className="w-full rounded-full overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              style={{ height: 3, background: 'rgba(255,255,255,0.07)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #1a5c1a 0%, #0E7A43 50%, #7de87d 100%)',
                  boxShadow: '0 0 12px rgba(92,184,92,0.7)',
                }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            {/* Cycling message */}
            <div className="min-h-[20px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIdx}
                  className="text-neutral-400 text-[11px] tracking-widest text-center"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {MESSAGES[msgIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
