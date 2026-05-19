'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { doctor } from '@/lib/content'
import { useReveal } from '@/lib/hooks/useReveal'
import PhoneIcon from '@/components/ui/PhoneIcon'

function MagneticButton({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 20 })
  const sy = useSpring(y, { stiffness: 200, damping: 20 })

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) * 0.25)
    y.set((e.clientY - cy) * 0.25)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      whileTap={{ scale: 0.96 }}
      className="group inline-flex items-center gap-3 sm:gap-4 bg-cyan hover:bg-cyan-dark active:bg-cyan-dark text-navy font-bold text-xl sm:text-2xl lg:text-3xl px-6 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-xl shadow-cyan/30 transition-colors duration-200 touch-manipulation"
    >
      {children}
    </motion.a>
  )
}

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef, { threshold: 0.3, stagger: 150 })

  return (
    <section ref={sectionRef} id="cta" className="relative py-32 bg-navy overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[600px] h-[600px] rounded-full bg-cyan/5 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ECG decoration */}
      <div className="absolute top-0 inset-x-0 h-px overflow-hidden">
        <svg className="w-full" viewBox="0 0 1440 4" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="1440" y2="2" stroke="#0EA5C0" strokeWidth="0.5" opacity="0.3"
            strokeDasharray="8 4" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-3xl p-8 lg:p-14 shadow-2xl shadow-navy"
        >

          {/* Pulse icon */}
          <div className="reveal flex justify-center mb-8">
            <div className="relative w-20 h-20">
              <div className="map-pulse-ring absolute inset-0 rounded-full bg-cyan/20" />
              <div className="map-pulse-ring absolute inset-0 rounded-full bg-cyan/10" style={{ animationDelay: '0.6s' }} />
              <div className="absolute inset-0 rounded-full bg-cyan/10 flex items-center justify-center">
                <PhoneIcon size={36} className="text-cyan" />
              </div>
            </div>
          </div>

          <h2 className="reveal font-persian text-4xl sm:text-5xl text-clinical font-bold mb-4">
            رزرو نوبت
          </h2>
          <p className="reveal text-silver/60 text-lg mb-3">
            {doctor.name} — {doctor.title}
          </p>
          <p className="reveal text-silver/40 text-sm mb-10">
            تنها از طریق تماس تلفنی • {doctor.hours}
          </p>

          {/* Magnetic phone button */}
          <div className="reveal mb-8 flex justify-center">
            <MagneticButton href={`tel:${doctor.phonePlain}`}>
              <PhoneIcon size={28} className="group-hover:rotate-12 transition-transform" />
              <span dir="ltr">{doctor.phone}</span>
            </MagneticButton>
          </div>

          {/* Details row */}
          <div className="reveal flex flex-wrap justify-center gap-6 text-silver/40 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan/50" />
              پیروزی، تهران
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan/50" />
              شنبه تا چهارشنبه
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan/50" />
              ۱۶:۴۵ تا ۲۰:۰۰
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-arterial/50" />
              بیمه نیروهای مسلح
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
