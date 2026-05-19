'use client'

import { useRef } from 'react'
import { useReveal } from '@/lib/hooks/useReveal'

export default function InsuranceSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef, { threshold: 0.2, stagger: 120 })

  return (
    <section ref={sectionRef} id="insurance" className="relative py-20 bg-navy border-y border-silver/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* Text */}
          <div className="flex-1">
            <div className="reveal flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-cyan" />
              <span className="text-cyan text-xs tracking-widest uppercase font-sans">Insurance</span>
            </div>
            <h2 className="reveal font-persian text-3xl sm:text-4xl text-clinical font-bold mb-4">
              بیمه پذیرفته‌شده
            </h2>
            <p className="reveal text-silver/60 text-base leading-relaxed max-w-md">
              این مطب بیمه نیروهای مسلح را می‌پذیرد. برای اطلاعات بیشتر درباره پوشش بیمه‌ای خود، با مطب تماس بگیرید.
            </p>
          </div>

          {/* Insurance card */}
          <div className="reveal flex-1 flex justify-center">
            <div className="glass rounded-3xl p-8 flex flex-col items-center gap-6 w-full max-w-sm hover:border-cyan/30 transition-all duration-500 group">
              {/* Shield icon with pulse rings */}
              <div className="relative flex items-center justify-center w-24 h-24">
                <div className="map-pulse-ring absolute inset-0 rounded-full bg-cyan/15" />
                <div className="map-pulse-ring absolute inset-0 rounded-full bg-cyan/10" style={{ animationDelay: '0.7s' }} />
                <div className="w-20 h-20 rounded-full bg-cyan/10 flex items-center justify-center relative z-10">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0EA5C0" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <p className="text-clinical font-bold text-xl mb-1">بیمه نیروهای مسلح</p>
                <p className="text-silver/50 text-sm font-display italic">Armed Forces Insurance</p>
              </div>

              <div className="w-full border-t border-silver/10 pt-6">
                <p className="text-silver/40 text-xs text-center leading-relaxed">
                  برای تأیید پوشش بیمه‌ای خود قبل از مراجعه، با مطب تماس بگیرید
                </p>
              </div>

              {/* ECG line decoration */}
              <svg className="w-full h-8 opacity-20" viewBox="0 0 300 32" preserveAspectRatio="none">
                <path d="M0 16 H80 L95 4 L110 28 L125 10 L140 22 L155 16 H300"
                  stroke="#0EA5C0" strokeWidth="1.5" fill="none"
                  strokeDasharray="400" strokeDashoffset="400"
                  className="ecg-line"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
