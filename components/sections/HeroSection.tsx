'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { doctor, headline } from '@/lib/content'
import PhoneIcon from '@/components/ui/PhoneIcon'
import { useDeviceInfo } from '@/lib/hooks/useDeviceInfo'

// Clip durations in seconds (from ffprobe) — used to weight scroll segments
const CLIP_DURATIONS = [6.041667, 4.041667, 6.041667, 6.041667, 6.041667, 6.041667, 4.041667, 6.041667, 5.041667]
const CLIP_COUNT = CLIP_DURATIONS.length
const TOTAL_DURATION = CLIP_DURATIONS.reduce((a, b) => a + b, 0)

// Cumulative start offsets as a fraction of total [0..1]
const CLIP_START_FRACTIONS = CLIP_DURATIONS.reduce<number[]>((acc, dur, i) => {
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

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const device = useDeviceInfo()

  useEffect(() => {
    let cancelled = false
    let ctx: { revert: () => void } | null = null
    let rafId: number | null = null

    window.scrollTo(0, 0)
    document.documentElement.style.scrollBehavior = 'auto'

    // Create all video elements off-DOM
    const videos: HTMLVideoElement[] = Array.from({ length: CLIP_COUNT }, (_, i) => {
      const v = document.createElement('video')
      v.src = `/hero-sequence/${i + 1}.mp4`
      v.muted = true
      v.playsInline = true
      v.preload = 'auto'
      v.setAttribute('disablepictureinpicture', '')
      v.setAttribute('x-webkit-airplay', 'deny')
      return v
    })

    const canvas = canvasRef.current
    if (!canvas) return
    const c2d = canvas.getContext('2d', { alpha: false })
    if (!c2d) return

    // Resize canvas to match display pixels — this is what makes it sharp
    const resizeCanvas = () => {
      if (!canvas || cancelled) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
        c2d.scale(dpr, dpr)
      }
    }

    // Draw the current frame from whichever video is active
    let currentClipIndex = 0
    let lastDrawnClipIndex = -1
    let lastDrawnTime = -1

    const drawFrame = () => {
      if (!canvas || !c2d || cancelled) return
      const v = videos[currentClipIndex]
      if (!v || v.readyState < 2) return

      const vt = v.currentTime
      // Skip redraw if nothing changed
      if (currentClipIndex === lastDrawnClipIndex && Math.abs(vt - lastDrawnTime) < 0.001) return

      const cw = canvas.offsetWidth
      const ch = canvas.offsetHeight
      const vw = v.videoWidth || 1916
      const vh = v.videoHeight || 1080

      // Cover scaling — same as object-fit: cover
      const scale = Math.max(cw / vw, ch / vh)
      const dw = vw * scale
      const dh = vh * scale
      const dx = (cw - dw) / 2
      // Portrait/mobile: shift up to show top of frame (matches the old objectPosition: center 15%)
      const isMobilePortrait = window.innerWidth < 768 && window.innerHeight > window.innerWidth
      const dyRaw = (ch - dh) / 2
      const dy = isMobilePortrait ? Math.min(dyRaw, dyRaw + (dh - ch) * 0.30) : dyRaw

      c2d.drawImage(v, dx, dy, dw, dh)
      lastDrawnClipIndex = currentClipIndex
      lastDrawnTime = vt
    }

    // Seeking machinery per clip — same queue pattern as before, per video
    const seeking = new Array(CLIP_COUNT).fill(false)
    const pendingTime = new Array<number | null>(CLIP_COUNT).fill(null)

    const applySeek = (clipIdx: number, t: number) => {
      const v = videos[clipIdx]
      if (!v) return
      const clamped = Math.max(0, Math.min(t, CLIP_DURATIONS[clipIdx] - 0.04))
      if (seeking[clipIdx]) {
        pendingTime[clipIdx] = clamped
        return
      }
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
      })
    })

    // Global scroll progress → clip + localTime target
    let targetClipIndex = 0
    let targetLocalTime = 0

    const tick = () => {
      if (cancelled) return
      currentClipIndex = targetClipIndex
      applySeek(targetClipIndex, targetLocalTime)
      drawFrame()
      rafId = requestAnimationFrame(tick)
    }

    const resizeObs = new ResizeObserver(() => {
      resizeCanvas()
      drawFrame()
    })
    resizeObs.observe(canvas)
    resizeCanvas()

    const initGSAP = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (cancelled) return

      // Wait for first clip to have metadata before starting
      await new Promise<void>((resolve) => {
        const v = videos[0]
        if (v.readyState >= 1) { resolve(); return }
        v.addEventListener('loadedmetadata', () => resolve(), { once: true })
        setTimeout(resolve, 3000)
      })
      if (cancelled) return

      // Pre-buffer clip 0 fully; start buffering the rest in the background
      videos[0].play().then(() => { videos[0].pause(); videos[0].currentTime = 0 }).catch(() => {})
      for (let i = 1; i < CLIP_COUNT; i++) {
        // Fire-and-forget: start loading without waiting
        videos[i].load()
        videos[i].play().then(() => { videos[i].pause(); videos[i].currentTime = 0 }).catch(() => {})
      }

      rafId = requestAnimationFrame(tick)

      const isMobile = window.innerWidth < 768

      ctx = gsap.context(() => {
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

        gsap.fromTo(
          ctaRef.current,
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
      ctx?.revert()
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
      <div
        className="hero-inner relative w-full"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        {/* Poster shown until first frame draws — sits beneath canvas */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-sequence/hero-poster.jpg)', zIndex: 0 }}
          aria-hidden="true"
        />

        {/* Canvas — renders frames pixel-perfect at device DPR, sits above poster */}
        <canvas
          ref={canvasRef}
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(13,27,42,0.55)_100%)] pointer-events-none" style={{ zIndex: 2 }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0F2132] via-[#0F2132]/70 to-transparent pointer-events-none" style={{ zIndex: 2 }} />

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
              stroke="#0EA5C0"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
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
