'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${star} ستاره`}
          className="transition-transform hover:scale-125 active:scale-95"
        >
          <svg
            width="28" height="28" viewBox="0 0 24 24"
            fill={(hover || value) >= star ? '#0EA5C0' : 'none'}
            stroke="#0EA5C0"
            strokeWidth="1.5"
            className="transition-all duration-150"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function ReviewForm() {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim() || rating === 0) return
    setLoading(true)
    // Simulate async submission (no backend wired — can be extended)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-3xl p-8 lg:p-10"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="w-8 h-px bg-cyan" />
        <h3 className="font-persian text-xl text-clinical font-bold">ثبت نظر شما</h3>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4 py-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-cyan/15 flex items-center justify-center"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0EA5C0" strokeWidth="2" strokeLinecap="round">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </motion.div>
            <p className="text-clinical font-semibold text-lg font-persian">ممنون از نظر شما!</p>
            <p className="text-silver/60 text-sm font-persian">نظرتان ثبت شد و بعد از بررسی نمایش داده خواهد شد.</p>
            <button
              onClick={() => { setSubmitted(false); setName(''); setText(''); setRating(5) }}
              className="mt-2 text-cyan text-sm hover:text-cyan-light transition-colors"
            >
              ثبت نظر جدید
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Name */}
            <div>
              <label className="block text-silver/60 text-xs mb-1.5">نام شما</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="مثال: علی رضایی"
                className="w-full bg-navy/60 border border-silver/10 focus:border-cyan/50 rounded-xl px-4 py-3 text-silver outline-none transition-colors placeholder:text-silver/25"
      style={{ fontSize: '16px' }}  /* prevents iOS auto-zoom on focus */
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-silver/60 text-xs mb-2">امتیاز شما</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            {/* Would recommend */}
            <div className="flex items-center gap-3">
              <label className="text-silver/60 text-xs">این دکتر را توصیه می‌کنید؟</label>
              <div className="flex gap-2">
                {[{ label: 'بله', value: true }, { label: 'خیر', value: false }].map(({ label }) => (
                  <span
                    key={label}
                    className={`px-4 py-1.5 rounded-full text-xs border cursor-pointer transition-all ${
                      label === 'بله'
                        ? 'border-cyan/40 text-cyan bg-cyan/10'
                        : 'border-silver/15 text-silver/40'
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Text */}
            <div>
              <label className="block text-silver/60 text-xs mb-1.5">نظر شما</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={4}
                placeholder="تجربه خود از مراجعه به دکتر صالحی را بنویسید..."
                className="w-full bg-navy/60 border border-silver/10 focus:border-cyan/50 rounded-xl px-4 py-3 text-silver outline-none transition-colors resize-none placeholder:text-silver/25"
      style={{ fontSize: '16px' }}  /* prevents iOS auto-zoom on focus */
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading || !name.trim() || !text.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-cyan hover:bg-cyan-dark disabled:bg-cyan/30 disabled:cursor-not-allowed text-navy font-bold py-3.5 rounded-xl text-base transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  در حال ارسال...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                  </svg>
                  ثبت نظر
                </>
              )}
            </motion.button>

            <p className="text-silver/30 text-xs text-center">نظرات بعد از بررسی نمایش داده می‌شوند</p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
