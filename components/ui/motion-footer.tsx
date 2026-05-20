'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'
import { doctor } from '@/lib/content'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
@keyframes footer-breathe {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.9; }
}
@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes footer-heartbeat {
  0%,100% { transform: scale(1);   }
  15%,45% { transform: scale(1.35); }
  30%     { transform: scale(1);   }
}
@keyframes footer-pulse-ring {
  0%   { transform: scale(1);   opacity: 0.6; }
  70%  { transform: scale(2.2); opacity: 0;   }
  100% { transform: scale(1);   opacity: 0;   }
}

.cf-breathe    { animation: footer-breathe 8s ease-in-out infinite alternate; }
.cf-marquee    { animation: footer-scroll-marquee 38s linear infinite; }
.cf-heartbeat  { animation: footer-heartbeat 2s cubic-bezier(0.25,1,0.5,1) infinite; }
.cf-pulse-ring { animation: footer-pulse-ring 2s ease-out infinite; }

.cf-grid {
  background-size: 56px 56px;
  background-image:
    linear-gradient(to right, rgba(14,165,192,0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(14,165,192,0.06) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
}

.cf-giant {
  font-size: clamp(80px, 22vw, 320px);
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(14,165,192,0.07);
  background: linear-gradient(180deg, rgba(14,165,192,0.12) 0%, transparent 55%);
  -webkit-background-clip: text;
  background-clip: text;
  font-family: var(--font-persian), Tahoma, sans-serif;
}

.cf-glow {
  background: linear-gradient(180deg, #ffffff 0%, rgba(230,238,246,0.55) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 28px rgba(14,165,192,0.25));
  line-height: 1.3;
  padding-bottom: 0.1em;
  display: inline-block;
}

.cf-pill {
  background: linear-gradient(145deg, rgba(14,165,192,0.08) 0%, rgba(14,165,192,0.03) 100%);
  border: 1px solid rgba(14,165,192,0.15);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
}
.cf-pill:hover {
  background: linear-gradient(145deg, rgba(14,165,192,0.18) 0%, rgba(14,165,192,0.07) 100%);
  border-color: rgba(14,165,192,0.4);
  box-shadow: 0 0 24px rgba(14,165,192,0.15);
  color: #ffffff;
}
`

// ─── Magnetic Button ──────────────────────────────────────────────────────────
type MagneticProps = React.HTMLAttributes<HTMLElement> & { as?: React.ElementType; href?: string; onClick?: () => void }

const MagneticButton = React.forwardRef<HTMLElement, MagneticProps>(
  ({ className, children, as: Tag = 'button', ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null)

    useEffect(() => {
      const el = localRef.current
      if (!el) return
      const ctx = gsap.context(() => {
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect()
          const x = e.clientX - r.left - r.width / 2
          const y = e.clientY - r.top - r.height / 2
          gsap.to(el, { x: x * 0.35, y: y * 0.35, rotationX: -y * 0.12, rotationY: x * 0.12, scale: 1.06, ease: 'power2.out', duration: 0.35 })
        }
        const onLeave = () => gsap.to(el, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, ease: 'elastic.out(1,0.3)', duration: 1.1 })
        el.addEventListener('mousemove', onMove as EventListener)
        el.addEventListener('mouseleave', onLeave)
        return () => { el.removeEventListener('mousemove', onMove as EventListener); el.removeEventListener('mouseleave', onLeave) }
      }, el)
      return () => ctx.revert()
    }, [])

    return (
      <Tag
        ref={(node: HTMLElement) => {
          (localRef as React.MutableRefObject<HTMLElement | null>).current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node
        }}
        className={cn('cursor-pointer', className)}
        {...props}
      >
        {children}
      </Tag>
    )
  }
)
MagneticButton.displayName = 'MagneticButton'

// ─── Marquee content ──────────────────────────────────────────────────────────
const MarqueeItem = () => (
  <div className="flex items-center gap-10 px-6 font-persian whitespace-nowrap shrink-0">
    <span>متخصص قلب و عروق</span>
    <span className="text-cyan/50">✦</span>
    <span>بیش از ۴۰ سال تجربه</span>
    <span className="text-cyan/50">✦</span>
    <span>اکوکاردیوگرافی</span>
    <span className="text-cyan/50">✦</span>
    <span>نوار قلب</span>
    <span className="text-cyan/50">✦</span>
    <span>تست ورزش</span>
    <span className="text-cyan/50">✦</span>
    <span>هولتر مانیتورینگ</span>
    <span className="text-cyan/50">✦</span>
    <span>رزرو آنلاین نوبت</span>
    <span className="text-cyan/50">✦</span>
  </div>
)

// ─── Nav links ────────────────────────────────────────────────────────────────
const navLinks = [
  { label: 'درباره دکتر', href: '#about' },
  { label: 'خدمات', href: '#services' },
  { label: 'تجهیزات', href: '#equipment' },
  { label: 'نظرات', href: '#testimonials' },
  { label: 'سؤالات', href: '#faq' },
  { label: 'آدرس', href: '#location' },
]

// ─── Main Component ───────────────────────────────────────────────────────────
export function CinematicFooter() {
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const giantRef    = useRef<HTMLDivElement>(null)
  const headingRef  = useRef<HTMLHeadingElement>(null)
  const linksRef    = useRef<HTMLDivElement>(null)
  const bottomRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !wrapperRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(giantRef.current,
        { y: '12vh', opacity: 0 },
        { y: '0vh', opacity: 1, ease: 'power1.out',
          scrollTrigger: { trigger: wrapperRef.current, start: 'top 85%', end: 'bottom bottom', scrub: 1.2 } })

      gsap.fromTo([headingRef.current, linksRef.current, bottomRef.current],
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: wrapperRef.current, start: 'top 45%', end: 'center bottom', scrub: 1 } })
    }, wrapperRef)
    return () => ctx.revert()
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
      >
        <footer className="fixed bottom-0 left-0 h-screen w-full flex flex-col justify-between bg-navy text-silver" style={{ overflow: 'hidden' }}>

          {/* Aurora glow */}
          <div className="cf-breathe absolute left-1/2 top-1/2 h-[55vh] w-[75vw] rounded-[50%] blur-[90px] pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle, rgba(14,165,192,0.12) 0%, rgba(239,56,56,0.05) 50%, transparent 70%)' }} />

          {/* Grid */}
          <div className="cf-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant bg text */}
          <div ref={giantRef} className="cf-giant absolute -bottom-[4vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none">
            صالحی
          </div>

          {/* Marquee */}
          <div className="absolute top-20 left-0 w-full overflow-hidden border-y border-cyan/10 bg-navy/70 backdrop-blur-md py-3 z-10">
            <div className="cf-marquee flex w-max text-xs font-bold text-silver/30 whitespace-nowrap" style={{ flexWrap: 'nowrap' }}>
              <MarqueeItem /><MarqueeItem />
            </div>
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-16 w-full max-w-5xl mx-auto">

            <h2 ref={headingRef} className="text-4xl sm:text-6xl md:text-8xl font-black mb-10 text-center font-persian" style={{ overflow: 'visible' }}>
              <span className="cf-glow">نوبت بگیرید</span>
            </h2>

            <div ref={linksRef} className="flex flex-col items-center gap-5 w-full">

              {/* Primary CTA */}
              <div className="flex flex-wrap justify-center gap-4">
                <MagneticButton as="a" href="#booking"
                  className="cf-pill px-8 py-4 rounded-full text-cyan font-bold text-sm flex items-center gap-3 group">
                  <div className="relative w-5 h-5">
                    <div className="cf-pulse-ring absolute inset-0 rounded-full bg-cyan/30" />
                    <svg className="relative w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <path d="M7 16 L9 14 L11 18 L13 13 L15 16 L17 16" strokeWidth="1.8" />
                    </svg>
                  </div>
                  رزرو آنلاین نوبت
                </MagneticButton>

                <MagneticButton as="a" href={`tel:${doctor.phonePlain}`}
                  className="cf-pill px-8 py-4 rounded-full text-silver/70 font-bold text-sm flex items-center gap-3" dir="ltr">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.36 12 19.79 19.79 0 011.3 3.41 2 2 0 013.28 1.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.62a16 16 0 006.29 6.29l1.54-1.54a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  {doctor.phone}
                </MagneticButton>
              </div>

              {/* Nav links */}
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {navLinks.map((link) => (
                  <MagneticButton key={link.href} as="a" href={link.href}
                    className="cf-pill px-4 py-2 rounded-full text-silver/40 font-medium text-xs hover:text-silver font-persian">
                    {link.label}
                  </MagneticButton>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div ref={bottomRef} className="relative z-20 w-full pb-6 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Copyright */}
            <p className="text-silver/20 text-xs font-medium order-2 md:order-1 font-persian">
              © ۱۴۰۴ دکتر علی صالحی — تمام حقوق محفوظ است
            </p>

            {/* Made with love */}
            <div className="cf-pill px-5 py-2.5 rounded-full flex items-center gap-2 order-1 md:order-2">
              <span className="text-silver/30 text-xs font-medium font-persian">ساخته شده با</span>
              <span className="cf-heartbeat text-arterial text-sm">❤</span>
              <span className="text-silver/30 text-xs font-medium font-persian">برای سلامت شما</span>
            </div>

            {/* Back to top */}
            <MagneticButton as="button" onClick={scrollToTop}
              className="w-11 h-11 rounded-full cf-pill flex items-center justify-center text-silver/30 hover:text-cyan group order-3">
              <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  )
}
