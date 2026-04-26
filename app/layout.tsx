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
    // Browser-tab icon. The SVG wrapper at /favicon.svg embeds
    // /images/Estew-logo.png inside a rounded clipPath so the icon always
    // renders with the same rounded-corner shape as a native app icon,
    // regardless of whether the source PNG has rounded corners. Browsers
    // that don't render SVG favicons fall back to the raw PNG.
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/Estew-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/Estew-logo.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/images/Estew-logo.png',
    apple: '/images/Estew-logo.png',
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
