'use client'

import { useEffect, type RefObject } from 'react'

export function useReveal(
  ref: RefObject<Element>,
  { threshold = 0.2, stagger = 120 }: { threshold?: number; stagger?: number } = {}
) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * stagger)
            })
          }
        })
      },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
}
