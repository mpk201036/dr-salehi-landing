'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReveal } from '@/lib/hooks/useReveal'
import { testimonials } from '@/lib/content'
import ReviewForm from './ReviewForm'

const PAGE_SIZE = 6

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < count ? '#0EA5C0' : 'none'} stroke="#0EA5C0" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const [page, setPage] = useState(1)
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef, { threshold: 0.2, stagger: 120 })

  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % testimonials.length), 5000)
    return () => clearInterval(id)
  }, [])

  const totalPages = Math.ceil(testimonials.length / PAGE_SIZE)
  const paginated = testimonials.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <section ref={sectionRef} id="testimonials" className="relative py-24 bg-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-cyan" />
            <span className="text-cyan text-xs tracking-widest uppercase font-sans">Patient Trust</span>
            <span className="w-8 h-px bg-cyan" />
          </div>
          <h2 className="reveal font-persian text-4xl sm:text-5xl text-clinical font-bold mb-4">
            نظر بیماران
          </h2>
          <div className="reveal flex items-center justify-center gap-6 text-silver/50 text-sm">
            <span>۴.۹ / ۵ امتیاز</span>
            <span className="w-1 h-1 rounded-full bg-silver/30" />
            <span>{testimonials.length} نظر</span>
            <span className="w-1 h-1 rounded-full bg-silver/30" />
            <span>۹۷٪ توصیه</span>
          </div>
        </div>

        {/* Featured carousel */}
        <div className="reveal max-w-3xl mx-auto mb-10">
          <div className="glass rounded-3xl p-8 lg:p-12 relative min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="quote-mark mb-3">"</div>
                <blockquote className="text-silver/90 text-xl lg:text-2xl leading-relaxed font-light mb-8">
                  {testimonials[active].text}
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-clinical font-semibold">{testimonials[active].name}</p>
                    <div className="mt-1"><Stars count={testimonials[active].rating} /></div>
                  </div>
                  <span className="text-silver/30 text-sm font-sans">از دکترتو</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dot navigation */}
        <div className="reveal flex justify-center gap-2 mb-14 flex-wrap max-w-xs mx-auto">
          {testimonials.slice(0, 10).map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`نظر ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${
                i === active ? 'w-8 h-2 bg-cyan' : 'w-2 h-2 bg-silver/20 hover:bg-silver/40'
              }`}
            />
          ))}
          {active >= 10 && (
            <div className="w-2 h-2 rounded-full bg-cyan" />
          )}
        </div>

        {/* Paginated list */}
        <div className="space-y-3 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {paginated.map((t, i) => (
                <motion.div
                  key={(page - 1) * PAGE_SIZE + i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setActive((page - 1) * PAGE_SIZE + i)}
                  className={`glass rounded-2xl px-6 py-4 cursor-pointer flex items-start gap-5 transition-all duration-300 hover:border-cyan/25 ${
                    active === (page - 1) * PAGE_SIZE + i ? 'border-cyan/40 bg-cyan/8' : ''
                  }`}
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan/10 text-cyan text-xs flex items-center justify-center mt-0.5 font-sans">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1.5">
                      <p className="text-clinical font-semibold text-sm">{t.name}</p>
                      <Stars count={t.rating} />
                    </div>
                    <p className="text-silver/65 text-sm leading-relaxed">{t.text}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-16 flex-wrap">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-silver/60 hover:text-cyan disabled:opacity-30 transition-colors"
              aria-label="صفحه قبل"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-silver/30 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-9 h-9 rounded-full text-sm transition-all duration-200 ${
                      page === p
                        ? 'bg-cyan text-navy font-bold'
                        : 'glass text-silver/60 hover:text-cyan'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-silver/60 hover:text-cyan disabled:opacity-30 transition-colors"
              aria-label="صفحه بعد"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          </div>
        )}

        {/* Add Review */}
        <div className="max-w-2xl mx-auto">
          <ReviewForm />
        </div>

      </div>
    </section>
  )
}
