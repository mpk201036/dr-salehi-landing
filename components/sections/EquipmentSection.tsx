'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useReveal } from '@/lib/hooks/useReveal'

// Landscape 1672×941: Clinic-1, Clinic-4
// Portrait  1086×1448: Clinic-2, Clinic-3, Clinic-5
const clinicImages = [
  { src: '/clinic/Clinic-4.webp', label: 'پذیرش و سالن انتظار', en: 'Reception & Waiting Area', w: 1672, h: 941 },
  { src: '/clinic/Clinic-5.webp', label: 'دستگاه اکوکاردیوگرافی', en: 'Echocardiography Unit', w: 1086, h: 1448 },
  { src: '/clinic/Clinic-3.webp', label: 'نمای مطب', en: 'Clinic Exterior', w: 1086, h: 1448 },
  { src: '/clinic/Clinic-1.webp', label: 'اتاق نوار قلب (ECG)', en: 'ECG Room', w: 1672, h: 941 },
  { src: '/clinic/Clinic-2.webp', label: 'نمای ساختمان', en: 'Building Exterior', w: 1086, h: 1448 },
]

export default function EquipmentSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)
  useReveal(sectionRef, { threshold: 0.1, stagger: 100 })

  return (
    <section ref={sectionRef} id="equipment" className="relative py-24 bg-navy overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-16">
          <div className="reveal flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-cyan" />
            <span className="text-cyan text-xs tracking-widest uppercase font-sans">Clinic & Equipment</span>
          </div>
          <h2 className="reveal font-persian text-4xl sm:text-5xl text-clinical font-bold mb-4">
            مطب و تجهیزات
          </h2>
          <p className="reveal text-silver/50 text-base max-w-xl">
            محیطی آرام با تجهیزات تشخیصی مدرن برای بهترین مراقبت از بیماران
          </p>
        </div>

        {/*
          Mobile:  single column stack — each image full width at natural ratio
          Tablet+: 3-column masonry layout
            Row 1: landscape (col-span-2) + portrait (col-span-1)
            Row 2: portrait + portrait + landscape (col-span-2) — with last portrait centered
        */}

        {/* Mobile layout — single column */}
        <div className="flex flex-col gap-4 sm:hidden">
          {clinicImages.map((img, i) => (
            <GalleryCard key={img.src} img={img} index={i} colSpan="col-span-1" onOpen={setLightbox} />
          ))}
        </div>

        {/* Tablet+ layout — 3-column grid */}
        <div className="hidden sm:grid grid-cols-3 gap-4">
          <GalleryCard img={clinicImages[0]} index={0} colSpan="col-span-2" onOpen={setLightbox} />
          <GalleryCard img={clinicImages[1]} index={1} colSpan="col-span-1" onOpen={setLightbox} />
          <GalleryCard img={clinicImages[2]} index={2} colSpan="col-span-1" onOpen={setLightbox} />
          <GalleryCard img={clinicImages[3]} index={3} colSpan="col-span-2" onOpen={setLightbox} />
          <div className="col-span-3 flex justify-center">
            <div className="w-1/3">
              <GalleryCard img={clinicImages[4]} index={4} colSpan="col-span-1" onOpen={setLightbox} />
            </div>
          </div>
        </div>

        {/* Feature chips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {[
            { icon: '🔬', text: 'دستگاه اکوکاردیوگرافی پیشرفته' },
            { icon: '🏥', text: 'محیط بالینی آرام و تمیز' },
            { icon: '📋', text: 'ثبت دقیق سوابق بیمار' },
            { icon: '🩺', text: 'معاینه دقیق و مشاوره کامل' },
          ].map((item) => (
            <div key={item.text} className="reveal glass rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-silver/70 text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/95 backdrop-blur-xl p-3 sm:p-6"
            style={{ paddingTop: 'env(safe-area-inset-top, 12px)', paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={clinicImages[lightbox].src}
                alt={clinicImages[lightbox].label}
                width={clinicImages[lightbox].w}
                height={clinicImages[lightbox].h}
                className="w-full h-auto max-h-[80svh] object-contain rounded-xl sm:rounded-2xl"
                priority
              />
              <div className="absolute bottom-3 right-3 glass rounded-lg px-3 py-1.5">
                <p className="text-silver/90 text-xs sm:text-sm">{clinicImages[lightbox].label}</p>
              </div>
              {/* Close — top-right, large tap target */}
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-2 left-2 w-11 h-11 glass rounded-full flex items-center justify-center text-silver active:text-cyan touch-manipulation"
                aria-label="بستن"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
              {/* Prev */}
              <button
                onClick={() => setLightbox((lightbox - 1 + clinicImages.length) % clinicImages.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 glass rounded-full flex items-center justify-center text-silver active:text-cyan touch-manipulation"
                aria-label="قبلی"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
              {/* Next */}
              <button
                onClick={() => setLightbox((lightbox + 1) % clinicImages.length)}
                className="absolute left-14 top-1/2 -translate-y-1/2 w-11 h-11 glass rounded-full flex items-center justify-center text-silver active:text-cyan touch-manipulation"
                aria-label="بعدی"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function GalleryCard({
  img, index, colSpan, onOpen,
}: {
  img: typeof clinicImages[0]
  index: number
  colSpan: string
  onOpen: (i: number) => void
}) {
  const aspectRatio = img.h / img.w

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.015 }}
      className={`${colSpan} relative rounded-2xl overflow-hidden cursor-zoom-in group`}
      style={{ paddingBottom: `${aspectRatio * 100}%` }}
      onClick={() => onOpen(index)}
    >
      <Image
        src={img.src}
        alt={img.label}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      {/* subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      {/* scan line on hover */}
      <div className="scan-line opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="glass text-silver/90 text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
          </svg>
          {img.label}
        </div>
      </div>
    </motion.div>
  )
}
