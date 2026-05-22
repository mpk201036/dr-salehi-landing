'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { doctor, headline } from '@/lib/content'
import PhoneIcon from '@/components/ui/PhoneIcon'
import { useDeviceInfo } from '@/lib/hooks/useDeviceInfo'

const BLOB_BASE = 'https://aishlohl6lhgqkkq.public.blob.vercel-storage.com/hero-sequence'
const VIDEO_SRC = `${BLOB_BASE}/hero-seekable.mp4`
const POSTER_SRC = `${BLOB_BASE}/hero-poster.jpg`
const VIDEO_DURATION = 49.375

function HeroVideo({
  ctaRef,
  scrollIndicatorRef,
}: {
  ctaRef: React.RefObject<HTMLDivElement | null>
  scrollIndicatorRef: React.RefObject<HTMLDivElement | null>
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let cancelled = false
    let gsapCtx: { revert: () => void } | null = null
    let rafId: number | null = null

    window.scrollTo(0, 0)
    document.documentElement.style.scrollBehavior = 'auto'

    const video = videoRef.current
    if (!video) return

    let targetTime = 0
    let isSeeking = false
    let pendingTime: number | null = null

    const flushSeek = () => {
      if (isSeeking || pendingTime === null) return
      const t = pendingTime
      pendingTime = null
      if (Math.abs(video.currentTime - t) < 0.008) return
      isSeeking = true
      try { video.currentTime = t } catch (_) { isSeeking = false }
    }

    video.addEventListener('seeked', () => {
      isSeeking = false
      flushSeek()
    })

    const tick = () => {
      if (cancelled) return
      rafId = requestAnimationFrame(tick)
      const clamped = Math.max(0, Math.min(targetTime, VIDEO_DURATION - 0.04))
      if (Math.abs((pendingTime ?? video.currentTime) - clamped) > 0.008) {
        pendingTime = clamped
        flushSeek()
      }
    }

    const initGSAP = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (cancelled) return

      // Start RAF and GSAP immediately — no waiting for canplay.
      // Poster is visible while video buffers; seeks queue up and fire as data arrives.
      rafId = requestAnimationFrame(tick)

      const isMobile = window.innerWidth < 768

      gsapCtx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: '#hero',
          start: 'top top',
          end: '+=200%',
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          preventOverlaps: true,
          onUpdate: (self) => {
            targetTime = self.progress * VIDEO_DURATION
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
      document.documentElement.style.scrollBehavior = ''
    }
  }, [ctaRef, scrollIndicatorRef])

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      poster={POSTER_SRC}
      muted
      playsInline
      preload="auto"
      className="absolute inset-0 w-full h-full object-cover"
      style={{
        zIndex: 1,
        objectPosition: 'center 20%',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    />
  )
}

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
          <HeroVideo ctaRef={ctaRef} scrollIndicatorRef={scrollIndicatorRef} />
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
