'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { doctor, headline } from '@/lib/content'
import PhoneIcon from '@/components/ui/PhoneIcon'

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false
    let ctx: { revert: () => void } | null = null

    // Disable smooth scroll while GSAP is active — they fight each other
    document.documentElement.style.scrollBehavior = 'auto'

    const initGSAP = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const video = videoRef.current
      if (!video || cancelled) return

      // Force the video to fully buffer before setting up scrub.
      // On mobile, partial buffer causes frame-seek stalls.
      const waitForBuffer = (): Promise<void> => new Promise((resolve) => {
        if (video.readyState >= 4) { resolve(); return }
        // Preload by playing then immediately pausing — forces browser to buffer
        const onCanPlay = () => { video.pause(); resolve() }
        video.addEventListener('canplaythrough', onCanPlay, { once: true })
        // Fallback: readyState check — if metadata loaded, proceed anyway after 800ms
        if (video.readyState >= 1) setTimeout(resolve, 800)
      })

      // Ensure metadata is loaded first
      const waitForMeta = (): Promise<void> => new Promise((resolve) => {
        if (video.readyState >= 1) { resolve(); return }
        video.addEventListener('loadedmetadata', () => resolve(), { once: true })
      })

      await waitForMeta()
      if (cancelled) return

      // Silently attempt to preload the whole video
      video.play().then(() => { video.pause(); video.currentTime = 0 }).catch(() => {})
      await waitForBuffer()
      if (cancelled) return

      ctx = gsap.context(() => {
        // Smooth target time — we lerp to this in a rAF loop
        let targetTime = 0
        const duration = video.duration || 1

        // GSAP drives a plain JS object (not video directly) — avoids decode stalls
        const proxy = { t: 0 }

        gsap.to(proxy, {
          t: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: '+=200%',
            scrub: 0.3,          // small scrub lag = butter-smooth, matches finger 1:1
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              targetTime = self.progress * duration
            },
            onLeave: () => ScrollTrigger.refresh(),
            onEnterBack: () => ScrollTrigger.refresh(),
          },
          onUpdate: () => {
            targetTime = proxy.t * duration
          },
        })

        // rAF loop: lerp video.currentTime toward targetTime every frame
        // This decouples the scroll event from the decode request,
        // letting the browser decode at its own pace without janking the scroll.
        let currentLerp = 0
        const LERP = 0.18 // lower = smoother, higher = more responsive

        const tick = () => {
          if (cancelled) return
          const diff = targetTime - currentLerp
          // Skip tiny updates to avoid unnecessary decode calls
          if (Math.abs(diff) > 0.001) {
            currentLerp += diff * LERP
            try {
              video.currentTime = currentLerp
            } catch (_) {}
          }
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)

        // CTA: entrance animation then fade on scroll
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', delay: 0.5 }
        )
        gsap.to(ctaRef.current, {
          opacity: 0,
          y: -20,
          scrollTrigger: {
            trigger: '#hero',
            start: '15% top',
            end: '45% top',
            scrub: true,
          },
        })

        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          scrollTrigger: {
            trigger: '#hero',
            start: '5% top',
            end: '20% top',
            scrub: true,
          },
        })
      })
    }

    initGSAP()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ctx?.revert()
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return (
    <section id="hero" className="relative">
      {/* will-change:transform tells the GPU to promote this layer — avoids repaint jank */}
      <div className="w-full h-full overflow-hidden" style={{ willChange: 'transform' }}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero-sequence/hero.mp4"
          poster="/hero-sequence/hero-poster.jpg"
          muted
          playsInline
          preload="auto"
          // disablePictureInPicture and x-webkit-airplay stop iOS from interrupting
          {...{ disablePictureInPicture: true, 'x-webkit-airplay': 'deny' }}
          style={{
            objectPosition: 'center center',
            // GPU-composited layer — prevents layout recalculation on currentTime change
            willChange: 'contents',
            // Disable iOS native controls that can interfere
            WebkitUserSelect: 'none',
          }}
        />

        {/* Edge vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(13,27,42,0.55)_100%)] pointer-events-none" />
        {/* Seamless bottom fade into TrustSnapshot */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0F2132] via-[#0F2132]/70 to-transparent pointer-events-none" />

        {/* CTA overlay */}
        <div
          ref={ctaRef}
          className="absolute bottom-20 left-4 sm:left-8 lg:left-16 opacity-0 flex flex-col items-start gap-4 max-w-[calc(100vw-2rem)] sm:max-w-none"
          style={{ willChange: 'opacity, transform' }}
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
          className="absolute bottom-6 right-1/2 translate-x-1/2 flex flex-col items-center gap-2 text-silver/40"
          style={{ willChange: 'opacity' }}
        >
          <span className="text-xs tracking-widest font-persian">اسکرول</span>
          <div className="w-px h-8 bg-gradient-to-b from-silver/40 to-transparent" />
        </div>
      </div>
    </section>
  )
}
