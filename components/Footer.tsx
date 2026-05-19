import { doctor } from '@/lib/content'

export default function Footer() {
  return (
    <footer className="bg-navy-800 border-t border-silver/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">

          {/* Brand */}
          <div>
            <p className="text-cyan text-xs tracking-widest uppercase font-display mb-2">Dr. Ali Salehi</p>
            <p className="text-clinical font-semibold text-lg mb-1">{doctor.name}</p>
            <p className="text-silver/40 text-sm">{doctor.title}</p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-silver/50 text-xs tracking-widest uppercase mb-4">لینک‌های سریع</p>
            <ul className="space-y-2">
              {['#about', '#services', '#equipment', '#testimonials', '#faq', '#location'].map((href) => {
                const labels: Record<string, string> = {
                  '#about': 'درباره دکتر',
                  '#services': 'خدمات',
                  '#equipment': 'مطب',
                  '#testimonials': 'نظرات',
                  '#faq': 'سؤالات',
                  '#location': 'آدرس',
                }
                return (
                  <li key={href}>
                    <a href={href} className="text-silver/50 hover:text-cyan text-sm transition-colors">
                      {labels[href]}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-silver/50 text-xs tracking-widest uppercase mb-4">تماس</p>
            <div className="space-y-2">
              <a href={`tel:${doctor.phonePlain}`} className="flex items-center gap-2 text-silver/60 hover:text-cyan text-sm transition-colors" dir="ltr">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.36 12 19.79 19.79 0 011.3 3.41 2 2 0 013.28 1.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.62a16 16 0 006.29 6.29l1.54-1.54a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                {doctor.phone}
              </a>
              <p className="text-silver/40 text-xs leading-relaxed">{doctor.addressShort}</p>
              <p className="text-silver/40 text-xs">{doctor.hours}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-silver/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-silver/25 text-xs">
          <p>© ۱۴۰۴ دکتر علی صالحی — تمام حقوق محفوظ است</p>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-arterial/50" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <span>The Pulse of Trust</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
