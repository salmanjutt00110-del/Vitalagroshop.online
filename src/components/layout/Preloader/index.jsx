'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'

// Import assets for disk caching
import vitalAgroLogo from '@/assets/vital agro logo.webp'
import fatty from '@/assets/fatty.webp'
import super4g from '@/assets/super-4g.webp'
import aaqaab from '@/assets/Aaqaab.webp'
import vitalBgWebm from '@/assets/vital_bg.webm'

const STATUS_MESSAGES = {
  en: [
    "Preparing Premium Agricultural Experience...",
    "Loading Product Assets...",
    "Optimizing Product Images...",
    "Initializing Product Database...",
    "Loading Product Categories...",
    "Preparing Glass Interface...",
    "Optimizing Performance...",
    "Loading Hero Video...",
    "Connecting Smart WhatsApp...",
    "Finalizing Experience...",
    "Almost Ready..."
  ],
  ur: [
    "اعلیٰ زرعی تجربہ تیار کیا جا رہا ہے...",
    "مصنوعات کے اثاثے لوڈ ہو رہے ہیں...",
    "مصنوعات کی تصاویر کو بہتر بنایا جا رہا ہے...",
    "پروڈکٹ ڈیٹا بیس شروع کیا جا رہا ہے...",
    "مصنوعات کے زمرے لوڈ ہو رہے ہیں...",
    "گلاس انٹرفیس تیار کیا جا رہا ہے...",
    "کارکردگی کو بہتر بنایا جا رہا ہے...",
    "ہیرو ویڈیو لوڈ ہو رہی ہے...",
    "سمارٹ واٹس ایپ منسلک ہو رہا ہے...",
    "زرعی تجربہ حتمی مراحل میں ہے...",
    "بس تیار ہے..."
  ]
}

