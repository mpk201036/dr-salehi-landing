'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { doctor, headline } from '@/lib/content'
import PhoneIcon from '@/components/ui/PhoneIcon'
import { useDeviceInfo } from '@/lib/hooks/useDeviceInfo'

const BLOB_BASE = 'https://aishlohl6lhgqkkq.public.blob.vercel-storage.com/hero-sequence'

const CLIP_DURATIONS = [6.041667, 4.041667, 6.041667, 6.041667, 6.041667, 6.041667, 4.041667, 6.041667, 5.041667]
const CLIP_COUNT = CLIP_DURATIONS.length
const TOTAL_DURATION = CLIP_DURATIONS.reduce((a, b) => a + b, 0)

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

// ─── Desktop: canvas scroll-scrub through all 9 clips ────────────────────────

function DesktopHero({
  ctaRef,
  scrollIndicatorRef,
}: {
  ctaRef: React.RefObject<HTMLDivElement | null>
  scrollIndicatorRef: React.RefObject<HTMLDivElement | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    let gsapCtx: { revert: () => void } | null = null
    let rafId: number | null = null

    window.scrollTo(0, 0)
    document.documentElement.style.scrollBehavior = 'auto'

    // Create all video elements — muted + playsInline required for autoplay/seek on mobile
    const videos: HTMLVideoElement[] = Array.from({ length: CLIP_COUNT }, (_, i) => {
      const v = document.createElement('video')
      v.src = `${BLOB_BASE}/${i + 1}.mp4`
      v.muted = true
      v.playsInline = true
      v.preload = 'auto'
      v.setAttribute('disablepictureinpicture', '')
      v.setAttribute('x-webkit-airplay', 'deny')
      return v
    })

    const canvas = canvasRef.current
    if (!canvas) return
    const c2d = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (!c2d) return

    // Size canvas to physical pixels for sharpness
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

    // Cover-fit draw — same as object-fit: cover
    const drawVideo = (v: HTMLVideoElement) => {
      if (!canvas || !c2d || cancelled) return
      const cw = canvas.offsetWidth
      const ch = canvas.offsetHeight
      const vw = v.videoWidth || 1920
      const vh = v.videoHeight || 1080
      const scale = Math.max(cw / vw, ch / vh)
      const dw = vw * scale
      const dh = vh * scale
      const dx = (cw - dw) / 2
      const dyRaw = (ch - dh) / 2
      // Portrait: shift frame up 30% to keep subject visible
      const isPortrait = window.innerWidth < 768 && window.innerHeight > window.innerWidth
      const dy = isPortrait ? Math.min(dyRaw, dyRaw + (dh - ch) * 0.30) : dyRaw
      c2d.drawImage(v, dx, dy, dw, dh)
    }

    // Per-clip seek state — latest desired time wins, seek fires when previous finishes
    const seekTarget = new Float64Array(CLIP_COUNT).fill(-1)
    const isSeeking = new Array(CLIP_COUNT).fill(false)

    const flushSeek = (i: number) => {
      if (isSeeking[i] || seekTarget[i] < 0) return
      const v = videos[i]
      const t = seekTarget[i]
      seekTarget[i] = -1
      if (Math.abs(v.currentTime - t) < 0.008) return
      isSeeking[i] = true
      try { v.currentTime = t } catch (_) { isSeeking[i] = false }
    }

    const requestSeek = (i: number, t: number) => {
      const clamped = Math.max(0, Math.min(t, CLIP_DURATIONS[i] - 0.02))
      seekTarget[i] = clamped
      flushSeek(i)
    }

    videos.forEach((v, i) => {
      v.addEventListener('seeked', () => {
        isSeeking[i] = false
        flushSeek(i) // immediately apply any newer target that arrived while we were seeking
      })
    })

    // Active clip tracking
    let activeClip = 0
    let lastDrawnClip = -1
    let lastDrawnTime = -1

    const tick = () => {
      if (cancelled) return
      rafId = requestAnimationFrame(tick)

      const v = videos[activeClip]
      // readyState 2 = HAVE_CURRENT_DATA — enough to draw
      if (!v || v.readyState < 2) return

      const vt = v.currentTime
      // Skip redraw if nothing changed
      if (activeClip === lastDrawnClip && Math.abs(vt - lastDrawnTime) < 0.004) return

      drawVideo(v)
      lastDrawnClip = activeClip
      lastDrawnTime = vt
    }

    const resizeObs = new ResizeObserver(() => { resizeCanvas() })
    resizeObs.observe(canvas)
    resizeCanvas()

    const initGSAP = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (cancelled) return

      // Wait for first clip to have enough data to draw frame 0
      await new Promise<void>((resolve) => {
        const v = videos[0]
        if (v.readyState >= 2) { resolve(); return }
        v.addEventListener('canplay', () => resolve(), { once: true })
        setTimeout(resolve, 4000)
      })
      if (cancelled) return

      // Aggressively buffer all clips: play+pause forces the browser to decode
      // We stagger them so clip 0 gets priority bandwidth
      const bufferClip = (i: number) =>
        videos[i].play().then(() => { videos[i].pause(); videos[i].currentTime = 0 }).catch(() => {})

      await bufferClip(0)
      for (let i = 1; i < CLIP_COUNT; i++) bufferClip(i)

      rafId = requestAnimationFrame(tick)

      const isMobile = window.innerWidth < 768

      gsapCtx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: '#hero',
          start: 'top top',
          end: '+=200%',
          // scrub: true = 1:1 with scroll, no lag — smoothest for frame-accurate scrub
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          preventOverlaps: true,
          onUpdate: (self) => {
            const { clipIndex, localTime } = getClipAndTime(self.progress)

            // Switch active clip
            if (clipIndex !== activeClip) {
              activeClip = clipIndex
            }

            // Seek active clip
            requestSeek(clipIndex, localTime)

            // Pre-warm neighboring clips to their boundary frame so transitions are instant
            if (clipIndex > 0) {
              requestSeek(clipIndex - 1, CLIP_DURATIONS[clipIndex - 1] - 0.04)
            }
            if (clipIndex < CLIP_COUNT - 1) {
              requestSeek(clipIndex + 1, 0)
            }
          },
        })

        gsap.fromTo(ctaRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: isMobile ? 0.8 : 1.0, ease: 'power3.out', delay: isMobile ? 0.3 : 0.5 }
        )
        gsap.to(ctaRef.current, {
          opacity: 0, y: -24,
          scrollTrigger: { trigger: '#hero', start: '12% top', end: '40% top', scrub: true },
        })
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          scrollTrigger: { trigger: '#hero', start: '4% top', end: '18% top', scrub: true },
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
  }, [ctaRef, scrollIndicatorRef])

  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BLOB_BASE}/hero-poster.jpg)`, zIndex: 0 }}
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          zIndex: 1,
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden' as React.CSSProperties['WebkitBackfaceVisibility'],
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />
    </>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function HeroSection() {
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const device = useDeviceInfo()

  const ctaBottom = device.isIOS
    ? 'calc(6rem + env(safe-area-inset-bottom, 20px))'
    : '5rem'

  const scrollIndicatorBottom = device.isIOS
    ? 'calc(1.5rem + env(safe-area-inset-bottom, 20px))'
    : '1.5rem'

  return (
    <section id="hero" className="relative">
      <div className="hero-inner relative w-full" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>

        {device.mounted && (
          <DesktopHero ctaRef={ctaRef} scrollIndicatorRef={scrollIndicatorRef} />
        )}

        {/* Edge vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(13,27,42,0.55) 100%)', zIndex: 2 }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0F2132, rgba(15,33,50,0.7), transparent)', zIndex: 2 }} />

        {/* CTA overlay */}
        <div
          ref={ctaRef}
          className="absolute left-4 sm:left-8 lg:left-16 flex flex-col items-start gap-4 max-w-[calc(100vw-2rem)] sm:max-w-none"
          style={{
            willChange: 'opacity, transform',
            bottom: ctaBottom,
            zIndex: 10,
            opacity: 0,
            transform: 'translateY(32px)',
          }}
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
