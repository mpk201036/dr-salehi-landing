'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const CalendarDay: React.FC<{ day: number | string; isHeader?: boolean; isToday?: boolean }> = ({
  day,
  isHeader,
  isToday,
}) => {
  const highlight = !isHeader && isToday

  return (
    <div
      className={`col-span-1 row-span-1 flex h-8 w-8 items-center justify-center ${
        isHeader ? '' : 'rounded-xl'
      } ${highlight ? 'bg-cyan text-navy' : 'text-silver/50'}`}
    >
      <span className={`font-medium ${isHeader ? 'text-xs text-silver/30' : 'text-sm'}`}>
        {day}
      </span>
    </div>
  )
}

export function Calendar() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' })
  const currentYear = currentDate.getFullYear()
  const today = currentDate.getDate()
  const firstDayOfWeek = new Date(currentYear, currentDate.getMonth(), 1).getDay()
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate()

  const bookingLink = 'https://calendly.com/alisalehi11/30min'

  const renderCalendarDays = () => {
    return [
      ...dayNames.map((day) => (
        <CalendarDay key={`header-${day}`} day={day} isHeader />
      )),
      ...Array(firstDayOfWeek).fill(null).map((_, i) => (
        <div key={`empty-${i}`} className="col-span-1 row-span-1 h-8 w-8" />
      )),
      ...Array(daysInMonth).fill(null).map((_, i) => (
        <CalendarDay key={`day-${i + 1}`} day={i + 1} isToday={i + 1 === today} />
      )),
    ]
  }

  if (!mounted) return null

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold text-clinical font-persian">
          رزرو نوبت آنلاین
        </h2>
        <p className="mb-4 text-sm text-silver/50 font-persian">
          زمان مناسب خود را انتخاب کنید
        </p>
        <a href={bookingLink} target="_blank" rel="noopener noreferrer">
          <Button className="rounded-2xl font-persian">رزرو آنلاین</Button>
        </a>
      </div>

      <div className="rounded-2xl border border-cyan/15 p-3 bg-navy/40">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-sm text-silver font-medium">{currentMonth}, {currentYear}</p>
          <span className="h-1 w-1 rounded-full bg-cyan/40" />
          <p className="text-xs text-silver/40">۳۰ دقیقه</p>
        </div>
        <div className="grid grid-cols-7 gap-2 px-2">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  )
}
