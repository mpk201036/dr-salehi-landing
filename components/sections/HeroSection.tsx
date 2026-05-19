'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { doctor, headline } from '@/lib/content'
import PhoneIcon from '@/components/ui/PhoneIcon'
import { useDeviceInfo } from '@/lib/hooks/useDeviceInfo'

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const device = useDeviceInfo()

  useEffect(() => {
    let cancelled = false
    let ctx: { revert: () => void } | null = null

    document.documentElement.style.scrollBehavior = 'auto'

    const initGSAP = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const video = videoRef.current
      if (!video || cancelled) return

      // ── Buffer the full video before setting up scrub ──────────────────────
      // On mobile, seeking into unbuffered regions causes freezes.
      // We play+pause silently to force the browser to buffer everything.
      const waitForMeta = (): Promise<void> => new Promise((resolve) => {
        if (video.readyState >= 1) { resolve(); return }
        video.addEventListener('loadedmetadata', () => resolve(), { once: true })
      })

      const waitForBuffer = (): Promise<void> => new Promise((resolve) => {
        if (video.readyState >= 4) { resolve(); return }
        video.addEventListener('canplaythrough', () => resolve(), { once: true })
        // Hard fallback: if metadata is loaded but canplaythrough doesn't fire,
        // proceed after 1.5 s so we don't block forever on slow connections
        setTimeout(resolve, 1500)
      })

      await waitForMeta()
      if (cancelled) return

      video.play().then(() => { video.pause(); video.currentTime = 0 }).catch(() => {})
      await waitForBuffer()
      if (cancelled) return

      const duration = video.duration || 1

      // ── Shared mutable state ────────────────────────────────────────────────
      // targetTime: where scroll says we SHOULD be (updated by GSAP)
      // displayTime: where we currently ARE (lerped in rAF toward targetTime)
      let targetTime = 0
      let displayTime = 0

      // Seek-gate: only write currentTime when the delta is worth a decode call.
      // Threshold in seconds — smaller = more responsive, larger = fewer stalls.
      const SEEK_THRESHOLD = 0.015          // ~0.4 frames at 24fps
      // Lerp factor — lower = smoother easing, higher = snappier tracking.
      // 0.10 on mobile (decoder is slower), 0.16 on desktop.
      const isMobile = window.innerWidth < 768
      const LERP = isMobile ? 0.10 : 0.16

      // Last actual seek timestamp — throttle to at most one seek per 32ms (≈30fps)
      // so we never flood the decoder pipeline.
      let lastSeekAt = 0
      const SEEK_INTERVAL_MS = isMobile ? 40 : 32

      // ── rAF loop: smooth lerp + throttled seek ──────────────────────────────
      const tick = (now: number) => {
        if (cancelled) return

        const diff = targetTime - displayTime

        if (Math.abs(diff) > SEEK_THRESHOLD) {
          displayTime += diff * LERP

          // Only write to video.currentTime at the throttled rate
          if (now - lastSeekAt >= SEEK_INTERVAL_MS) {
            try {
              video.currentTime = displayTime
              lastSeekAt = now
            } catch (_) {}
          }
        }

        rafRef.current = requestAnimationFrame(tick)
      }

      // ── GSAP ScrollTrigger ──────────────────────────────────────────────────
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: '#hero',
          start: 'top top',
          end: '+=200%',
          scrub: 1,              // 1s scrub lag — gives the decoder time to keep up
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Only update targetTime — never seek from here directly
            targetTime = self.progress * duration
          },
        })

        // CTA entrance + scroll-fade
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', delay: 0.6 }
        )
        gsap.to(ctaRef.current, {
          opacity: 0, y: -20,
          scrollTrigger: { trigger: '#hero', start: '15% top', end: '45% top', scrub: true },
        })

        // Scroll indicator fade
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          scrollTrigger: { trigger: '#hero', start: '5% top', end: '20% top', scrub: true },
        })
      })

      // Start the rAF loop after ScrollTrigger is set up
      rafRef.current = requestAnimationFrame(tick)
    }

    initGSAP()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ctx?.revert()
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  const videoObjectPosition = device.isMobile && device.isPortrait
    ? 'center 15%'
    : device.isTablet
    ? 'center 25%'
    : 'center center'

  const ctaBottom = device.isIOS
    ? 'calc(6rem + env(safe-area-inset-bottom, 20px))'
    : '5rem'

  const scrollIndicatorBottom = device.isIOS
    ? 'calc(1.5rem + env(safe-area-inset-bottom, 20px))'
    : '1.5rem'

  return (
    <section id="hero" className="relative">
      <div className="hero-inner relative w-full" style={{ willChange: 'transform' }}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero-sequence/hero.mp4"
          poster="/hero-sequence/hero-poster.jpg"
          muted
          playsInline
          preload="auto"
          {...{ disablePictureInPicture: true, 'x-webkit-airplay': 'deny' }}
          style={{
            objectPosition: videoObjectPosition,
            willChange: 'contents',
            WebkitUserSelect: 'none',
          }}
        />

        {/* Edge vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(13,27,42,0.55)_100%)] pointer-events-none" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0F2132] via-[#0F2132]/70 to-transparent pointer-events-none" />

        {/* CTA overlay */}
        <div
          ref={ctaRef}
          className="absolute left-4 sm:left-8 lg:left-16 opacity-0 flex flex-col items-start gap-4 max-w-[calc(100vw-2rem)] sm:max-w-none"
          style={{ willChange: 'opacity, transform', bottom: ctaBottom }}
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
        <div className="absolute bottom-16 inset-x-0 pointer-events-none overflow-hidden h-10 hidden sm:block">
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
          style={{ willChange: 'opacity', bottom: scrollIndicatorBottom }}
        >
          <span className="text-xs tracking-widest font-persian">اسکرول</span>
          <div className="w-px h-8 bg-gradient-to-b from-silver/40 to-transparent" />
        </div>
      </div>
    </section>
  )
}
