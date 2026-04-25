import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
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

export const metadata: Metadata = {
  title: 'Estew - Tech news that never sleeps',
  description:
    'A curated, real-time tech news platform covering AI, product launches, startups, market updates, and company/founder updates.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    // Modern browsers pick the SVG (which auto-themes via prefers-color-scheme
    // baked into the file itself) and fall back to the PNG when SVG isn't
    // supported. The SVG version flips fg/bg automatically for dark vs light
    // browser chrome so the tab icon is always legible.
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/logo.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: '/images/logo.png',
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
    <html lang="en" suppressHydrationWarning className={`dark ${dmSans.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
