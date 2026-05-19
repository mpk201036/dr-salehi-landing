/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development'

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "frame-src https://www.google.com https://maps.google.com",
  "img-src 'self' data: blob:",
  // Dev: allow Next.js HMR websocket on localhost; prod: self only
  isDev
    ? "connect-src 'self' ws://localhost:* wss://localhost:*"
    : "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Prevent browsers from interpreting files as a different MIME type
  "require-trusted-types-for 'script'",
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
