'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { doctor, headline } from '@/lib/content'
import PhoneIcon from '@/components/ui/PhoneIcon'
import { useDeviceInfo } from '@/lib/hooks/useDeviceInfo'

// Clip durations in seconds (from ffprobe)
const CLIP_DURATIONS = [6.041667, 4.041667, 6.041667, 6.041667, 6.041667, 6.041667, 4.041667, 6.041667, 5.041667]
const CLIP_COUNT = CLIP_DURATIONS.length
const TOTAL_DURATION = CLIP_DURATIONS.reduce((a, b) => a + b, 0)

// Cumulative start fraction for each clip [0..1]
const CLIP_START_FRACTIONS = CLIP_DURATIONS.reduce<number[]>((acc, _, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + CLIP_DURATIONS[i - 1] / TOTAL_DURATION)
  return acc
}, [])

function getClipAndTime(globalProgress: number): { clipIndex: number; localTime: number } {
  const p = Math.max(0, Math.min(1, globalProgress))
  for (let i = CLIP_COUNT - 1; i >= 0; i--) {
    if (p >= CLIP_START_FRACTIONS[i]) {
      const fraction = (p - CLIP_START_FRACTIONS[i]) / (CLIP_DURATIONS[i] / TOTAL_DURATION)
      const localTime = Math.min(fraction * CLIP_DURATIONS[i], CLIP_DURATIONS[i] - 0.02)
      return { clipIndex: i, localTime }
    }
  }
  return { clipIndex: 0, localTime: 0 }
}

