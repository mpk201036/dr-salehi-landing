'use client'

import { useRef, useState } from 'react'
import { faqItems } from '@/lib/content'
import { useReveal } from '@/lib/hooks/useReveal'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef, { threshold: 0.1, stagger: 80 })

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section ref={sectionRef} id="faq" className="relative py-24 bg-navy-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <div className="reveal flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-cyan" />
            <span className="text-cyan text-xs tracking-widest uppercase font-sans">FAQ</span>
            <span className="w-8 h-px bg-cyan" />
          </div>
          <h2 className="reveal font-persian text-4xl sm:text-5xl text-clinical font-bold">
            سؤالات متداول
          </h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="reveal glass rounded-2xl overflow-hidden"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-5 lg:p-6 text-right group"
              >
                <span className="text-clinical font-medium text-base group-hover:text-cyan transition-colors">
                  {item.q}
                </span>
                <div className="flex-shrink-0 mr-4 w-8 h-8 rounded-full border border-silver/20 flex items-center justify-center group-hover:border-cyan/40 transition-colors">
                  {openIndex === i ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5C0" strokeWidth="2">
                      <path d="M0 12 H6 L8 8 L10 16 L12 10 L14 14 H24" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                </div>
              </button>

              <div className={`faq-answer ${openIndex === i ? 'open' : ''}`}>
                <div className="px-5 lg:px-6 pb-5 border-t border-silver/5 pt-4">
                  <p className="text-silver/70 leading-relaxed text-sm">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
