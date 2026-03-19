import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Check, Crown, ArrowLeft, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing - Estew",
  description: "Simple, transparent pricing. Start free, upgrade when you need more.",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-6 w-6">
              <Image
                src="/images/logo.svg"
                alt="Estew"
                fill
                className="object-contain dark:invert"
              />
            </div>
            <span className="font-serif text-lg font-bold text-foreground">Estew</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Page header */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <Sparkles size={16} className="text-primary" />
              <span className="font-sans text-sm font-medium text-primary">Simple Pricing</span>
            </div>
            <h1 className="mb-4 font-serif text-4xl font-bold text-foreground md:text-5xl">
              Choose your plan
            </h1>
            <p className="mx-auto max-w-lg font-sans text-base text-muted-foreground" style={{ lineHeight: 1.7 }}>
              Start free and upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="relative rounded-2xl border border-border/50 bg-card/30 p-8 transition-all hover:border-border hover:bg-card/50">
              <div className="mb-8">
                <h2 className="mb-2 font-serif text-2xl font-semibold text-foreground">Free</h2>
                <p className="font-sans text-sm text-muted-foreground">Perfect for getting started</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-5xl font-bold text-foreground">₹0</span>
                  <span className="font-sans text-base text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 font-sans text-sm text-muted-foreground">Free forever</p>
              </div>

              <Link
                href="/"
                className="mb-8 flex w-full items-center justify-center rounded-xl border border-border bg-background py-3.5 font-sans text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                Get Started Free
              </Link>

              <div className="space-y-4">
                <p className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">What&apos;s included</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="font-sans text-sm text-muted-foreground">Daily news feed access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="font-sans text-sm text-muted-foreground">5 topic preferences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="font-sans text-sm text-muted-foreground">Save up to 10 articles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="font-sans text-sm text-muted-foreground">Weekly newsletter digest</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Plan - Featured */}
            <div className="relative rounded-2xl border-2 border-primary bg-card/50 p-8 shadow-lg shadow-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 font-sans text-xs font-semibold text-primary-foreground">
                  <Crown size={12} />
                  Recommended
                </span>
              </div>

              <div className="mb-8 pt-2">
                <h2 className="mb-2 flex items-center gap-2 font-serif text-2xl font-semibold text-foreground">
                  <Crown size={22} className="text-primary" />
                  Pro
                </h2>
                <p className="font-sans text-sm text-muted-foreground">For serious tech enthusiasts</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-5xl font-bold text-foreground">₹599</span>
                  <span className="font-sans text-base text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 font-sans text-sm text-primary">~$5 USD per month</p>
              </div>

              <Link
                href="/"
                className="mb-8 flex w-full items-center justify-center rounded-xl bg-primary py-3.5 font-sans text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Upgrade to Pro
              </Link>

              <div className="space-y-4">
                <p className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">Everything in Free, plus</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="font-sans text-sm text-muted-foreground">Unlimited topic preferences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="font-sans text-sm text-muted-foreground">Unlimited saved articles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="font-sans text-sm text-muted-foreground">Daily AI-curated newsletter</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="font-sans text-sm text-muted-foreground">Ad-free experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="font-sans text-sm text-muted-foreground">Early access to new features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="font-sans text-sm text-muted-foreground">Priority support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ or additional info */}
          <div className="mt-16 text-center">
            <p className="font-sans text-sm text-muted-foreground">
              Questions? Contact us at{" "}
              <a href="mailto:support@estew.xyz" className="text-primary hover:underline">
                support@estew.xyz
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="relative h-5 w-5">
              <Image
                src="/images/logo.svg"
                alt="Estew"
                fill
                className="object-contain dark:invert"
              />
            </div>
            <span className="font-sans text-xs text-muted-foreground">Estew 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
