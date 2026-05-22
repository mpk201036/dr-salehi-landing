import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, Noto_Sans_Arabic } from 'next/font/google'
import './globals.css'

// Premium editorial serif for English headings
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

// Modern minimal geometric sans for English body/UI
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

// Premium Farsi variable font — clean, contemporary, excellent RTL
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-persian',
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'دکتر علی صالحی | متخصص قلب و عروق تهران',
  description:
    'دکتر علی صالحی متخصص قلب و عروق در تهران با بیش از ۴۰ سال تجربه. پیروزی، بین چهارم و پنجم نیرو هوایی. رزرو نوبت: 021 77433062',
  keywords: ['قلب', 'متخصص قلب', 'کاردیولوژیست', 'دکتر صالحی', 'پیروزی', 'تهران', 'اکو قلب', 'نوار قلب'],
  openGraph: {
    title: 'دکتر علی صالحی | متخصص قلب و عروق',
    description: 'بیش از ۴۰ سال تجربه در مراقبت قلبی عروقی. رزرو نوبت تلفنی.',
    locale: 'fa_IR',
    type: 'website',
  },
  other: {
    'schema:type': 'Physician',
    'schema:specialty': 'Cardiology',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" className={`${cormorant.variable} ${dmSans.variable} ${notoSansArabic.variable}`}>
      <head>
        {/* iPhone notch / Dynamic Island safe area + status bar color */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0D1B2A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Physician',
              name: 'دکتر علی صالحی',
              description: 'متخصص قلب و عروق با بیش از ۴۰ سال تجربه',
              telephone: '02177433062',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'پیروزی، بین چهارم و پنجم نیرو هوایی، پلاک ۸۷، طبقه دوم',
                addressLocality: 'تهران',
                addressCountry: 'IR',
              },
              openingHours: 'Sa-We 15:30-19:00',
              medicalSpecialty: 'Cardiology',
            }),
          }}
        />
      </head>
      <body className="font-persian antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
              window.scrollTo(0, 0);
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}
