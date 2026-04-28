"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

/**
 * MarketingFooter
 * --------------------------------------------------------------------------
 * Shared footer used on every public/marketing surface:
 *   - <Homepage />            (the landing page rendered for unauthed users)
 *   - /pricing
 *   - /about-us
 *   - /privacy-policy
 *   - /terms-of-service
 *   - /not-found              (the 404 marketing shell)
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ Brand (logo + wordmark + tagline + Join CTA)   Product   Company │
 *   │                                                                  │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ © 2026 Estew. All rights reserved.        Built in California.   │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Notes:
 *   - "Join Estew free" routes to "/" because that's where the landing
 *     screen with the actual sign-up flow lives. Optionally the parent
 *     can pass `onJoinClick` to intercept the click (used by Homepage so
 *     it can trigger its in-page auth modal instead of a route change).
 *   - Logo is intentionally larger than before (40×40) because the user
 *     asked for stronger branding presence in the footer.
 *   - Year is hardcoded to 2026 to avoid any SSR/CSR hydration drift and
 *     to match the existing copy ("Estew 2026") used elsewhere.
 */

type MarketingFooterProps = {
  /**
   * Optional handler for the "Join Estew free" CTA. When provided the CTA
   * renders as a <button> and calls this instead of navigating. When omitted
   * the CTA renders as a <Link> to "/" so it works on standalone pages
   * (pricing, about-us, etc.) where there's no in-page auth modal.
   */
  onJoinClick?: () => void
}

const productLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
] as const

const companyLinks = [
  { label: "About us", href: "/about-us" },
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Terms of service", href: "/terms-of-service" },
] as const

export function MarketingFooter({ onJoinClick }: MarketingFooterProps = {}) {
  return (
    <footer className="relative z-10 border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:px-8 md:py-16">
        {/* ── Top: brand + link columns ───────────────────────────── */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-6">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="Estew home"
            >
              <span className="relative h-10 w-10 shrink-0">
                <Image
                  src="/images/logo.svg"
                  alt=""
                  fill
                  className="object-contain dark:invert"
                />
              </span>
              <span className="font-sans text-xl font-semibold tracking-tight text-foreground">
                estew
              </span>
            </Link>

            <p className="mt-5 max-w-sm font-sans text-sm leading-relaxed text-muted-foreground">
              Tech news that never sleeps. Concise daily briefings, hand-picked
              stories, and a personal AI digest — delivered straight to your inbox.
            </p>

            {/* Join Estew free CTA — switches between <button> and <Link>
                depending on whether the parent wants to intercept it. */}
            {onJoinClick ? (
              <button
                type="button"
                onClick={onJoinClick}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-sans text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Join Estew free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-sans text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Join Estew free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>

          {/* Product */}
          <nav
            aria-label="Product"
            className="col-span-1 md:col-span-3"
          >
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav
            aria-label="Company"
            className="col-span-1 md:col-span-3"
          >
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ── Bottom: copyright bar ───────────────────────────────── */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row">
          <p className="font-sans text-xs text-muted-foreground">
            © 2026 Estew. All rights reserved.
          </p>
          <p className="font-sans text-xs text-muted-foreground">
            Built for the perpetually curious.
          </p>
        </div>
      </div>
    </footer>
  )
}
