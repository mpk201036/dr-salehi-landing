'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { doctor } from '@/lib/content'
import { useReveal } from '@/lib/hooks/useReveal'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef, { threshold: 0.15, stagger: 150 })

  return (
    <section ref={sectionRef} id="about" className="relative py-24 bg-navy overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#0EA5C0 1px, transparent 1px), linear-gradient(90deg, #0EA5C0 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-cyan" />
            <span className="text-cyan text-xs tracking-widest uppercase font-sans">About Doctor</span>
            <span className="w-8 h-px bg-cyan" />
          </motion.div>

          <motion.h2 variants={itemVariants} className="font-persian text-4xl sm:text-5xl text-clinical font-bold mb-6 leading-tight">
            درباره <span className="text-cyan">{doctor.name}</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-silver/70 text-lg leading-relaxed mb-10 max-w-2xl">
            {doctor.bio}
          </motion.p>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-10 w-full">
            {[
              { icon: '🎓', label: 'تخصص', value: 'قلب و عروق' },
              { icon: '📍', label: 'مکان', value: 'تهران، پیروزی' },
              { icon: '🕐', label: 'ساعات کاری', value: '۱۶:۴۵ – ۲۰:۰۰\nشنبه تا چهارشنبه' },
              { icon: '📋', label: 'بیمه', value: 'نیروهای مسلح' },
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.04, borderColor: 'rgba(14,165,192,0.35)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-2 glass rounded-2xl p-5 cursor-default"
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="text-silver/50 text-xs">{item.label}</p>
                <p className="text-clinical font-semibold text-sm text-center whitespace-pre-line leading-snug">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-8 text-silver/50 text-sm border-t border-silver/10 pt-6">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0EA5C0" strokeWidth="2">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>تشخیص دقیق</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0EA5C0" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span>ویزیت بزرگسال و کودک</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
