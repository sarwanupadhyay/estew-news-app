"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowRight, Zap, Clock, Sparkles, ChevronRight } from "lucide-react"

interface HomepageProps {
  onGetStarted: () => void
}

export function Homepage({ onGetStarted }: HomepageProps) {
  const [userCount, setUserCount] = useState(0)

  // Animate user count on mount
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
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <Image
              src="/images/logo.png"
              alt="Estew"
              fill
              className="object-contain dark:invert"
              priority
            />
          </div>
          <span className="font-serif text-lg font-bold text-foreground">
            Est<span className="text-primary">ew</span>
          </span>
        </div>
        
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="font-sans text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="font-sans text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#pricing" className="font-sans text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </a>
        </nav>

        <button
          onClick={onGetStarted}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 press-effect"
        >
          Get Started
          <ArrowRight size={14} />
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-16 pb-20 md:pt-24">
        {/* Live counter badge */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {userCount} readers joined this week
          </span>
        </div>

        {/* Main headline */}
        <h1 className="mb-6 max-w-3xl text-center font-serif text-4xl font-bold leading-tight text-foreground animate-slide-up md:text-6xl md:leading-tight">
          Your daily tech news
          <br />
          in <span className="relative inline-block text-primary">
            60 seconds
            <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
              <path d="M1 5.5C47 2 153 2 199 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-lg text-center font-sans text-base text-muted-foreground animate-slide-up delay-100 md:text-lg" style={{ lineHeight: 1.7 }}>
          AI-curated tech intelligence. Zero noise. 
          <br className="hidden md:block" />
          Get the stories that matter, delivered daily.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-4 animate-slide-up delay-200 sm:flex-row">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-sans text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 press-effect"
          >
            Start Reading Free
            <ArrowRight size={18} />
          </button>
          <span className="font-sans text-xs text-muted-foreground">
            No credit card required
          </span>
        </div>
      </main>

      {/* How it works section */}
      <section id="how-it-works" className="relative z-10 px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <div className="mb-12 flex items-center gap-3">
            <div className="h-px w-8 bg-primary"></div>
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
              How it works
            </span>
          </div>

          <h2 className="mb-16 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Three steps.
            <br />
            {"That's it."}
          </h2>

          {/* Steps grid */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="group rounded-2xl border border-border/50 bg-card/30 p-6 transition-all hover:border-border hover:bg-card/50">
              <div className="mb-6 inline-flex rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
                001
              </div>
              
              <div className="mb-6 flex h-24 items-center justify-center">
                <div className="grid grid-cols-4 gap-1.5">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 rounded-sm transition-colors"
                      style={{
                        backgroundColor: [
                          '#6366f1', '#a855f7', '#ec4899', '#8b5cf6',
                          '#06b6d4', '#14b8a6', '#f97316', '#84cc16',
                          '#eab308', '#64748b', '#ef4444', '#3b82f6',
                          '#22c55e', '#64748b', '#a855f7', '#22c55e'
                        ][i],
                        opacity: 0.8
                      }}
                    />
                  ))}
                </div>
              </div>

              <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">
                Pick your topics.
              </h3>
              <p className="font-sans text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                AI, Startups, Crypto, Dev Tools. Choose what matters to you. Switch anytime.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group rounded-2xl border border-border/50 bg-card/30 p-6 transition-all hover:border-border hover:bg-card/50">
              <div className="mb-6 inline-flex rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
                002
              </div>
              
              <div className="mb-6 flex h-24 items-center justify-center gap-3">
                <span className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
                  APP
                </span>
                <span className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
                  WEB
                </span>
                <span className="rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 font-mono text-xs text-primary">
                  EMAIL
                </span>
              </div>

              <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">
                Read anywhere.
              </h3>
              <p className="font-sans text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                Mobile app, web, or daily email digest. Your news follows you everywhere.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group rounded-2xl border border-border/50 bg-card/30 p-6 transition-all hover:border-border hover:bg-card/50">
              <div className="mb-6 inline-flex rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
                003
              </div>
              
              <div className="mb-6 flex h-24 items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20"></div>
                  <div className="absolute inset-2 animate-pulse rounded-full bg-emerald-500/30"></div>
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500/30">
                    <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  </div>
                </div>
              </div>

              <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">
                Stay informed.
              </h3>
              <p className="font-sans text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                AI filters the noise. You get signal. 5-minute daily briefings that matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="relative z-10 px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/30 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Zap size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-sans text-sm font-semibold text-foreground">Lightning Fast</h3>
                <p className="font-sans text-xs text-muted-foreground">News updates in real-time from 50+ sources</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/30 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-sans text-sm font-semibold text-foreground">AI-Curated</h3>
                <p className="font-sans text-xs text-muted-foreground">Smart algorithms surface what matters most</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/30 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Clock size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-sans text-sm font-semibold text-foreground">5 Min Daily</h3>
                <p className="font-sans text-xs text-muted-foreground">Concise briefings that respect your time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-6 font-serif text-2xl font-bold text-foreground md:text-3xl">
            Ready to cut through the noise?
          </h2>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-sans text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 press-effect"
          >
            Join Estew Free
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-5 w-5">
              <Image
                src="/images/logo.png"
                alt="Estew"
                fill
                className="object-contain dark:invert"
              />
            </div>
            <span className="font-sans text-xs text-muted-foreground">
              Estew 2026
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
