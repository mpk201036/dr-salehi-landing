'use client'

import { useEffect, useState } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

interface DeviceInfo {
  type: DeviceType
  isIOS: boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isPortrait: boolean
  viewportHeight: number
  viewportWidth: number
}

function detect(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'desktop', isIOS: false, isMobile: false,
      isTablet: false, isDesktop: true, isPortrait: false,
      viewportHeight: 900, viewportWidth: 1440,
    }
  }

  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /Android/.test(ua)
  const w = window.innerWidth
  const h = window.innerHeight
  const isPortrait = h > w

  let type: DeviceType = 'desktop'
  if (w < 768 || (isIOS && isPortrait) || (isAndroid && w < 768)) type = 'mobile'
  else if (w < 1024) type = 'tablet'

  return {
    type,
    isIOS,
    isMobile: type === 'mobile',
    isTablet: type === 'tablet',
    isDesktop: type === 'desktop',
    isPortrait,
    viewportHeight: h,
    viewportWidth: w,
  }
}

export function useDeviceInfo(): DeviceInfo & { mounted: boolean } {
  const [info, setInfo] = useState<DeviceInfo>(detect)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Re-detect now that we're on the client with real UA + viewport
    setInfo(detect())
    setMounted(true)

    const update = () => setInfo(detect())
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    window.addEventListener('orientationchange', () => setTimeout(update, 300))
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return { ...info, mounted }
}
