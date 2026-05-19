'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReveal } from '@/lib/hooks/useReveal'

const CALENDLY_URL = 'https://calendly.com/alisalehi11/30min'

export default function BookingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  useReveal(sectionRef, { threshold: 0.15, stagger: 120 })

  /* Load Calendly popup script once */
  useEffect(() => {
    if (document.getElementById('calendly-script')) return
    const s = document.createElement('script')
    s.id = 'calendly-script'
    s.src = 'https://assets.calendly.com/assets/external/widget.js'
    s.async = true
    document.head.appendChild(s)
  }, [])

  /* Open Calendly popup */
  const openCalendly = () => {
    // @ts-ignore
    if (window.Calendly) {
      // @ts-ignore
      window.Calendly.initPopupWidget({ url: CALENDLY_URL })
    } else {
      window.open(CALENDLY_URL, '_blank')
    }
  }

  return (
    <>
      {/* Calendly popup stylesheet */}
      <link
        href="https://assets.calendly.com/assets/external/widget.css"
        rel="stylesheet"
      />

      <section ref={sectionRef} id="booking" className="relative py-24 bg-navy overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="reveal flex items-center justify-center gap-3 mb-4">
              <span className="w-8 h-px bg-cyan" />
              <span className="text-cyan text-xs tracking-widest uppercase font-sans">Online Booking</span>
              <span className="w-8 h-px bg-cyan" />
            </div>
            <h2 className="reveal font-persian text-4xl sm:text-5xl text-clinical font-bold mb-4">
              رزرو آنلاین نوبت
            </h2>
            <p className="reveal text-silver/50 text-base max-w-md mx-auto leading-relaxed">
              زمان مناسب خود را انتخاب کنید — تأییدیه فوری دریافت خواهید کرد
            </p>
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-3xl p-10 lg:p-16 shadow-2xl shadow-navy text-center"
          >
            {/* Calendar icon */}
            <div className="flex justify-center mb-8">
              <div className="relative w-20 h-20">
                <div className="map-pulse-ring absolute inset-0 rounded-full bg-cyan/20" />
                <div className="map-pulse-ring absolute inset-0 rounded-full bg-cyan/10" style={{ animationDelay: '0.6s' }} />
                <div className="absolute inset-0 rounded-full bg-cyan/10 flex items-center justify-center">
                  <CalendarIcon />
                </div>
              </div>
            </div>

            <p className="text-silver/50 text-sm mb-8 leading-relaxed">
              انتخاب روز و ساعت مناسب • دریافت تأییدیه فوری از طریق ایمیل
            </p>

            <button
              onClick={openCalendly}
              className="inline-flex items-center gap-3 bg-cyan hover:bg-cyan-dark active:bg-cyan-dark text-navy font-bold text-lg sm:text-xl px-8 py-4 rounded-2xl shadow-xl shadow-cyan/30 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
            >
              <BookingIcon size={22} />
              رزرو آنلاین نوبت
            </button>

            <div className="flex flex-wrap justify-center gap-6 text-silver/30 text-xs mt-10">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan/50" />
                شنبه تا چهارشنبه
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan/50" />
                ۱۵:۳۰ تا ۱۹:۰۰
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan/50" />
                پیروزی، تهران
              </span>
            </div>
          </motion.div>

        </div>

        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
      </section>
    </>
  )
}

function CalendarIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-cyan">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function BookingIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M7 16 L9 14 L11 18 L13 13 L15 16 L17 16" strokeWidth="1.8" />
    </svg>
  )
}