export default function Preloader({ onFinish }) {
  const { lang } = useLanguage()
  const [progress, setProgress] = useState(0)
  const [targetProgress, setTargetProgress] = useState(0)
  const [statusIdx, setStatusIdx] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  // Status messages rotation
  useEffect(() => {
    const list = STATUS_MESSAGES[lang] || STATUS_MESSAGES.en
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % list.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [lang])

  // Preloading routine
  useEffect(() => {
    let isMounted = true
    const startTime = Date.now()
    
    const preloadResources = async () => {
      if (isMounted) setTargetProgress(15)

      // Preload Fonts
      try {
        await document.fonts.ready
      } catch (e) {
        console.warn("Fonts loading bypassed", e)
      }
      if (isMounted) setTargetProgress(35)

      // Preload Images
      try {
        const imageAssets = [vitalAgroLogo, fatty, super4g, aaqaab]
        await Promise.all(
          imageAssets.map((src) => {
            return new Promise((resolve) => {
              const img = new Image()
              img.src = src
              img.onload = () => resolve(true)
              img.onerror = () => resolve(false)
            })
          })
        )
      } catch (e) {
        console.warn("Images preloading error", e)
      }
      if (isMounted) setTargetProgress(65)

      // Preload WebM Video
      try {
        const response = await fetch(vitalBgWebm)
        if (response.ok) {
          await response.blob()
        }
      } catch (e) {
        console.warn("Video preloading error", e)
      }
      if (isMounted) setTargetProgress(90)

      // Minimum visual time of 3.0s
      const elapsed = Date.now() - startTime
      const delay = Math.max(200, 3000 - elapsed)
      setTimeout(() => {
        if (isMounted) setTargetProgress(100)
      }, delay)
    }

    preloadResources()

    // Safety fallback
    const safetyTimeout = setTimeout(() => {
      if (isMounted) setTargetProgress(100)
    }, 5000)

    return () => {
      isMounted = false
      clearTimeout(safetyTimeout)
    }
  }, [])

  // Linear interpolation progress ticker
  useEffect(() => {
    let animId
    const tick = () => {
      setProgress((prev) => {
        if (prev < targetProgress) {
          const diff = targetProgress - prev
          const step = Math.max(0.4, diff * 0.08)
          const next = prev + step
          return next >= 100 ? 100 : next
        }
        return prev
      })
      animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [targetProgress])

  // Handle final reveal exit timing
  useEffect(() => {
    if (progress >= 100) {
      setIsExiting(true)
      const exitTimer = setTimeout(() => {
        if (onFinish) onFinish()
      }, 800)
      return () => clearTimeout(exitTimer)
    }
  }, [progress, onFinish])

  const messagesList = STATUS_MESSAGES[lang] || STATUS_MESSAGES.en
  const currentMsg = messagesList[statusIdx]

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={isExiting ? {
        opacity: 0,
        transition: { duration: 0.6, delay: 0.2, ease: 'easeIn' }
      } : {}}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0d2e0d 0%, #061406 60%, #030a03 100%)',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[300px] rounded-full opacity-20
          bg-[radial-gradient(ellipse,#2d6a2d,transparent)] blur-[80px]" />
      </div>

      {/* VITAL AGRO Logo */}
      <motion.div
        className="mb-12 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="p-5 rounded-[28px]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 0 60px rgba(92,184,92,0.12)',
          }}
        >
          <motion.img
            src={vitalAgroLogo} alt="Vital Agro"
            className="h-20 w-auto object-contain"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 0 20px rgba(92,184,92,0.3))' }}
          />
        </div>
        {/* Logo glow */}
        <motion.div
          className="absolute inset-0 rounded-[28px] -z-10"
          style={{ background: 'rgba(92,184,92,0.06)', filter: 'blur(20px)' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Company name */}
      <motion.p
        className="text-white/60 text-[11px] tracking-[0.25em] uppercase mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ fontVariantCaps: 'all-small-caps' }}
      >
        ✦ Vital Agro Chemical Industries ✦
      </motion.p>

      {/* TRUCK ANIMATION — Dark Green Theme */}
      <div className="loader relative z-10 mb-8">
        <div
          className="truckWrapper"
          style={{
            width: 200,
            height: 100,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'flex-end',
            overflow: 'hidden',
          }}
        >
          {/* TRUCK BODY SVG */}
          <div style={{
            width: 130,
            marginBottom: 6,
            animation: 'truckMotion 1.2s linear infinite',
          }}>
            <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Trailer */}
              <rect x="0" y="8" width="62" height="28" rx="3" fill="#1a4a1a" />
              <rect x="2" y="10" width="58" height="24" rx="2"
                fill="rgba(92,184,92,0.15)" stroke="rgba(92,184,92,0.4)" strokeWidth="0.5"/>
              {/* VITAL logo on trailer */}
              <text x="31" y="26" textAnchor="middle"
                fill="#5cb85c" fontSize="7" fontWeight="bold" fontFamily="Arial">
                VITAL
              </text>
              {/* Cab */}
              <rect x="62" y="14" width="34" height="22" rx="4" fill="#2d6a2d"/>
              {/* Windshield */}
              <rect x="66" y="16" width="20" height="14" rx="2"
                fill="rgba(92,184,92,0.25)" stroke="rgba(92,184,92,0.4)" strokeWidth="0.5"/>
              {/* Exhaust */}
              <rect x="91" y="10" width="3" height="8" rx="1.5" fill="#1a3a1a"/>
              {/* Exhaust smoke */}
              <circle cx="92.5" cy="8" r="2"
                fill="rgba(92,184,92,0.3)"
                style={{ animation: 'smokePuff 1.5s ease-out infinite' }}/>
              {/* Light */}
              <circle cx="95" cy="22" r="2.5" fill="#5cb85c"
                style={{ boxShadow: '0 0 4px #5cb85c' }}/>
            </svg>
          </div>

          {/* TIRES */}
          <div style={{
            width: 130,
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 10px 0 15px',
            position: 'absolute',
            bottom: 0,
          }}>
            {[0, 1].map(i => (
              <svg key={i} width="24" viewBox="0 0 24 24" style={{ animation: 'wheelSpin 0.8s linear infinite', transformOrigin: 'center' }}>
                <circle cx="12" cy="12" r="10"
                  fill="#0a2a0a" stroke="rgba(92,184,92,0.4)" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="5"
                  fill="#1a4a1a" stroke="rgba(92,184,92,0.3)" strokeWidth="1"/>
                <circle cx="12" cy="12" r="2" fill="#5cb85c"
                  style={{ filter: 'drop-shadow(0 0 3px rgba(92,184,92,0.8))' }}/>
                {/* Wheel spokes */}
                {[0,60,120,180,240,300].map(deg => (
                  <line key={deg}
                    x1="12" y1="7" x2="12" y2="12"
                    stroke="rgba(92,184,92,0.3)" strokeWidth="1"
                    style={{ transformOrigin: '12px 12px', transform: `rotate(${deg}deg)` }}
                  />
                ))}
              </svg>
            ))}
          </div>

          {/* ROAD */}
          <div style={{
            width: '100%',
            height: 2,
            background: 'rgba(92,184,92,0.15)',
            position: 'relative',
            borderRadius: 3,
          }}>
            {/* Moving road dashes */}
            <div style={{
              position: 'absolute',
              width: 20, height: '100%',
              background: 'rgba(92,184,92,0.15)',
              right: '-50%', borderRadius: 3,
              animation: 'roadAnimation 1.4s linear infinite',
              borderLeft: '10px solid rgba(92,184,92,0.4)',
            }}/>
            <div style={{
              position: 'absolute',
              width: 10, height: '100%',
              background: 'rgba(92,184,92,0.1)',
              right: '-65%', borderRadius: 3,
              animation: 'roadAnimation 1.4s linear infinite',
              borderLeft: '4px solid rgba(92,184,92,0.3)',
            }}/>
          </div>
        </div>
      </div>

      {/* Progress counter */}
      <motion.p
        className="text-4xl font-black mb-4 relative z-10 font-mono"
        style={{
          color: '#5cb85c',
          textShadow: '0 0 20px rgba(92,184,92,0.6)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.round(progress)}%
      </motion.p>

      {/* Progress bar */}
      <div className="relative z-10" style={{ width: 260 }}>
        <div style={{
          height: 3, borderRadius: 99,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, #2d6a2d, #5cb85c)',
              boxShadow: '0 0 10px rgba(92,184,92,0.5)',
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <p className="text-center text-white/30 text-[11px] mt-3 tracking-wide">
          {currentMsg}
        </p>
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes truckMotion {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(2.5px); }
          100% { transform: translateY(0px); }
        }
        @keyframes roadAnimation {
          0%   { transform: translateX(0px); }
          100% { transform: translateX(-350px); }
        }
        @keyframes smokePuff {
          0%   { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-12px) scale(2); opacity: 0; }
        }
        @keyframes wheelSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}
