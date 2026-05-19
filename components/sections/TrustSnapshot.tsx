'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { doctor } from '@/lib/content'
import { useReveal } from '@/lib/hooks/useReveal'

const stats = [
  { value: '۴۰+', label: 'سال تجربه', en: 'Years Experience' },
  { value: '۳٬۵۶۱', label: 'بیمار موفق', en: 'Successful Patients' },
  { value: '۴.۹', label: 'امتیاز', en: 'Rating / 5' },
  { value: '۹۷٪', label: 'توصیه کاربران', en: 'Recommended' },
]

export default function TrustSnapshot() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef, { threshold: 0.2, stagger: 120 })

  return (
    <section
      ref={sectionRef}
      id="trust"
      className="relative pt-16 pb-16 bg-navy-800 border-b border-cyan/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 28, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(14,165,192,0.35)' }}
              className="glass rounded-2xl p-6 text-center group cursor-default"
            >
              <motion.p
                className="text-4xl lg:text-5xl font-bold text-cyan counter-num mb-2"
                whileHover={{ scale: 1.12 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-silver font-medium text-base">{stat.label}</p>
              <p className="text-silver/40 text-xs mt-1 font-sans italic">{stat.en}</p>
            </motion.div>
          ))}
        </div>

        {/* Booking note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-silver/50 text-sm text-center"
        >
          <span className="w-12 h-px bg-silver/20" />
          <span>رزرو نوبت: تنها از طریق تماس تلفنی</span>
          <a
            href={`tel:${doctor.phonePlain}`}
            className="text-cyan hover:text-cyan-light transition-colors font-medium"
            dir="ltr"
          >
            {doctor.phone}
          </a>
          <span className="w-12 h-px bg-silver/20" />
        </motion.div>
      </div>
    </section>
  )
}
