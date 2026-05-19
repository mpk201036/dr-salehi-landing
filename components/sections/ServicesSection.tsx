'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useReveal } from '@/lib/hooks/useReveal'
import { services } from '@/lib/content'

// Each icon is an SVG with CSS-animation classes applied on the parent hover.
// The `animClass` is added to the SVG root when the card is hovered.
const ServiceIcons: Record<string, (active: boolean) => React.ReactElement> = {
  // Echocardiography — ultrasound waves radiating from a heart
  echo: (active) => (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <path d="M20 26 C17 23, 12 19, 12 15 C12 11.5 15.5 9 20 13 C24.5 9 28 11.5 28 15 C28 19, 23 23, 20 26Z"
        stroke="#0EA5C0" strokeWidth="1.5" fill="rgba(14,165,192,0.12)"
        style={active ? { animation: 'heartbeat 0.8s ease-in-out infinite' } : {}} />
      {[6, 10, 14].map((r, i) => (
        <circle key={r} cx="20" cy="15" r={r}
          stroke="#0EA5C0" strokeWidth="0.8" fill="none" opacity={active ? 0.5 - i * 0.12 : 0}
          style={active ? { animation: `scanRing 1.2s ease-out ${i * 0.3}s infinite` } : {}} />
      ))}
    </svg>
  ),

  // ECG — flat line then spike
  ecg: (active) => (
    <svg viewBox="0 0 40 20" fill="none" className="w-10 h-5">
      <path
        d="M0 10 H10 L13 4 L16 16 L19 8 L22 12 H30 H40"
        stroke="#0EA5C0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="60" strokeDashoffset={active ? '0' : '60'}
        style={active ? { animation: 'ecgTrace 0.6s ease-out forwards' } : {}}
      />
    </svg>
  ),

  // Stress Test — running figure + heart
  stress: (active) => (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      {/* Treadmill belt */}
      <rect x="4" y="30" width="32" height="3" rx="1.5" stroke="#0EA5C0" strokeWidth="1.2" fill="none"
        strokeDasharray={active ? '4 2' : 'none'}
        style={active ? { animation: 'flowDash 0.4s linear infinite' } : {}} />
      {/* Running figure */}
      <circle cx="22" cy="10" r="3" stroke="#0EA5C0" strokeWidth="1.4" />
      <path d="M22 13 L20 20 L16 26 M22 13 L24 20 L28 26 M20 20 L16 22 M24 20 L28 22"
        stroke="#0EA5C0" strokeWidth="1.4" strokeLinecap="round"
        style={active ? { animation: 'heartbeat 0.5s ease-in-out infinite' } : {}} />
      {/* Small ECG line */}
      <path d="M4 10 H8 L10 7 L12 13 L14 10 H18"
        stroke="#EF3838" strokeWidth="1" opacity={active ? 1 : 0.3} strokeLinecap="round" />
    </svg>
  ),

  // Holter — 24h clock with ECG band
  holter: (active) => (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <circle cx="20" cy="20" r="14" stroke="#0EA5C0" strokeWidth="1.4" />
      {/* Clock hands */}
      <line x1="20" y1="20" x2="20" y2="10" stroke="#0EA5C0" strokeWidth="1.8" strokeLinecap="round"
        style={active ? { transformOrigin: '20px 20px', animation: 'clockHand 4s linear infinite' } : {}} />
      <line x1="20" y1="20" x2="27" y2="20" stroke="#0EA5C0" strokeWidth="1.4" strokeLinecap="round" />
      {/* "24h" label */}
      <text x="20" y="33" textAnchor="middle" fontSize="5" fill="#0EA5C0" fontFamily="sans-serif">24h</text>
      {/* ECG mini */}
      <path d="M10 22 H13 L14.5 19 L16 25 L17.5 21 H20"
        stroke="#EF3838" strokeWidth="1" strokeLinecap="round"
        strokeDasharray="20" strokeDashoffset={active ? '0' : '20'}
        style={active ? { animation: 'ecgTrace 0.8s ease-out forwards' } : {}} />
    </svg>
  ),

  // Angiography — coronary artery tree
  angio: (active) => (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <path d="M20 6 C20 6, 20 15, 20 20 C20 20, 13 25, 10 32 M20 20 C20 20, 27 25, 30 32"
        stroke="#0EA5C0" strokeWidth="1.8" strokeLinecap="round"
        strokeDasharray="50" strokeDashoffset={active ? '0' : '50'}
        style={active ? { animation: 'flowDash 0.8s ease-out forwards' } : {}} />
      {/* Flow particles */}
      {active && [0, 0.3, 0.6].map((delay, i) => (
        <circle key={i} r="1.5" fill="#EF3838" opacity="0.7">
          <animateMotion dur="1.2s" repeatCount="indefinite" begin={`${delay}s`}
            path="M20 6 C20 6, 20 15, 20 20 C20 20, 13 25, 10 32" />
        </circle>
      ))}
    </svg>
  ),

  // Renal Angiography — kidney shape with vessel
  'renal-angio': (active) => (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      {/* Kidney outline */}
      <path d="M15 8 C8 8, 6 14, 6 20 C6 28, 10 34, 16 34 C20 34, 20 30, 20 26 C20 22, 22 20, 24 20 C28 20, 34 17, 34 12 C34 8, 30 6, 26 6 C22 6, 20 10, 20 14 C20 18, 18 20, 16 20 C12 20, 10 16, 12 12 C13 10, 14 8, 15 8Z"
        stroke="#0EA5C0" strokeWidth="1.3" fill="rgba(14,165,192,0.08)"
        style={active ? { animation: 'shieldPulse 1s ease-in-out infinite' } : {}} />
      {/* Vessel line */}
      <path d="M20 14 C20 14, 22 17, 22 20" stroke="#EF3838" strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray="10" strokeDashoffset={active ? '0' : '10'}
        style={active ? { animation: 'ecgTrace 0.5s ease-out forwards' } : {}} />
    </svg>
  ),

  // Chest Pain Assessment — chest with ripple waves
  'chest-pain': (active) => (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      {/* Chest silhouette */}
      <path d="M10 12 L10 28 Q10 32 14 32 L26 32 Q30 32 30 28 L30 12 Q26 8 20 8 Q14 8 10 12Z"
        stroke="#0EA5C0" strokeWidth="1.3" fill="rgba(14,165,192,0.06)" />
      {/* Pain ripple rings */}
      {[4, 7, 10].map((r, i) => (
        <circle key={r} cx="20" cy="20" r={r}
          stroke="#EF3838" strokeWidth="0.8" fill="none"
          opacity={active ? 0.7 : 0}
          style={active ? { animation: `chestRipple 1.5s ease-out ${i * 0.4}s infinite` } : {}} />
      ))}
      <circle cx="20" cy="20" r="2" fill="#EF3838" opacity={active ? 1 : 0.3} />
    </svg>
  ),

  // Palpitations — irregular ECG trace with bold spike
  palpitation: (active) => (
    <svg viewBox="0 0 40 20" fill="none" className="w-10 h-5">
      <path d="M0 10 H6 L9 10 L11 5 L13 15 L15 2 L17 18 L19 10 H26 L28 8 L30 12 H40"
        stroke="#0EA5C0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="80" strokeDashoffset={active ? '0' : '80'}
        style={active ? { animation: 'ecgTrace 0.7s ease-out forwards' } : {}} />
      <path d="M15 2 L17 18" stroke="#EF3838" strokeWidth="2.5" strokeLinecap="round" opacity={active ? 1 : 0.4} />
    </svg>
  ),

  // Heart Failure — heart with downward arrow (weakening pump)
  'heart-failure': (active) => (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <path d="M20 30 C17 27, 8 21, 8 14 C8 9.5 12 7 20 12 C28 7 32 9.5 32 14 C32 21, 23 27, 20 30Z"
        stroke="#0EA5C0" strokeWidth="1.4" fill="rgba(14,165,192,0.1)"
        style={active ? { animation: 'heartbeat 1.2s ease-in-out infinite' } : {}} />
      {/* Downward arrow = reduced output */}
      <path d="M20 16 L20 26 M17 23 L20 26 L23 23"
        stroke="#EF3838" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        opacity={active ? 1 : 0.3} />
    </svg>
  ),

  // Hypercholesterolemia — blood vessel with lipid deposit
  hypercholesterol: (active) => (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      {/* Vessel tube */}
      <rect x="6" y="15" width="28" height="10" rx="5" stroke="#0EA5C0" strokeWidth="1.4" fill="rgba(14,165,192,0.06)" />
      {/* Lipid plaque buildup */}
      <ellipse cx="20" cy="20" rx="6" ry="3.5" fill="#EF3838" opacity={active ? 0.6 : 0.2}
        style={active ? { animation: 'lipidFloat 1.5s ease-in-out infinite' } : {}} />
      {/* Blood flow arrows */}
      <path d="M8 20 L12 20 M28 20 L32 20"
        stroke="#0EA5C0" strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray="4" strokeDashoffset={active ? '0' : '8'}
        style={active ? { animation: 'flowDash 0.6s linear infinite' } : {}} />
    </svg>
  ),

  // Diabetes in Heart Patients — glucose meter + heart
  'diabetes-heart': (active) => (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      {/* Glucose meter body */}
      <rect x="8" y="10" width="16" height="22" rx="3" stroke="#0EA5C0" strokeWidth="1.3" fill="rgba(14,165,192,0.06)" />
      <rect x="11" y="14" width="10" height="5" rx="1" stroke="#0EA5C0" strokeWidth="0.8" fill="none" />
      {/* Glucose reading line */}
      <path d="M11 19 H14 L15.5 17 L17 21 H21"
        stroke="#EF3838" strokeWidth="1" strokeLinecap="round"
        strokeDasharray="20" strokeDashoffset={active ? '0' : '20'}
        style={active ? { animation: 'glucoseLine 0.6s ease-out forwards' } : {}} />
      {/* Small heart on meter */}
      <path d="M30 12 C29 10.5, 27 11, 27 13 C27 15, 30 17, 30 17 C30 17, 33 15, 33 13 C33 11, 31 10.5, 30 12Z"
        stroke="#0EA5C0" strokeWidth="1" fill="none"
        style={active ? { animation: 'heartbeat 0.8s ease-in-out infinite' } : {}} />
    </svg>
  ),

  // Preoperative Consultation — clipboard with checkmarks + anesthesia mask
  preop: (active) => (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      {/* Clipboard */}
      <rect x="8" y="8" width="20" height="26" rx="2" stroke="#0EA5C0" strokeWidth="1.3" fill="rgba(14,165,192,0.06)" />
      <rect x="13" y="5" width="10" height="5" rx="2" stroke="#0EA5C0" strokeWidth="1.2" fill="#0D1B2A" />
      {/* Checklist lines */}
      {[15, 20, 25].map((y, i) => (
        <g key={y}>
          <path d={`M12 ${y} L14 ${y + 2} L17 ${y - 1}`}
            stroke="#0EA5C0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
            opacity={active ? 1 : 0.3}
            strokeDasharray="10" strokeDashoffset={active ? '0' : '10'}
            style={active ? { animation: `clipWrite 0.4s ease-out ${i * 0.2}s forwards` } : {}} />
          <line x1="19" y1={y + 0.5} x2="26" y2={y + 0.5} stroke="#0EA5C0" strokeWidth="0.8" opacity="0.4" />
        </g>
      ))}
      {/* Anesthesia mask hint */}
      <path d="M30 16 C34 16, 36 20, 36 24 C36 28, 34 30, 30 30"
        stroke="#silver" strokeWidth="1.2" strokeLinecap="round" opacity={active ? 0.5 : 0.15} />
    </svg>
  ),
}

