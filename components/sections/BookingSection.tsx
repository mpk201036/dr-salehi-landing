'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReveal } from '@/lib/hooks/useReveal'

const CALENDLY_URL = 'https://calendly.com/alisalehi11/30min'

// ─── Persian/Jalali calendar helpers ──────────────────────────────────────────

function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_no = [31, 28 + (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0) ? 1 : 0), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const j_d_no = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

  let jy = 0
  if (gy <= 1600) { jy = 0; gy -= 621 }
  else { jy = 979; gy -= 1600 }

  let gy2 = (gm > 2) ? gy + 1 : gy
  let g_day_no = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400)
  for (let i = 0; i < gm - 1; i++) g_day_no += g_d_no[i]
  g_day_no += gd - 1

  let j_day_no = g_day_no - 79

  let j_np = Math.floor(j_day_no / 12053)
  j_day_no %= 12053
  jy += 33 * j_np + 4 * Math.floor(j_day_no / 1461)
  j_day_no %= 1461

  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365)
    j_day_no = (j_day_no - 1) % 365
  }

  let jm = 0
  for (let i = 0; i < 11 && j_day_no >= j_d_no[i]; i++) {
    j_day_no -= j_d_no[i]
    jm++
  }
  return [jy, jm + 1, j_day_no + 1]
}

function jalaliMonthDays(jy: number, jm: number): number {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  // Month 12 (Esfand): 29 normally, 30 in leap years
  // Leap year check approximation
  const r = jy % 2820 + 474
  return ((r + 38) * 682) % 2816 < 682 ? 30 : 29
}

function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  const jy2 = jy - 979
  const jm2 = jm - 1
  let j_day_no = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor((jy2 % 33 + 3) / 4)
  for (let i = 0; i < jm2; i++) j_day_no += (i < 6) ? 31 : 30
  j_day_no += jd - 1
  const g_day_no = j_day_no + 79
  let gy = 1600 + 400 * Math.floor(g_day_no / 146097)
  let gd2 = g_day_no % 146097
  let leap = true
  if (gd2 >= 36525) {
    gd2--
    gy += 100 * Math.floor(gd2 / 36524)
    gd2 = gd2 % 36524
    if (gd2 >= 365) gd2++
    else leap = false
  }
  gy += 4 * Math.floor(gd2 / 1461)
  gd2 %= 1461
  if (gd2 >= 366) {
    leap = false
    gd2--
    gy += Math.floor(gd2 / 365)
    gd2 = gd2 % 365
  }
  const g_d_no = [31, (leap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gm = 0
  for (gm = 0; gm < g_d_no.length; gm++) {
    if (gd2 < g_d_no[gm]) break
    gd2 -= g_d_no[gm]
  }
  return [gy, gm + 1, gd2 + 1]
}

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

// Persian days of week — Shambe (Sat) is first day in Iran
const PERSIAN_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
// Jalali weekday: 0=Shanbe(Sat), 1=Yekshanbeh(Sun) ... 6=Jomeh(Fri)
// Gregorian getDay: 0=Sun, 1=Mon ... 6=Sat
// Mapping: G0(Sun)→J1, G1(Mon)→J2, G2(Tue)→J3, G3(Wed)→J4, G4(Thu)→J5, G5(Fri)→J6, G6(Sat)→J0
function gregorianDayToJalaliDay(gDay: number): number {
  return (gDay + 1) % 7
}

// Clinic is open Sat–Wed (Jalali 0–4); Thu(5) and Fri(6) are off
function isClinicDay(jalaliWeekday: number): boolean {
  return jalaliWeekday <= 4
}

function toFarsiDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

// ─── Calendar component ───────────────────────────────────────────────────────

interface CalendarDay {
  jy: number; jm: number; jd: number
  gy: number; gm: number; gd: number
  jalaliWeekday: number
  isCurrentMonth: boolean
  isPast: boolean
  isToday: boolean
}

function buildCalendarGrid(viewJy: number, viewJm: number): CalendarDay[] {
  const today = new Date()
  const [todayJy, todayJm, todayJd] = toJalali(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const daysInMonth = jalaliMonthDays(viewJy, viewJm)

  // Find what day of week the 1st falls on
  const [gy1, gm1, gd1] = jalaliToGregorian(viewJy, viewJm, 1)
  const firstDate = new Date(gy1, gm1 - 1, gd1)
  const firstJalaliWeekday = gregorianDayToJalaliDay(firstDate.getDay())

  const days: CalendarDay[] = []

  // Pad from previous month
  if (firstJalaliWeekday > 0) {
    const prevJm = viewJm === 1 ? 12 : viewJm - 1
    const prevJy = viewJm === 1 ? viewJy - 1 : viewJy
    const prevDays = jalaliMonthDays(prevJy, prevJm)
    for (let i = firstJalaliWeekday - 1; i >= 0; i--) {
      const jd = prevDays - i
      const [gy, gm, gd] = jalaliToGregorian(prevJy, prevJm, jd)
      const d = new Date(gy, gm - 1, gd)
      const jwd = gregorianDayToJalaliDay(d.getDay())
      const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      days.push({ jy: prevJy, jm: prevJm, jd, gy, gm, gd, jalaliWeekday: jwd, isCurrentMonth: false, isPast, isToday: false })
    }
  }

  // Current month
  for (let jd = 1; jd <= daysInMonth; jd++) {
    const [gy, gm, gd] = jalaliToGregorian(viewJy, viewJm, jd)
    const d = new Date(gy, gm - 1, gd)
    const jwd = gregorianDayToJalaliDay(d.getDay())
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const isPast = d < todayDate
    const isToday = viewJy === todayJy && viewJm === todayJm && jd === todayJd
    days.push({ jy: viewJy, jm: viewJm, jd, gy, gm, gd, jalaliWeekday: jwd, isCurrentMonth: true, isPast, isToday })
  }

  // Pad to complete last row
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    const nextJm = viewJm === 12 ? 1 : viewJm + 1
    const nextJy = viewJm === 12 ? viewJy + 1 : viewJy
    for (let jd = 1; jd <= remaining; jd++) {
      const [gy, gm, gd] = jalaliToGregorian(nextJy, nextJm, jd)
      const d = new Date(gy, gm - 1, gd)
      const jwd = gregorianDayToJalaliDay(d.getDay())
      const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      days.push({ jy: nextJy, jm: nextJm, jd, gy, gm, gd, jalaliWeekday: jwd, isCurrentMonth: false, isPast, isToday: false })
    }
  }

  return days
}

// ─── Time slots ───────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  '۱۵:۳۰', '۱۵:۵۰', '۱۶:۱۰', '۱۶:۳۰',
  '۱۶:۵۰', '۱۷:۱۰', '۱۷:۳۰', '۱۷:۵۰',
  '۱۸:۱۰', '۱۸:۳۰', '۱۸:۵۰',
]

