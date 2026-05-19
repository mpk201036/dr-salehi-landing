'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useReveal } from '@/lib/hooks/useReveal'

const CALENDLY_URL = 'https://calendly.com/alisalehi11/30min'

export default function BookingSection() {
  const sectionRef = useRef<HTMLElement>(null)
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
          className="glass rounded-3xl overflow-hidden shadow-2xl shadow-navy"
        >
          <iframe
            src={`${CALENDLY_URL}?embed_type=Inline&hide_landing_page_details=1&hide_gdpr_banner=1&background_color=0D1B2A&text_color=E6EEF6&primary_color=0EA5C0`}
            width="100%"
            height="700"
            frameBorder="0"
            title="رزرو نوبت آنلاین — دکتر علی صالحی"
            loading="lazy"
            allow="payment"
            style={{ display: 'block' }}
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
