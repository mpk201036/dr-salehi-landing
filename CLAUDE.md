# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build (outputs standalone bundle)
npm run start    # Run production build locally
npm run lint     # ESLint via Next.js
```

No test suite is configured.

## Architecture

Single-page Next.js 14 App Router site — one route (`app/page.tsx`) composed of 12 sequential section components rendered top-to-bottom. The page uses a cinematic "footer reveal" layout: `<main>` sits above a fixed `<Footer>` with `z-index`, so the footer appears as the page scrolls away.

### Content

All copy, doctor data, services, testimonials, and FAQ items live in **`lib/content.ts`** as exported constants. Edit this file to change any text or data on the site — no component hunting needed.

### Animation system

Two animation libraries coexist deliberately:

- **GSAP + ScrollTrigger** — powers the hero video scrub, pinned scroll sequence, and the motion footer's scroll-driven entrance. GSAP plugin registration (`ScrollTrigger`, `ScrollToPlugin`) must happen inside `if (typeof window !== 'undefined')` guards for SSR safety.
- **Framer Motion** — handles section entrance animations and UI micro-interactions.

`scroll-behavior: smooth` is intentionally **removed** from `globals.css` — native smooth scroll fights GSAP's scrub and causes jumpy playback.

### Hero section

`HeroSection.tsx` drives a scroll-scrubbed video sequence (`/public/hero-sequence/` frames or `hero.mp4`). The hero is always `100svh` with iOS Safari fallbacks defined in `globals.css`. `useDeviceInfo` hook detects iOS/mobile to apply device-specific animation paths (iOS gets reduced GPU-intensive effects).

### Footer

`components/ui/motion-footer.tsx` is a standalone cinematic component with its own GSAP ScrollTrigger timeline, keyframe animations injected via a `<style>` tag, and a CSS marquee. It is used by `components/Footer.tsx`.

### Hooks

- `lib/hooks/useDeviceInfo.ts` — detects device type, iOS, orientation, and viewport dimensions. Used throughout sections to conditionally disable heavy animations on mobile.
- `lib/hooks/useReveal.ts` — lightweight intersection-observer hook for section fade-in triggers.

## Design tokens

Defined in `tailwind.config.ts` and mirrored as CSS vars in `globals.css`:

| Token | Value | Usage |
|---|---|---|
| `navy` | `#0D1B2A` | Primary background |
| `cyan` | `#0EA5C0` | Brand accent |
| `arterial` | `#EF3838` | Alert / CTA red |
| `silver` | `#E6EEF6` | Light text on dark |

### Typography

Three font families loaded via `next/font/google`:
- `font-display` → Cormorant Garamond (English headings)
- `font-sans` → DM Sans (English body/UI)
- `font-persian` → Noto Sans Arabic (all Farsi text — set as `<body>` default)

The document is `lang="fa" dir="rtl"` — all layout must account for RTL.

## Deployment

**Target: ArvanCloud VM** (Ubuntu 22.04, Node 20, PM2 + Nginx). See `ARVANCLOUD_DEPLOY.md` for full instructions.

`next.config.js` uses `output: 'standalone'` — the build produces a self-contained Node.js server at `.next/standalone/server.js`. After build, static assets must be copied manually:

```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

PM2 process config is in `ecosystem.config.js` (runs `server.js` on port 3000, bound to `0.0.0.0`).

## Security

`next.config.js` sets a strict Content-Security-Policy and security headers on all routes. The CSP allows `unsafe-inline` scripts in dev (required for Next.js HMR) and tightens in production. External frame sources are limited to Google Maps, Neshan, OpenStreetMap, and Calendly. Do not add new external script or frame sources without updating the CSP.