export default function ServicesSection() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef, { threshold: 0.1, stagger: 60 })

  return (
    <section ref={sectionRef} id="services" className="relative py-24 bg-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <div className="reveal flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-cyan" />
            <span className="text-cyan text-xs tracking-widest uppercase font-sans">Services</span>
            <span className="w-8 h-px bg-cyan" />
          </div>
          <h2 className="reveal font-persian text-4xl sm:text-5xl text-clinical font-bold mb-4">
            خدمات تخصصی
          </h2>
          <p className="reveal text-silver/50 text-base max-w-xl mx-auto">
            ارزیابی و درمان جامع بیماری‌های قلبی‌عروقی با تجهیزات مدرن
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((service, i) => {
            const isActive = activeId === service.id
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className={`service-card relative glass rounded-2xl p-5 cursor-pointer group transition-colors duration-300 hover:bg-cyan/10 hover:border-cyan/30 touch-manipulation ${isActive ? 'bg-cyan/10 border-cyan/30' : ''}`}
                onMouseEnter={() => setActiveId(service.id)}
                onMouseLeave={() => setActiveId(null)}
                onTouchStart={() => setActiveId(isActive ? null : service.id)}
              >
                {/* Animated icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  isActive ? 'bg-cyan/15 scale-110' : 'bg-cyan/8'
                }`}>
                  {ServiceIcons[service.id]?.(isActive)}
                </div>

                <h3 className="text-clinical font-semibold text-base mb-0.5 group-hover:text-cyan transition-colors">
                  {service.fa}
                </h3>
                <p className="text-silver/35 text-xs font-sans italic mb-3">
                  {service.en}
                </p>

                {/* Always visible on mobile; hover-reveal on desktop */}
                <p className={`text-silver/65 text-sm leading-relaxed transition-all duration-300 overflow-hidden sm:hidden`}>
                  {service.desc}
                </p>
                <p className={`text-silver/65 text-sm leading-relaxed transition-all duration-300 overflow-hidden hidden sm:block ${
                  isActive ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0'
                }`}>
                  {service.desc}
                </p>

                {isActive && (
                  <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-arterial pulse-dot" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
