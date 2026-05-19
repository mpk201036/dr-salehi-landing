'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useReveal } from '@/lib/hooks/useReveal'

const CALENDLY_URL = 'https://calendly.com/alisalehi11/30min'

export default function BookingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef, { threshold: 0.15, stagger: 120 })

  useEffect(() => {
    const existing = document.getElementById('calendly-script')
    if (existing) return
    const script = document.createElement('script')
    script.id = 'calendly-script'
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  return (
    <section ref={sectionRef} id="booking" className="relative py-24 bg-navy overflow-hidden">
      {/* Subtle top border line */}
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
          <p className="reveal text-silver/50 text-base max-w-md mx-auto leading-relaxed">
            زمان مناسب خود را انتخاب کنید — تأییدیه فوری دریافت خواهید کرد
          </p>
        </div>

        {/* Calendly widget container */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-3xl overflow-hidden shadow-2xl shadow-navy"
        >
          <div
            className="calendly-inline-widget"
            data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=0a1628&text_color=e2e8f0&primary_color=0EA5C0`}
            style={{ minWidth: '320px', height: '700px' }}
          />
        </motion.div>

        {/* Note */}
        <p className="reveal text-center text-silver/30 text-xs mt-6">
          پس از رزرو، ایمیل تأییدیه دریافت خواهید کرد • در صورت نیاز با{' '}
          <a href="tel:02177433062" className="text-cyan/60 hover:text-cyan transition-colors">
            ۰۲۱ ۷۷۴۳ ۳۰۶۲
          </a>{' '}
          تماس بگیرید
        </p>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
    </section>
  )
}
