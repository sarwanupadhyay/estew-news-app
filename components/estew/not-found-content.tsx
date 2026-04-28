"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { TopHeader } from "./top-header"
import { BottomNav } from "./bottom-nav"
import { ErrorParticles } from "../error/error-particles"

/**
 * Top-level wrapper for the /not-found route. Mounts its own AuthProvider
 * because not-found.tsx is rendered OUTSIDE app/page.tsx (which is where
 * the main AuthProvider lives), so otherwise useAuth would have no context
 * to read from.
 */
export function NotFoundContent() {
  return (
    <AuthProvider>
      <NotFoundShell />
    </AuthProvider>
  )
}

/**
 * Branches the 404 design between two surrounding shells so the user
 * always feels like they're on the site they came from:
 *
 *  - Authenticated users keep the mobile-app chrome (TopHeader + BottomNav).
 *  - Unauthenticated users get the marketing landing-page header + footer
 *    so an external link with a typo still feels like estew.xyz, not a
 *    foreign-looking error page.
 *
 * While Firebase auth state is still initializing we render the marketing
 * shell — most 404 hits come from external links / search engines where
 * there's no logged-in user anyway, and rendering an empty placeholder
 * during that brief window would feel like a flash of broken UI.
 */
function NotFoundShell() {
  const { user, loading } = useAuth()

  if (!loading && user) {
    return <AuthenticatedShell />
  }

  return <MarketingShell />
}

/* ------------------------------------------------------------------ */
/* Authenticated mobile-app shell (matches the in-app screens)         */
/* ------------------------------------------------------------------ */

function AuthenticatedShell() {
  return (
    <div className="relative mx-auto min-h-screen max-w-[428px] bg-background">
      <TopHeader />
      <main className="relative pb-32">
        <NotFoundHero variant="mobile" />
      </main>
      <BottomNav />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Marketing shell (matches the landing page header + footer)          */
/* ------------------------------------------------------------------ */

function MarketingShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header — intentionally mirrors components/estew/homepage.tsx so
          the unauth 404 feels like a continuation of the landing page. */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-7 w-7">
            <Image
              src="/images/logo.svg"
              alt="Estew"
              fill
              className="object-contain dark:invert"
              priority
            />
          </div>
          <span className="text-lg font-semibold text-foreground">estew</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/about-us"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </Link>
        </nav>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get Started
          <ArrowRight size={14} />
        </Link>
      </header>

      <main className="relative flex-1">
        <NotFoundHero variant="marketing" />
      </main>

      {/* Footer — same minimal landing-page footer */}
      <footer className="border-t border-border px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="relative h-5 w-5">
              <Image
                src="/images/logo.svg"
                alt="Estew"
                fill
                className="object-contain dark:invert"
              />
            </div>
            <span className="text-xs text-muted-foreground">Estew 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy-policy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Shared editorial 404 hero (works inside both shells)                */
/* ------------------------------------------------------------------ */

function NotFoundHero({ variant }: { variant: "mobile" | "marketing" }) {
  const isMarketing = variant === "marketing"

  return (
    <div
      className={
        isMarketing
          ? "relative mx-auto w-full max-w-[640px] px-6 pb-20 pt-12 text-center md:pt-20"
          : "relative px-5 pb-12 pt-10 text-center"
      }
    >
      {/* Floating ambient signal particles — part of the reusable
          "404 Error Page Animations" system in globals.css. Position is
          fixed/full-bleed inside the component itself, so it doesn't
          affect the hero's flow layout. */}
      <ErrorParticles />

      {/* Ambient glow behind the 404, matching the editorial mockup.
          Sits behind everything and never captures clicks. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-16 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]"
      />

      {/* Status pill */}
      <div className="relative z-10 mb-10 flex justify-center md:mb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-sans text-[11px] font-medium text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
          </span>
          Signal lost — 0 stories found at this URL
        </span>
      </div>

      {/* Big 404 — gradient-filled DISPLAY type (Syne 800) with a soft
          purple glow. Larger on the marketing variant so it fills the
          wider canvas. The font swap matches the typographic feel of the
          editorial reference: condensed-feeling display sans, tightly
          tracked, with the purple→transparent fade baked in via
          background-clip:text. */}
      <h1
        className={`relative z-10 select-none bg-gradient-to-b from-primary via-primary/60 to-primary/15 bg-clip-text font-display font-extrabold leading-[0.9] text-transparent ${
          isMarketing ? "text-[160px] md:text-[220px]" : "text-[140px]"
        }`}
        style={{
          letterSpacing: "-0.04em",
          filter: "drop-shadow(0 10px 32px rgb(124 58 237 / 0.45))",
        }}
      >
        404
      </h1>

      {/* Headline */}
      <h2
        className={`relative z-10 mb-3 mt-2 text-balance font-sans font-bold leading-tight text-foreground ${
          isMarketing ? "text-3xl md:text-4xl" : "text-2xl"
        }`}
      >
        {"This story "}
        <span className="text-primary">{"didn't make"}</span>
        {" the feed."}
      </h2>

      {/* Subtext */}
      <p
        className={`relative z-10 mx-auto mb-10 text-pretty font-sans leading-relaxed text-muted-foreground ${
          isMarketing ? "max-w-[480px] text-sm md:text-base" : "max-w-[320px] text-[13px]"
        }`}
      >
        {
          "The page you're looking for isn't in today's briefing. It may have moved, expired, or never existed — kind of like that one startup that raised $200M and vanished."
        }
      </p>

      {/* "Today's Top Story" label */}
      <div
        className={`relative z-10 mb-3 text-left font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground ${
          isMarketing ? "mx-auto max-w-[480px]" : ""
        }`}
      >
        Today&apos;s Top Story
      </div>

      {/* Fake editorial card — same visual language as a real article
          card so users feel like they're still inside the app. */}
      <article
        className={`relative z-10 rounded-xl border border-border bg-card p-4 text-left ${
          isMarketing ? "mx-auto max-w-[480px]" : ""
        }`}
      >
        <div className="mb-3">
          <span className="inline-block rounded-md bg-primary/15 px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-primary">
            Breaking
          </span>
        </div>
        <h3 className="mb-3 font-sans text-base font-semibold leading-snug text-foreground">
          Page found at requested URL — full coverage inside
        </h3>

        {/* Skeleton bars — re-uses the shimmer animation from the rest of
            the app so the loading effect matches real article placeholders. */}
        <div className="mb-4 space-y-2">
          <div className="h-2 w-full animate-shimmer rounded-full" />
          <div className="h-2 w-4/5 animate-shimmer rounded-full" />
        </div>

        <div className="flex items-center gap-2 font-sans text-[11px] text-muted-foreground">
          <span>estew</span>
          <span className="text-muted-foreground/40">·</span>
          <span>Just now</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-medium text-destructive">Story not found</span>
        </div>
      </article>

      {/* Primary recovery CTA */}
      <Link
        href="/"
        className="press-effect relative z-10 mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {isMarketing ? "Back to home" : "Back to today's feed"}
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}
