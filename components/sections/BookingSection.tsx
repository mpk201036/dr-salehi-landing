'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useReveal } from '@/lib/hooks/useReveal'

const CALENDLY_IFRAME_URL =
  'https://calendly.com/alisalehi11/30min?hide_gdpr_banner=1&embed_type=Inline&embed_domain=charming-custard-8e17a4.netlify.app'

export default function BookingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef, { threshold: 0.15, stagger: 120 })

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
          <p className="reveal text-silver/50 text-base max-w-md mx-auto leading-relaxed">
            زمان مناسب خود را انتخاب کنید — تأییدیه فوری دریافت خواهید کرد
          </p>
        </div>

        {/* Calendly iframe */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-3xl overflow-hidden shadow-2xl shadow-navy"
        >
          <iframe
            src={CALENDLY_IFRAME_URL}
            width="100%"
            height="700"
            frameBorder="0"
            title="رزرو نوبت آنلاین"
            style={{ display: 'block', background: '#ffffff' }}
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

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
    </section>
  )
}