const PERSIAN_WEEKDAY_FULL = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']

// ─── Calendly popup launcher ──────────────────────────────────────────────────

function openCalendlyPopup(selectedDate?: { gy: number; gm: number; gd: number }) {
  // Build the Calendly URL with date pre-fill if a date was selected
  let url = CALENDLY_URL

  // Calendly supports ?month=YYYY-MM to pre-select the month in popup
  if (selectedDate) {
    const month = String(selectedDate.gm).padStart(2, '0')
    const day = String(selectedDate.gd).padStart(2, '0')
    url += `?month=${selectedDate.gy}-${month}&date=${selectedDate.gy}-${month}-${day}`
  }

  // Open Calendly as a popup window — not email, not inline
  const width = Math.min(900, window.innerWidth - 40)
  const height = Math.min(800, window.innerHeight - 60)
  const left = window.innerWidth / 2 - width / 2
  const top = window.innerHeight / 2 - height / 2

  const popup = window.open(
    url,
    'calendly-booking',
    `width=${width},height=${height},left=${left},top=${top},toolbar=0,scrollbars=1,status=0,resizable=1`
  )

  if (!popup) {
    // Fallback: open in new tab if popup blocked
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BookingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef, { threshold: 0.1, stagger: 120 })

  const today = new Date()
  const [todayJy, todayJm] = toJalali(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const [viewJy, setViewJy] = useState(todayJy)
  const [viewJm, setViewJm] = useState(todayJm)
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [step, setStep] = useState<'date' | 'time' | 'confirm'>('date')

  const days = buildCalendarGrid(viewJy, viewJm)

  const prevMonth = () => {
    if (viewJm === 1) { setViewJy(y => y - 1); setViewJm(12) }
    else setViewJm(m => m - 1)
    setSelectedDay(null); setSelectedTime(null); setStep('date')
  }

  const nextMonth = () => {
    if (viewJm === 12) { setViewJy(y => y + 1); setViewJm(1) }
    else setViewJm(m => m + 1)
    setSelectedDay(null); setSelectedTime(null); setStep('date')
  }

  const handleDayClick = (day: CalendarDay) => {
    if (day.isPast || !isClinicDay(day.jalaliWeekday)) return
    setSelectedDay(day)
    setSelectedTime(null)
    setStep('time')
  }

  const handleTimeClick = (t: string) => {
    setSelectedTime(t)
    setStep('confirm')
  }

  const handleConfirm = () => {
    if (!selectedDay) return
    openCalendlyPopup({ gy: selectedDay.gy, gm: selectedDay.gm, gd: selectedDay.gd })
  }

  const handleBack = () => {
    if (step === 'confirm') { setStep('time'); setSelectedTime(null) }
    else if (step === 'time') { setStep('date'); setSelectedDay(null) }
  }

  // Is prev-month button disabled? Don't go before current month
  const isAtCurrentMonth = viewJy === todayJy && viewJm === todayJm

  return (
    <section ref={sectionRef} id="booking" className="relative py-24 bg-navy overflow-hidden" dir="rtl">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="reveal flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-cyan" />
            <span className="text-cyan text-xs tracking-widest font-persian">رزرو آنلاین</span>
            <span className="w-8 h-px bg-cyan" />
          </div>
          <h2 className="reveal font-persian text-4xl sm:text-5xl text-clinical font-bold mb-4">
            رزرو نوبت آنلاین
          </h2>
          <p className="reveal text-silver/50 text-base max-w-md mx-auto leading-relaxed font-persian">
            روز و ساعت مناسب خود را انتخاب کنید
          </p>
        </div>

        {/* Calendar card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-3xl overflow-hidden shadow-2xl shadow-navy"
        >
          {/* Step tabs */}
          <div className="flex border-b border-white/5">
            {(['date', 'time', 'confirm'] as const).map((s, i) => {
              const labels = ['انتخاب روز', 'انتخاب ساعت', 'تأیید نهایی']
              const isActive = step === s
              const isDone = (step === 'time' && i === 0) || (step === 'confirm' && i < 2)
              return (
                <div key={s} className={`flex-1 py-3 text-center text-xs font-persian transition-colors duration-300 ${
                  isActive ? 'text-cyan border-b-2 border-cyan' :
                  isDone ? 'text-silver/50' : 'text-silver/20'
                }`}>
                  <span className={`inline-flex items-center gap-1.5`}>
                    <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                      isActive ? 'bg-cyan text-navy font-bold' :
                      isDone ? 'bg-silver/20 text-silver/60' : 'bg-white/5 text-silver/20'
                    }`}>{toFarsiDigits(i + 1)}</span>
                    {labels[i]}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="p-5 sm:p-8">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Date picker ── */}
              {step === 'date' && (
                <motion.div
                  key="date"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Month nav */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={nextMonth}
                      className="w-9 h-9 rounded-full glass flex items-center justify-center text-silver/60 hover:text-cyan hover:border-cyan/30 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <h3 className="font-persian text-lg font-bold text-clinical">
                      {JALALI_MONTHS[viewJm - 1]} {toFarsiDigits(viewJy)}
                    </h3>
                    <button
                      onClick={prevMonth}
                      disabled={isAtCurrentMonth}
                      className="w-9 h-9 rounded-full glass flex items-center justify-center text-silver/60 hover:text-cyan hover:border-cyan/30 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {PERSIAN_WEEKDAYS.map((wd, i) => (
                      <div key={i} className={`text-center text-xs py-1 font-persian ${i >= 5 ? 'text-arterial/60' : 'text-silver/30'}`}>
                        {wd}
                      </div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, i) => {
                      const isOff = !isClinicDay(day.jalaliWeekday)
                      const isDisabled = day.isPast || isOff || !day.isCurrentMonth
                      const isSelected = selectedDay?.jd === day.jd && selectedDay?.jm === day.jm && selectedDay?.jy === day.jy

                      return (
                        <button
                          key={i}
                          onClick={() => handleDayClick(day)}
                          disabled={isDisabled}
                          className={`
                            relative h-10 w-full rounded-xl text-xs font-persian font-medium transition-all duration-200
                            ${!day.isCurrentMonth ? 'opacity-20' : ''}
                            ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-cyan/15 hover:text-cyan active:scale-95'}
                            ${day.isToday && !isSelected ? 'border border-cyan/40 text-cyan' : ''}
                            ${isSelected ? 'bg-cyan text-navy font-bold shadow-lg shadow-cyan/30' : ''}
                            ${isOff && day.isCurrentMonth ? 'text-arterial/40' : 'text-silver/70'}
                          `}
                        >
                          {toFarsiDigits(day.jd)}
                          {day.isToday && !isSelected && (
                            <span className="absolute bottom-1 right-1/2 translate-x-1/2 w-1 h-1 rounded-full bg-cyan" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-5 mt-5 text-xs font-persian text-silver/30">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-cyan/20 border border-cyan/40" />
                      امروز
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-arterial/20" />
                      تعطیل
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-cyan" />
                      انتخاب‌شده
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Time picker ── */}
              {step === 'time' && selectedDay && (
                <motion.div
                  key="time"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleBack} className="w-8 h-8 rounded-full glass flex items-center justify-center text-silver/50 hover:text-cyan transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <div>
                      <p className="text-silver/40 text-xs font-persian">روز انتخابی</p>
                      <p className="text-clinical font-persian font-bold">
                        {PERSIAN_WEEKDAY_FULL[selectedDay.jalaliWeekday]}، {toFarsiDigits(selectedDay.jd)} {JALALI_MONTHS[selectedDay.jm - 1]} {toFarsiDigits(selectedDay.jy)}
                      </p>
                    </div>
                  </div>

                  <p className="text-silver/40 text-xs font-persian mb-4">ساعت مراجعه (۱۵:۳۰ تا ۱۹:۰۰)</p>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => handleTimeClick(t)}
                        className={`
                          h-11 rounded-xl text-sm font-persian font-medium transition-all duration-200
                          glass hover:bg-cyan/15 hover:text-cyan active:scale-95
                          ${selectedTime === t ? 'bg-cyan text-navy font-bold shadow-lg shadow-cyan/30' : 'text-silver/70'}
                        `}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <p className="text-silver/25 text-xs font-persian mt-5 text-center">
                    زمان دقیق نهایی در سیستم Calendly تأیید می‌شود
                  </p>
                </motion.div>
              )}

              {/* ── STEP 3: Confirm ── */}
              {step === 'confirm' && selectedDay && selectedTime && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center"
                >
                  {/* Summary card */}
                  <div className="w-full max-w-sm glass rounded-2xl p-6 mb-8 space-y-4">
                    <p className="text-cyan text-xs tracking-widest font-persian text-center mb-2">خلاصه رزرو</p>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan/10 flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0EA5C0" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-silver/40 text-xs font-persian">تاریخ</p>
                        <p className="text-clinical font-persian font-semibold text-sm">
                          {PERSIAN_WEEKDAY_FULL[selectedDay.jalaliWeekday]}، {toFarsiDigits(selectedDay.jd)} {JALALI_MONTHS[selectedDay.jm - 1]} {toFarsiDigits(selectedDay.jy)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan/10 flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0EA5C0" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-silver/40 text-xs font-persian">ساعت</p>
                        <p className="text-clinical font-persian font-semibold text-sm">{selectedTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan/10 flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0EA5C0" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-silver/40 text-xs font-persian">مکان</p>
                        <p className="text-clinical font-persian font-semibold text-sm">پیروزی، تهران</p>
                      </div>
                    </div>
                  </div>

                  {/* Confirm button */}
                  <motion.button
                    onClick={handleConfirm}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    className="w-full max-w-sm bg-cyan hover:bg-cyan-dark text-navy font-bold text-base font-persian py-4 rounded-2xl shadow-xl shadow-cyan/30 transition-colors duration-200 flex items-center justify-center gap-3"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    تأیید و ادامه رزرو
                  </motion.button>

                  <button onClick={handleBack} className="mt-4 text-silver/30 hover:text-silver/60 text-sm font-persian transition-colors">
                    بازگشت
                  </button>

                  <p className="text-silver/20 text-xs font-persian mt-6 text-center leading-relaxed max-w-xs">
                    پس از کلیک، پنجره Calendly باز می‌شود. لطفاً اطلاعات خود را در آنجا تکمیل کنید.
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

        {/* Info pills */}
        <div className="reveal flex flex-wrap justify-center gap-6 text-silver/30 text-xs mt-8 font-persian">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan/50" />
            شنبه تا چهارشنبه
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan/50" />
            ۱۵:۳۰ تا ۱۹:۰۰
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan/50" />
            پیروزی، تهران
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
    </section>
  )
}
