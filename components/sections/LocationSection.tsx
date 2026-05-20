'use client'

import { useRef } from 'react'
import { doctor } from '@/lib/content'
import { useReveal } from '@/lib/hooks/useReveal'
import PhoneIcon from '@/components/ui/PhoneIcon'

export default function LocationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef, { threshold: 0.2, stagger: 120 })

  return (
    <section ref={sectionRef} id="location" className="relative py-24 bg-navy overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Info */}
          <div>
            <div className="reveal flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-cyan" />
              <span className="text-cyan text-xs tracking-widest uppercase font-sans">Location</span>
            </div>
            <h2 className="reveal font-persian text-4xl sm:text-5xl text-clinical font-bold mb-8">
              آدرس مطب
            </h2>

            <div className="reveal glass rounded-2xl p-6 mb-6 space-y-5">
              <InfoRow icon="📍" label="آدرس" value={doctor.address} />
              <InfoRow icon="🕐" label="ساعات کاری" value={doctor.hours} />
              <InfoRow icon="📞" label="تماس" value={doctor.phone} phonePlain={doctor.phonePlain} />
              <InfoRow icon="🏥" label="بیمه" value={doctor.insurance} />
              <InfoRow icon="📋" label="رزرو نوبت" value={doctor.booking} />
            </div>

            <div className="reveal flex flex-wrap gap-3">
              <a
                href={`tel:${doctor.phonePlain}`}
                className="flex items-center gap-2 bg-cyan hover:bg-cyan-dark text-navy font-bold px-6 py-3 rounded-full text-sm transition-all duration-300 hover:scale-105"
              >
                <PhoneIcon size={16} />
                تماس تلفنی
              </a>
              <a
                href="https://neshan.org/maps/@35.69286378678149,51.48707691770935,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-silver/20 hover:border-cyan text-silver hover:text-cyan px-6 py-3 rounded-full text-sm transition-all duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                مسیریابی در نشان
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="reveal relative">
            <div className="glass rounded-2xl lg:rounded-3xl overflow-hidden h-64 sm:h-80 lg:h-96 relative">
              <iframe
                src="https://maps.neshan.org/embed?type=standard&zoom=17&center=35.69286378678149,51.48707691770935&markerlat=35.69286378678149&markerlng=51.48707691770935&lang=fa"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="موقعیت مطب دکتر علی صالحی — پیروزی، تهران"
              />
              <div className="absolute bottom-4 right-4 glass rounded-xl p-3 shadow-lg pointer-events-none">
                <p className="text-clinical text-sm font-semibold">{doctor.name}</p>
                <p className="text-silver/50 text-xs">پیروزی، تهران</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoRow({
  icon, label, value, phonePlain,
}: {
  icon: string
  label: string
  value: string
  phonePlain?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg mt-0.5">{icon}</span>
      <div className="flex-1">
        <p className="text-silver/40 text-xs mb-0.5">{label}</p>
        {phonePlain ? (
          <a
            href={`tel:${phonePlain}`}
            className="text-cyan font-medium text-sm hover:text-cyan-light transition-colors"
            dir="ltr"
          >
            {value}
          </a>
        ) : (
          <p className="text-silver text-sm leading-relaxed">{value}</p>
        )}
      </div>
    </div>
  )
}
