'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useReveal } from '@/lib/hooks/useReveal'

const CALENDLY_URL = 'https://calendly.com/alisalehi11/30min'

export default function BookingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [loaded, setLoaded] = useState(false)
  useReveal(sectionRef, { threshold: 0.1, stagger: 120 })

  return (
    <section ref={sectionRef} id="booking" className="relative py-24 bg-navy overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

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
          <p className="reveal text-silver/50 text-base max-w-md mx-auto leading-relaxed font-persian">
            زمان مناسب خود را انتخاب کنید — تأییدیه فوری دریافت خواهید کرد
          </p>
        </div>

        {/* Inline Calendly embed */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-3xl overflow-hidden shadow-2xl shadow-navy relative"
          style={{ minHeight: 900 }}
        >
          {/* Skeleton shown while iframe loads */}
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-navy-800">
              <div className="relative w-16 h-16">
                <div className="map-pulse-ring absolute inset-0 rounded-full bg-cyan/20" />
                <div className="map-pulse-ring absolute inset-0 rounded-full bg-cyan/10" style={{ animationDelay: '0.6s' }} />
                <div className="absolute inset-0 rounded-full bg-cyan/10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0EA5C0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
              </div>
              <p className="text-silver/40 text-sm font-persian">در حال بارگذاری…</p>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-cyan/50"
                    style={{ animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          <iframe
            src={`${CALENDLY_URL}?embed_type=Inline&hide_landing_page_details=1&hide_gdpr_banner=1&background_color=0D1B2A&text_color=E6EEF6&primary_color=0EA5C0`}
            width="100%"
            height="900"
            frameBorder="0"
            title="رزرو نوبت آنلاین — دکتر علی صالحی"
            loading="eager"
            allow="payment"
            onLoad={() => setLoaded(true)}
            style={{
              display: 'block',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          />
        </motion.div>

        <div className="reveal flex flex-wrap justify-center gap-6 text-silver/30 text-xs mt-8">
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
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
    </section>
  )
}