function initCanvasSize(canvas: HTMLCanvasElement | null) {
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas.offsetWidth
  const h = canvas.offsetHeight
  if (w === 0 || h === 0) return
  canvas.width = w * dpr
  canvas.height = h * dpr
  const c2d = canvas.getContext('2d', { alpha: false })
  if (c2d) c2d.setTransform(dpr, 0, 0, dpr, 0, 0)
}

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const device = useDeviceInfo()

  useEffect(() => {
    let cancelled = false
    let gsapCtx: { revert: () => void } | null = null
    let rafId: number | null = null

    window.scrollTo(0, 0)
    document.documentElement.style.scrollBehavior = 'auto'

    const canvas = canvasRef.current
    if (!canvas) return
    const c2d = canvas.getContext('2d', { alpha: false })
    if (!c2d) return

    // ── Sync canvas size immediately (before any async work) ─────────────────
    // Canvas offsetWidth/Height are available synchronously on first paint.
    // We must set this before the GSAP async import so the canvas isn't stuck
    // at the browser default of 300×150.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const syncCanvasSize = () => {
      if (!canvas || cancelled) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (w === 0 || h === 0) return
      canvas.width = w * dpr
      canvas.height = h * dpr
      // setTransform resets accumulated scale — critical to call this not scale()
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    syncCanvasSize()

    // Create all video elements off-DOM
    const videos: HTMLVideoElement[] = Array.from({ length: CLIP_COUNT }, (_, i) => {
      const v = document.createElement('video')
      v.src = `/hero-sequence/${i + 1}.mp4`
      v.muted = true
      v.playsInline = true
      v.preload = 'auto'
      return v
    })

    // ── ResizeObserver — keep canvas sharp on window resize ──────────────────
    const resizeObs = new ResizeObserver(() => {
      syncCanvasSize()
      drawFrame(true) // force redraw after resize
    })
    resizeObs.observe(canvas)

    // ── Frame drawing ─────────────────────────────────────────────────────────
    let currentClipIndex = 0
    let lastDrawnKey = ''

    const drawFrame = (force = false) => {
      if (!canvas || !c2d || cancelled) return
      const v = videos[currentClipIndex]
      if (!v || v.readyState < 2) return

      const key = `${currentClipIndex}:${v.currentTime.toFixed(3)}`
      if (!force && key === lastDrawnKey) return
      lastDrawnKey = key

      // Logical (CSS) dimensions — context is already pre-scaled by setTransform
      const cw = canvas.offsetWidth
      const ch = canvas.offsetHeight
      if (cw === 0 || ch === 0) return

      const vw = v.videoWidth || 1916
      const vh = v.videoHeight || 1080

      // object-fit: cover
      const scale = Math.max(cw / vw, ch / vh)
      const dw = vw * scale
      const dh = vh * scale
      const dx = (cw - dw) / 2
      const dyBase = (ch - dh) / 2

      // On portrait mobile, shift frame up slightly (matches old objectPosition: center 15%)
      const isMobilePortrait = cw < 768 && ch > cw
      const dy = isMobilePortrait ? Math.min(dyBase, dyBase + (dh - ch) * 0.3) : dyBase

      c2d.drawImage(v, dx, dy, dw, dh)
    }

    // ── Per-clip seek queue ───────────────────────────────────────────────────
    const seeking = new Array(CLIP_COUNT).fill(false)
    const pendingTime = new Array<number | null>(CLIP_COUNT).fill(null)

    const applySeek = (clipIdx: number, t: number) => {
      const v = videos[clipIdx]
      if (!v) return
      const clamped = Math.max(0, Math.min(t, CLIP_DURATIONS[clipIdx] - 0.04))
      if (seeking[clipIdx]) { pendingTime[clipIdx] = clamped; return }
      if (Math.abs(v.currentTime - clamped) < 0.016) return
      seeking[clipIdx] = true
      try { v.currentTime = clamped } catch (_) { seeking[clipIdx] = false }
    }

    videos.forEach((v, i) => {
      v.addEventListener('seeked', () => {
        seeking[i] = false
        if (pendingTime[i] !== null && !cancelled) {
          const t = pendingTime[i]!
          pendingTime[i] = null
          applySeek(i, t)
        }
        // Draw as soon as a seek completes
        if (i === currentClipIndex) drawFrame(true)
      })
    })

    // ── RAF loop ──────────────────────────────────────────────────────────────
    let targetClipIndex = 0
    let targetLocalTime = 0

    const tick = () => {
      if (cancelled) return
      currentClipIndex = targetClipIndex
      applySeek(targetClipIndex, targetLocalTime)
      drawFrame()
      rafId = requestAnimationFrame(tick)
    }

    // ── GSAP + loading ────────────────────────────────────────────────────────
    const initGSAP = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (cancelled) return

      // Kick all videos loading immediately
      videos.forEach((v) => {
        v.load()
        // play/pause trick forces browser to buffer even without user gesture
        v.play().then(() => { v.pause(); v.currentTime = 0 }).catch(() => {})
      })

      // Wait for first clip to be drawable (readyState >= 2 = HAVE_CURRENT_DATA)
      await new Promise<void>((resolve) => {
        const v = videos[0]
        if (v.readyState >= 2) { resolve(); return }
        const onReady = () => { resolve() }
        v.addEventListener('loadeddata', onReady, { once: true })
        v.addEventListener('canplay', onReady, { once: true })
        setTimeout(resolve, 5000) // never block forever
      })
      if (cancelled) return

      // Start RAF + draw first frame immediately
      syncCanvasSize()
      drawFrame(true)
      rafId = requestAnimationFrame(tick)

      const isMobile = window.innerWidth < 768

      gsapCtx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: '#hero',
          start: 'top top',
          end: '+=200%',
          scrub: isMobile ? 0.4 : 0.15,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          preventOverlaps: true,
          onUpdate: (self) => {
            const { clipIndex, localTime } = getClipAndTime(self.progress)
            targetClipIndex = clipIndex
            targetLocalTime = localTime
          },
        })

        gsap.fromTo(ctaRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.5 }
        )
        gsap.to(ctaRef.current, {
          opacity: 0, y: -24,
          scrollTrigger: { trigger: '#hero', start: '12% top', end: '40% top', scrub: 0.3 },
        })
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          scrollTrigger: { trigger: '#hero', start: '4% top', end: '18% top', scrub: 0.2 },
        })
      })
    }

    initGSAP()

    return () => {
      cancelled = true
      if (rafId !== null) cancelAnimationFrame(rafId)
      gsapCtx?.revert()
      resizeObs.disconnect()
      videos.forEach((v) => { v.src = '' })
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  const ctaBottom = device.isIOS
    ? 'calc(6rem + env(safe-area-inset-bottom, 20px))'
    : '5rem'

  const scrollIndicatorBottom = device.isIOS
    ? 'calc(1.5rem + env(safe-area-inset-bottom, 20px))'
    : '1.5rem'

  return (
    <section id="hero" className="relative">
      <div className="hero-inner relative w-full" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>

        {/* Poster — sits below canvas, visible until first frame draws */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-sequence/hero-poster.jpg)', zIndex: 0 }}
          aria-hidden="true"
        />

        {/* Canvas — pixel-perfect frame rendering at device DPR */}
        <canvas
          ref={(el) => { (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el; initCanvasSize(el) }}
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: 1,
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        />

        {/* Edge vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(13,27,42,0.55) 100%)', zIndex: 2 }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0F2132, rgba(15,33,50,0.7), transparent)', zIndex: 2 }} />

        {/* CTA overlay */}
        <div
          ref={ctaRef}
          className="absolute left-4 sm:left-8 lg:left-16 opacity-0 flex flex-col items-start gap-4 max-w-[calc(100vw-2rem)] sm:max-w-none"
          style={{ willChange: 'opacity, transform', bottom: ctaBottom, zIndex: 10 }}
        >
          <div>
            <p className="text-silver/50 text-xs tracking-widest uppercase font-sans mb-1">
              {doctor.titleEn}
            </p>
            <p className="text-clinical text-xl sm:text-2xl font-semibold font-persian">{doctor.name}</p>
            <p className="text-silver/60 text-sm font-persian">{headline.sub}</p>
          </div>
          <a
            href={`tel:${doctor.phonePlain}`}
            className="group flex items-center gap-3 bg-cyan hover:bg-cyan-dark active:bg-cyan-dark text-navy font-bold px-5 sm:px-7 py-3.5 sm:py-4 rounded-full text-sm sm:text-base transition-colors duration-200 active:scale-95 shadow-xl shadow-cyan/30 touch-manipulation"
          >
            <PhoneIcon size={18} className="group-hover:rotate-12 transition-transform flex-shrink-0" />
            <span className="font-persian">رزرو نوبت</span>
            <span dir="ltr" className="text-navy/70 text-xs sm:text-sm font-sans font-normal hidden sm:inline">{doctor.phone}</span>
          </a>
        </div>

        {/* ECG line — desktop only */}
        <div className="absolute bottom-16 inset-x-0 pointer-events-none overflow-hidden h-10 hidden sm:block" style={{ zIndex: 3 }}>
          <svg className="w-full h-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
            <motion.path
              d="M0 20 H320 L340 8 L360 32 L380 14 L400 26 L420 20 H600 L620 8 L640 32 L660 14 L680 26 L700 20 H900 L920 8 L940 32 L960 14 L980 26 L1000 20 H1440"
              stroke="#0EA5C0" strokeWidth="1.5" fill="none"
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.35 }}
              transition={{ duration: 2.4, ease: 'easeInOut', delay: 0.8 }}
            />
          </svg>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute right-1/2 translate-x-1/2 flex flex-col items-center gap-2 text-silver/40"
          style={{ willChange: 'opacity', bottom: scrollIndicatorBottom, zIndex: 10 }}
        >
          <span className="text-xs tracking-widest font-persian">اسکرول</span>
          <div className="w-px h-8 bg-gradient-to-b from-silver/40 to-transparent" />
        </div>
      </div>
    </section>
  )
}
