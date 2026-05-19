/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Stop sending referrer to cross-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable DNS prefetching
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Disable browser features that are not needed
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  // HSTS — enforce HTTPS for 1 year (only active on HTTPS hosts)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js inline scripts + GSAP/Framer need unsafe-inline; nonce-based CSP
      // is ideal but requires middleware — this is the practical baseline for a static landing page
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Google Maps iframe
      "frame-src https://www.google.com https://maps.google.com",
      // Images: self + data URIs (used by Next.js image optimiser)
      "img-src 'self' data: blob:",
      // API calls: same origin only
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // Prevent mixed content
      "upgrade-insecure-requests",
    ].join('; '),
  },
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
