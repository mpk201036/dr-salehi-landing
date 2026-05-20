/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development'

const cspDirectives = [
  "default-src 'self'",
  "font-src 'self' https://fonts.gstatic.com",
  "frame-src https://www.google.com https://maps.google.com https://calendly.com",
  "img-src 'self' data: blob: https://calendly.com",
  "media-src 'self' https://github.com https://objects.githubusercontent.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://assets.calendly.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com",
  // Dev: allow Next.js HMR websocket on localhost; prod: self only
  isDev
    ? "connect-src 'self' ws://localhost:* wss://localhost:* https://calendly.com"
    : "connect-src 'self' https://calendly.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // upgrade-insecure-requests breaks localhost (HTTP); only in production
  ...(!isDev ? ["upgrade-insecure-requests"] : []),
]

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Legacy XSS filter — still respected by older browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  // HSTS only meaningful over HTTPS
  ...(!isDev ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
  { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
]

const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
