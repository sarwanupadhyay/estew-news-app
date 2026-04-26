import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TopHeader } from "@/components/estew/top-header"
import { BottomNav } from "@/components/estew/bottom-nav"

export const metadata = {
  title: "Story not found · Estew",
  description:
    "The page you're looking for isn't in today's briefing. It may have moved, expired, or never existed.",
}

export default function NotFound() {
  return (
    <div className="relative mx-auto min-h-screen max-w-[428px] bg-background">
      <TopHeader />

      {/* Subtle ambient glow behind the 404 to match the editorial vibe of
          the mockup. Sits behind everything, doesn't capture clicks. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-32 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]"
      />

      <main className="relative z-10 px-5 pb-32 pt-10 text-center">
        {/* Status pill */}
        <div className="mb-12 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-sans text-[11px] font-medium text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
            </span>
            Signal lost — 0 stories found at this URL
          </span>
        </div>

        {/* Big 404 — gradient-filled display type with a soft purple glow,
            mimics the "neon press" feel from the mockup. */}
        <h1
          className="select-none bg-gradient-to-b from-primary via-primary/60 to-primary/15 bg-clip-text font-serif text-[140px] font-black leading-none tracking-tight text-transparent"
          style={{ filter: "drop-shadow(0 10px 32px rgb(124 58 237 / 0.45))" }}
        >
          404
        </h1>

        {/* Headline */}
        <h2 className="mb-3 mt-2 text-balance font-sans text-2xl font-bold leading-tight text-foreground">
          {"This story "}
          <span className="text-primary">{"didn't make"}</span>
          {" the feed."}
        </h2>

        {/* Subtext */}
        <p className="mx-auto mb-10 max-w-[320px] text-pretty font-sans text-[13px] leading-relaxed text-muted-foreground">
          {
            "The page you're looking for isn't in today's briefing. It may have moved, expired, or never existed — kind of like that one startup that raised $200M and vanished."
          }
        </p>

        {/* Today's top story label */}
        <div className="mb-3 text-left font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Today&apos;s Top Story
        </div>

        {/* Fake editorial card — same visual language as a real article card
            so users feel like they're still inside the app. */}
        <article className="rounded-xl border border-border bg-card p-4 text-left">
          <div className="mb-3">
            <span className="inline-block rounded-md bg-primary/15 px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-primary">
              Breaking
            </span>
          </div>
          <h3 className="mb-3 font-sans text-base font-semibold leading-snug text-foreground">
            Page found at requested URL — full coverage inside
          </h3>

          {/* Skeleton bars — re-uses the app's existing shimmer animation
              so the loading effect matches real article placeholders. */}
          <div className="mb-4 space-y-2">
            <div className="h-2 w-full animate-shimmer rounded-full" />
            <div className="h-2 w-4/5 animate-shimmer rounded-full" />
          </div>

          {/* Meta line */}
          <div className="flex items-center gap-2 font-sans text-[11px] text-muted-foreground">
            <span>estew</span>
            <span className="text-muted-foreground/40">·</span>
            <span>Just now</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-medium text-destructive">Story not found</span>
          </div>
        </article>

        {/* Primary recovery CTA — gets users back to the working feed. */}
        <Link
          href="/"
          className="press-effect mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to today&apos;s feed
          <ArrowRight size={16} />
        </Link>
      </main>

      <BottomNav />
    </div>
  )
}
