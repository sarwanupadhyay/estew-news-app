import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Newspaper,
  Users,
  Send,
  Activity,
  Mail,
  Star,
  ShieldCheck,
  Lock,
  Clock,
} from "lucide-react"
import { ErrorParticles } from "@/components/error/error-particles"

/**
 * Landing page for the admin subdomain (admin.estew.xyz).
 *
 * Reachable in production ONLY via the host-based rewrite in
 * `middleware.ts` — admin.estew.xyz/ → /admin-landing (internal).
 * The path itself is hidden from both the main domain and direct URL
 * access on the admin subdomain.
 *
 * Visually mirrors the main marketing landing (same dark theme, same
 * primary purple accent, same `<ErrorParticles />` atmosphere) so it
 * feels like part of the same product, but has zero links back to
 * the consumer app — every CTA points to `/admin-controls`, the
 * existing admin login surface.
 */

export const metadata: Metadata = {
  title: "Estew Admin · Mission control",
  description:
    "Restricted admin console for Estew. Curate the daily feed, manage subscribers, send newsletters, and monitor system health.",
  // Don't let this page surface in search results — it's an
  // authorized-personnel surface that shouldn't show up on Google.
  robots: { index: false, follow: false },
}

const PRIMARY_TOOLS = [
  {
    icon: Newspaper,
    title: "Articles",
    description:
      "Approve, edit and feature stories before they hit the daily briefing.",
  },
  {
    icon: Users,
    title: "Users",
    description:
      "Search the user base, inspect accounts, and manage subscription tiers.",
  },
  {
    icon: Send,
    title: "Newsletter Studio",
    description:
      "Compose, preview and send the daily email digest to every subscriber.",
  },
  {
    icon: Activity,
    title: "Diagnostics",
    description:
      "Live health check across Firebase, Resend, AI providers and crons.",
  },
] as const

const SECONDARY_FEATURES = [
  {
    icon: Mail,
    title: "Newsletter subscribers",
    description: "See every active address and recover unsubscribes.",
  },
  {
    icon: Star,
    title: "Pro subscribers",
    description: "Track Pro tier members and renewal status in one view.",
  },
  {
    icon: Clock,
    title: "10-minute sessions",
    description: "Short-lived admin sessions, automatic re-auth when idle.",
  },
] as const

export default function AdminLandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      {/* Same ambient particle layer as the main marketing site so the
          two surfaces feel like one product family. */}
      <ErrorParticles />

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 shrink-0">
            <Image
              src="/images/logo.svg"
              alt="Estew"
              fill
              className="object-contain dark:invert"
              priority
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold leading-none text-foreground">
              estew
            </span>
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Admin
            </span>
          </div>
        </div>

        <Link
          href="/admin-controls"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Open Admin Panel
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center px-6 pb-16 pt-16 md:pt-24">
        {/* Restricted access pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-sans text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span>Restricted access · Authorized personnel only</span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 max-w-3xl text-balance text-center text-4xl font-semibold leading-tight text-foreground md:text-6xl md:leading-[1.05]">
          Mission control for{" "}
          <span className="text-primary">Estew.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="mb-10 max-w-xl text-pretty text-center text-base text-muted-foreground md:text-lg"
          style={{ lineHeight: 1.7 }}
        >
          Curate the feed, manage subscribers, and ship the daily newsletter —
          all from one secure admin console.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/admin-controls"
            className="press-effect flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open Admin Panel
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <span className="font-sans text-xs text-muted-foreground">
            Sessions last 10 minutes for security
          </span>
        </div>
      </main>

      {/* ── Primary tools (4-up grid) ─────────────────────────────── */}
      <section className="relative z-10 px-6 py-16 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-6 bg-primary" />
            <span className="font-sans text-xs font-medium uppercase tracking-wider text-primary">
              Your toolkit
            </span>
          </div>

          <h2 className="mb-12 text-2xl font-semibold text-foreground md:text-3xl">
            Everything you need to run the day.
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRIMARY_TOOLS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/30"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p
                  className="text-sm text-muted-foreground"
                  style={{ lineHeight: 1.6 }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Secondary features (3-up row) ─────────────────────────── */}
      <section className="relative z-10 px-6 py-12 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 md:grid-cols-3">
            {SECONDARY_FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security notice ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-16 md:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:flex-row md:items-center md:p-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheck
                size={22}
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-base font-semibold text-foreground">
                Every action is logged.
              </h3>
              <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                The admin panel runs on short-lived sessions and records every
                privileged action against a verified admin identity. Don&apos;t
                share credentials — request a separate account from the team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="mb-5 text-xl font-semibold text-foreground md:text-2xl">
            Ready to take the wheel?
          </h2>
          <Link
            href="/admin-controls"
            className="press-effect inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in to continue
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      {/* Standalone admin footer — intentionally has NO links to the
          public marketing site or the consumer app, per the brief
          ("nothing should be connected to main app from there"). */}
      <footer className="relative z-10 border-t border-border/60 px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <div className="relative h-5 w-5 shrink-0">
              <Image
                src="/images/logo.svg"
                alt=""
                fill
                className="object-contain dark:invert"
              />
            </div>
            <span className="font-sans text-xs text-muted-foreground">
              © {new Date().getFullYear()} Estew Admin. All rights reserved.
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Restricted access
          </span>
        </div>
      </footer>
    </div>
  )
}
