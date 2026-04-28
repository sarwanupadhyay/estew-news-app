"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Zap, Clock, Sparkles } from "lucide-react"
import { ErrorParticles } from "@/components/error/error-particles"

interface HomepageProps {
  onGetStarted: () => void
}

export function Homepage({ onGetStarted }: HomepageProps) {
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    const target = 604
    const duration = 1500
    const steps = 30
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setUserCount(target)
        clearInterval(timer)
      } else {
        setUserCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Reusable "404 Error Page Animations" particle layer — drifts
          across the entire viewport, sits behind all content, and never
          intercepts clicks. Adds visual atmosphere to the marketing
          landing without altering any existing layout. */}
      <ErrorParticles />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2.5">
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
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/about-us" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            About
          </Link>
        </nav>

        <button
          onClick={onGetStarted}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get Started
          <ArrowRight size={14} />
        </button>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center px-6 pt-20 pb-16 md:pt-28">
        {/* Live counter */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
          </span>
          <span className="text-sm text-muted-foreground">
            {userCount} readers joined this week
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 max-w-2xl text-center text-4xl font-semibold leading-tight text-foreground animate-slide-up md:text-5xl md:leading-tight">
          Your daily tech news
          <br />
          in <span className="text-primary">60 seconds</span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-md text-center text-base text-muted-foreground animate-slide-up delay-100" style={{ lineHeight: 1.7 }}>
          AI-curated tech intelligence. Zero noise.
          <br className="hidden md:block" />
          Get the stories that matter, delivered daily.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 animate-slide-up delay-200">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 press-effect"
          >
            Start Reading Free
            <ArrowRight size={18} />
          </button>
          <span className="text-xs text-muted-foreground">
            No credit card required
          </span>
        </div>
      </main>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-6 bg-primary"></div>
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              How it works
            </span>
          </div>

          <h2 className="mb-12 text-2xl font-semibold text-foreground md:text-3xl">
            Three steps. That&apos;s it.
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted/30">
              <span className="mb-4 inline-flex rounded-lg border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                01
              </span>
              <div className="mb-5 flex h-20 items-center justify-center">
                <div className="grid grid-cols-4 gap-1">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="h-3.5 w-3.5 rounded-sm"
                      style={{
                        backgroundColor: ['#7C3AED', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899'][i % 6],
                        opacity: 0.7
                      }}
                    />
                  ))}
                </div>
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">Pick your topics</h3>
              <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                AI, Startups, Crypto, Dev Tools. Choose what matters.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted/30">
              <span className="mb-4 inline-flex rounded-lg border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                02
              </span>
              <div className="mb-5 flex h-20 items-center justify-center gap-2">
                <span className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">APP</span>
                <span className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">WEB</span>
                <span className="rounded-lg border border-primary/50 bg-primary/10 px-3 py-1.5 text-xs text-primary">EMAIL</span>
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">Read anywhere</h3>
              <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                Mobile app, web, or daily email. Your news follows you.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted/30">
              <span className="mb-4 inline-flex rounded-lg border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                03
              </span>
              <div className="mb-5 flex h-20 items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-success/20"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-success/30">
                    <div className="h-2.5 w-2.5 rounded-full bg-success"></div>
                  </div>
                </div>
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">Stay informed</h3>
              <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                AI filters the noise. 5-minute daily briefings that matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Zap size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">Lightning Fast</h3>
                <p className="text-xs text-muted-foreground">Real-time updates from 50+ sources</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">AI-Curated</h3>
                <p className="text-xs text-muted-foreground">Smart algorithms surface what matters</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Clock size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">5 Min Daily</h3>
                <p className="text-xs text-muted-foreground">Concise briefings that respect your time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="mb-5 text-xl font-semibold text-foreground md:text-2xl">
            Ready to cut through the noise?
          </h2>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 press-effect"
          >
            Join Estew Free
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
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
            <span className="text-xs text-muted-foreground">
              Estew 2026
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
