'use client'

import { useEffect, useRef, useState } from 'react'

const navLinks = [
  { label: 'درباره دکتر', href: '#about' },
  { label: 'خدمات', href: '#services' },
  { label: 'تجهیزات', href: '#equipment' },
  { label: 'نظرات', href: '#testimonials' },
  { label: 'رزرو آنلاین', href: '#booking' },
  { label: 'مکان', href: '#location' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? 'nav-frosted' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo / Name */}
            <a href="#hero" className="flex flex-col leading-tight group">
              <span className="text-silver/60 text-xs tracking-widest uppercase font-display">
                Dr. Ali Salehi
              </span>
              <span className="text-clinical font-semibold text-base group-hover:text-cyan transition-colors duration-300">
                {doctor.name}
              </span>
            </a>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-silver/70 hover:text-cyan text-sm transition-colors duration-200 relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-px after:bg-cyan after:transition-all hover:after:w-full"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA booking — hidden on very small, visible sm+ */}
            <a
              href="#booking"
              className="hidden sm:flex items-center gap-2 bg-cyan hover:bg-cyan-dark active:bg-cyan-dark text-navy font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
            >
              <CalendarIcon />
              <span>رزرو آنلاین</span>
            </a>

            {/* Mobile menu button — morphs to ECG on open */}
            <button
              className="lg:hidden p-2 text-silver"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="منو"
            >
              {menuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                // ECG-style menu icon
                <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M0 4 H6 L8 1 L10 7 L12 3 L14 5 H24" />
                  <line x1="0" y1="12" x2="24" y2="12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-400 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-navy/95 backdrop-blur-xl"
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={`absolute inset-x-0 top-16 p-6 flex flex-col gap-6 transition-transform duration-400 ${menuOpen ? 'translate-y-0' : '-translate-y-4'}`}
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-silver text-xl border-b border-silver/10 pb-4 hover:text-cyan transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#booking"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 bg-cyan text-navy font-bold text-base px-6 py-3 rounded-full mt-2"
          >
            <CalendarIcon />
            <span>رزرو آنلاین</span>
          </a>
        </div>
      </div>
    </>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="15" x2="8" y2="15" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="15" x2="12" y2="15" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="16" y1="15" x2="16" y2="15" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
