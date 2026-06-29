'use client'
import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export const PageLoader = () => {
  const canvasRef = useRef(null)
  const isSessionLoaded = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      return (
        sessionStorage.getItem('vitalAgro_loaded') === 'true' ||
        sessionStorage.getItem('vital_agro_loaded') === 'true' ||
        sessionStorage.getItem('vital_platform_loaded') === 'true' ||
        sessionStorage.getItem('vital_global_hydrated') === 'true'
      );
    } catch (e) {
      console.warn("sessionStorage read failed in PageLoader:", e);
      return false;
    }
  }, []);

  useEffect(() => {
    if (isSessionLoaded) return // Completely bypass heavy DNA canvas loop if already loaded

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 80; canvas.height = 120

    let t = 0
    let raf
    const NODES = 12

    const draw = () => {
      ctx.clearRect(0, 0, 80, 120)
      t += 0.06

      for (let i = 0; i < NODES; i++) {
        const y     = (i / NODES) * 100 + 10
        const phase = (i / NODES) * Math.PI * 2 + t

        // Strand A
        const xA = 40 + Math.cos(phase) * 22
        // Strand B
        const xB = 40 + Math.cos(phase + Math.PI) * 22

        const depthA = (Math.cos(phase) + 1) / 2
        const depthB = (Math.cos(phase + Math.PI) + 1) / 2

        const sA = 2.5 + depthA * 2
        const sB = 2.5 + depthB * 2
        const aA = 0.2 + depthA * 0.8
        const aB = 0.2 + depthB * 0.8

        // Cross bridge
        if (i % 2 === 0) {
          const ba = Math.min(aA, aB) * 0.3
          ctx.beginPath()
          ctx.moveTo(xA, y)
          ctx.lineTo(xB, y)
          ctx.strokeStyle = `rgba(92,184,92,${ba})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }

        // Strand dots A
        if (depthA > 0.3) {
          const ga = ctx.createRadialGradient(xA, y, 0, xA, y, sA * 2.5)
          ga.addColorStop(0, `rgba(92,184,92,${aA * 0.4})`)
          ga.addColorStop(1, 'rgba(92,184,92,0)')
          ctx.beginPath(); ctx.arc(xA, y, sA * 2.5, 0, Math.PI*2)
          ctx.fillStyle = ga; ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(xA, y, Math.max(0.5, sA * 0.7), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(92,184,92,${aA})`
        ctx.fill()

        // Strand dots B
        if (depthB > 0.3) {
          const gb = ctx.createRadialGradient(xB, y, 0, xB, y, sB * 2.5)
          gb.addColorStop(0, `rgba(92,184,92,${aB * 0.4})`)
          gb.addColorStop(1, 'rgba(92,184,92,0)')
          ctx.beginPath(); ctx.arc(xB, y, sB * 2.5, 0, Math.PI*2)
          ctx.fillStyle = gb; ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(xB, y, Math.max(0.5, sB * 0.7), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(92,184,92,${aB})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [isSessionLoaded])

  if (isSessionLoaded) {
    // Sleek, minimalist page fade transition placeholder for instant route transitions (<0.1s)
    // Entirely transparent/lightweight, unmounts automatically when chunk completes loading
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[900] bg-slate-50/20 backdrop-blur-[2px] pointer-events-none"
      />
    )
  }

  return (
    <div
      className="fixed inset-0 z-[900] flex flex-col items-center justify-center"
      style={{ background: 'rgba(4,13,4,0.97)', backdropFilter: 'blur(12px)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div style={{
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(45,106,45,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      {/* DNA canvas */}
      <motion.canvas
        ref={canvasRef}
        style={{ width: 80, height: 120 }}
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Brand text */}
      <motion.p
        className="mt-4 text-neutral-400 text-[10px] tracking-[0.4em] uppercase"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Vital Agro
      </motion.p>
    </div>
  )
}
