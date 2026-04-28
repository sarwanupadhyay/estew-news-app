import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Zap, Sparkles, Clock, Globe, Shield, Users, Target, Newspaper, Mail, ChevronRight } from "lucide-react"
import type { Metadata } from "next"
import { ErrorParticles } from "@/components/error/error-particles"
import { MarketingFooter } from "@/components/estew/marketing-footer"

export const metadata: Metadata = {
  title: "About Us - Estew",
  description: "Learn about Estew - Your AI-powered daily tech news platform that delivers curated intelligence in 60 seconds.",
}

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Reusable "404 Error Page Animations" particle layer (full-bleed
          fixed overlay, no layout impact, no pointer events). */}
      <ErrorParticles />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-7 w-7">
              <Image
                src="/images/logo.svg"
                alt="Estew"
                fill
                className="object-contain dark:invert"
                priority
              />
            </div>
            <span className="font-serif text-lg font-bold text-foreground">
              Est<span className="text-primary">ew</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <Sparkles size={16} className="text-primary" />
            <span className="font-sans text-sm font-medium text-primary">About Estew</span>
          </div>

          <h1 className="mb-6 max-w-3xl font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl md:leading-tight">
            Tech news, reimagined for the
            <span className="relative ml-3 inline-block text-primary">
              modern reader
              <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M1 5.5C47 2 153 2 199 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="max-w-2xl font-sans text-lg text-muted-foreground leading-relaxed">
            Estew is an AI-powered tech news platform that cuts through the noise to deliver the stories that matter most. 
            We believe staying informed shouldn&apos;t feel like a full-time job.
          </p>
        </div>

        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Mission Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px w-8 bg-primary" />
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">Our Mission</span>
              </div>
              <h2 className="mb-6 font-serif text-3xl font-bold text-foreground md:text-4xl">
                Making tech news accessible to everyone
              </h2>
              <p className="mb-4 font-sans text-base text-muted-foreground leading-relaxed">
                In a world flooded with information, finding quality tech news has become overwhelming. 
                We created Estew to solve this problem.
              </p>
              <p className="font-sans text-base text-muted-foreground leading-relaxed">
                Our AI-powered platform aggregates news from 50+ trusted sources, analyzes thousands of articles daily, 
                and delivers only the most relevant stories based on your interests - all in under 60 seconds of reading time.
              </p>
            </div>

            {/* Visual representation */}
            <div className="relative">
              <div className="rounded-2xl border border-border/50 bg-card/30 p-8">
                <div className="grid grid-cols-3 gap-4">
                  {/* Source icons grid */}
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="flex h-16 w-full items-center justify-center rounded-xl border border-border/50 bg-background transition-colors hover:border-primary/30"
                    >
                      <Newspaper size={24} className="text-muted-foreground/50" />
                    </div>
                  ))}
                </div>
                <div className="my-6 flex items-center justify-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <Sparkles size={20} className="text-primary-foreground" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                  <p className="font-sans text-sm font-medium text-foreground">Your Personalized Feed</p>
                  <p className="mt-1 font-sans text-xs text-muted-foreground">5 minute daily briefing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/30 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 flex items-center gap-3">
            <div className="h-px w-8 bg-primary" />
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">How It Works</span>
          </div>

          <h2 className="mb-16 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Intelligence, not information overload
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative">
              <div className="mb-6 inline-flex rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
                01
              </div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Globe size={28} className="text-primary" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-semibold text-foreground">
                We Aggregate
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Our system continuously monitors 50+ trusted tech publications, blogs, and news sources worldwide, 
                collecting thousands of articles every day.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="mb-6 inline-flex rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
                02
              </div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles size={28} className="text-primary" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-semibold text-foreground">
                AI Curates
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Advanced AI algorithms analyze, deduplicate, and rank stories based on relevance, impact, 
                and your personal interests to surface what truly matters.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="mb-6 inline-flex rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
                03
              </div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Mail size={28} className="text-primary" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-semibold text-foreground">
                You Read
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Access your personalized feed via our web app, mobile app, or daily email newsletter. 
                Stay informed in just 5 minutes a day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 flex items-center gap-3">
            <div className="h-px w-8 bg-primary" />
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">What We Offer</span>
          </div>

          <h2 className="mb-12 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Built for busy professionals
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border/50 bg-card/30 p-6 transition-all hover:border-border hover:bg-card/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Zap size={24} className="text-primary" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">Real-Time Updates</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Breaking news and important updates are delivered to your feed within minutes of publication, 
                keeping you ahead of the curve.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 p-6 transition-all hover:border-border hover:bg-card/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Target size={24} className="text-primary" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">Personalized Topics</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Choose from AI, Startups, Crypto, Developer Tools, and more. Your feed adapts to show 
                exactly what matters to you.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 p-6 transition-all hover:border-border hover:bg-card/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Clock size={24} className="text-primary" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">5-Minute Briefings</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Concise summaries and smart categorization mean you can consume a full day&apos;s worth 
                of tech news in just 5 minutes.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 p-6 transition-all hover:border-border hover:bg-card/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Shield size={24} className="text-primary" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">Ad-Free Experience</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                No distracting ads or sponsored content. Pro subscribers enjoy a clean, focused 
                reading experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/50 bg-muted/30 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 text-center md:grid-cols-4">
            <div>
              <p className="font-serif text-4xl font-bold text-foreground md:text-5xl">50+</p>
              <p className="mt-2 font-sans text-sm text-muted-foreground">News Sources</p>
            </div>
            <div>
              <p className="font-serif text-4xl font-bold text-foreground md:text-5xl">1000+</p>
              <p className="mt-2 font-sans text-sm text-muted-foreground">Daily Articles Processed</p>
            </div>
            <div>
              <p className="font-serif text-4xl font-bold text-foreground md:text-5xl">5 min</p>
              <p className="mt-2 font-sans text-sm text-muted-foreground">Average Read Time</p>
            </div>
            <div>
              <p className="font-serif text-4xl font-bold text-foreground md:text-5xl">600+</p>
              <p className="mt-2 font-sans text-sm text-muted-foreground">Active Readers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team/Values Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 flex items-center gap-3">
            <div className="h-px w-8 bg-primary" />
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">Our Values</span>
          </div>

          <h2 className="mb-12 font-serif text-3xl font-bold text-foreground md:text-4xl">
            What drives us
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users size={32} className="text-primary" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">User First</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Every feature we build starts with one question: How does this help our readers save time 
                and stay better informed?
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield size={32} className="text-primary" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">Quality Over Quantity</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                We prioritize accuracy and relevance over clickbait. Our AI is trained to surface 
                substantive stories, not just viral ones.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles size={32} className="text-primary" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">Continuous Innovation</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                We constantly improve our AI algorithms and user experience based on feedback 
                and the latest advancements in technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Ready to transform how you consume tech news?
          </h2>
          <p className="mb-8 font-sans text-base text-muted-foreground">
            Join thousands of tech professionals who start their day with Estew.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-sans text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 press-effect"
          >
            Get Started Free
            <ChevronRight size={18} />
          </Link>
          <p className="mt-4 font-sans text-xs text-muted-foreground">
            No credit card required
          </p>
        </div>
      </section>

      {/* Footer — shared marketing footer with full nav, branding, and
          copyright (replaces the previous minimal bar). */}
      <MarketingFooter />
    </div>
  )
}
