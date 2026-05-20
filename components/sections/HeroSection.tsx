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
  const device = useDeviceInfo()

  useEffect(() => {
    let cancelled = false
    let ctx: { revert: () => void } | null = null
    let rafId: number | null = null

    window.scrollTo(0, 0)
    document.documentElement.style.scrollBehavior = 'auto'
    if (videoRef.current) videoRef.current.currentTime = 0

    const initGSAP = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const video = videoRef.current
      if (!video || cancelled) return

      // Wait for metadata
      await new Promise<void>((resolve) => {
        if (video.readyState >= 1) { resolve(); return }
        video.addEventListener('loadedmetadata', () => resolve(), { once: true })
      })
      if (cancelled) return

      // Force browser to buffer the full video
      video.play().then(() => { video.pause(); video.currentTime = 0 }).catch(() => {})

      // Wait for full buffer with 3s fallback
      await new Promise<void>((resolve) => {
        if (video.readyState >= 4) { resolve(); return }
        video.addEventListener('canplaythrough', () => resolve(), { once: true })
        setTimeout(resolve, 3000)
      })
      if (cancelled) return

      const duration = video.duration || 1
      const isMobile = window.innerWidth < 768

      // Returns the furthest buffered second — clamp seeks to this
      const bufferedEnd = () => {
        if (!video.buffered.length) return duration
        let end = 0
        for (let i = 0; i < video.buffered.length; i++) {
          if (video.buffered.end(i) > end) end = video.buffered.end(i)
        }
        return end
      }

      // Lerped current time — smoothly interpolates between frames
      let displayTime = 0
      let targetTime = 0
      let isAnimating = false

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t
      // Lerp factor: higher = snappier, lower = smoother lag
      // 0.12 on desktop gives cinema-smooth; 0.18 on mobile avoids perceived lag
      const LERP_FACTOR = isMobile ? 0.18 : 0.12

      const tick = () => {
        if (cancelled) return
        const delta = Math.abs(targetTime - displayTime)
        if (delta > 0.001) {
          displayTime = lerp(displayTime, targetTime, LERP_FACTOR)
          const safeTime = Math.min(displayTime, bufferedEnd() - 0.05)
          if (safeTime >= 0) {
            try { video.currentTime = safeTime } catch (_) {}
          }
          rafId = requestAnimationFrame(tick)
        } else {
          // Snap to target when close enough, stop RAF
          displayTime = targetTime
          const safeTime = Math.min(displayTime, bufferedEnd() - 0.05)
          if (safeTime >= 0) {
            try { video.currentTime = safeTime } catch (_) {}
          }
          isAnimating = false
          rafId = null
        }
      }

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: '#hero',
          start: 'top top',
          end: '+=200%',
          // scrub: number adds GSAP's own lerp on top — we handle our own,
          // so use a small value just to smooth the progress signal itself
          scrub: isMobile ? 0.3 : 0.15,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          preventOverlaps: true,
          onUpdate: (self) => {
            targetTime = self.progress * duration
            if (!isAnimating) {
              isAnimating = true
              rafId = requestAnimationFrame(tick)
            }
          },
        })

        // CTA entrance — ease-out quart feels premium
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.5 }
        )
        // CTA fade on scroll — smooth scrub
        gsap.to(ctaRef.current, {
          opacity: 0, y: -24,
          scrollTrigger: {
            trigger: '#hero',
            start: '12% top',
            end: '40% top',
            scrub: 0.3,
          },
        })
        // Scroll indicator fade
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          scrollTrigger: {
            trigger: '#hero',
            start: '4% top',
            end: '18% top',
            scrub: 0.2,
          },
        })
      })
    }

    initGSAP()

    return () => {
      cancelled = true
      if (rafId !== null) cancelAnimationFrame(rafId)
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
      <div className="hero-inner relative w-full" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
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
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            WebkitUserSelect: 'none',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
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
