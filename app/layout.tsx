import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces, Syne } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-fraunces',
})

// Display face used for the 404 error number and (in future) any other
// editorial display/glitch typography. Loaded as a separate variable so we
// can opt into it on a per-element basis without affecting the rest of the
// type system. Subset is kept latin-only to keep the bundle small.
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-syne',
})

export const metadata: Metadata = {
  title: 'Estew - Tech news that never sleeps',
  description:
    'A curated, real-time tech news platform covering AI, product launches, startups, market updates, and company/founder updates.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    // Browser-tab icon. We point directly at the PNG (no SVG wrapper)
    // because browsers sandbox favicon SVGs and refuse to load external
    // <image href> references inside them — that was causing the icon
    // to render as a blank white tile. Every modern browser supports
    // PNG favicons natively. The 192px entry doubles as the iOS /
    // Android home-screen icon when the site is installed as a PWA.
    icon: [
      { url: '/images/icon-estew.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/icon-estew.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/images/icon-estew.png',
    apple: '/images/icon-estew.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0066FF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${dmSans.variable} ${fraunces.variable} ${syne.variable}`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
