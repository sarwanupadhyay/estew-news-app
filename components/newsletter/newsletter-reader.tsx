"use client"

import Link from "next/link"
import { ImageOff } from "lucide-react"

interface Article {
  headline: string
  summary: string
  link: string
  source: string
  imageUrl?: string
}

interface Section {
  title: string
  description?: string
  articles: Article[]
}

interface AiTool {
  name?: string
  url?: string
  description?: string
  imageUrl?: string
}

export interface ReaderNewsletter {
  id: string
  date: string
  subject: string
  intro?: string
  sections: Section[]
  aiToolOfDay?: AiTool | null
}

/**
 * Editorial magazine-style render of a newsletter, in the app's dark theme.
 * Matches the visual language of the email (red small-caps section labels,
 * Fraunces serif headlines, image-led cards) so /newsletter/[id] feels like
 * the same artifact the user receives in their inbox.
 */
export function NewsletterReader({
  newsletter,
}: {
  newsletter: ReaderNewsletter
}) {
  const formattedDate = formatLongDate(newsletter.date)
  const formattedShort = formatShort(newsletter.date)

  // First article of the first section becomes the hero, like the email does.
  const firstSection = newsletter.sections[0]
  const heroArticle = firstSection?.articles?.[0]
  const heroSectionTitle = firstSection?.title || "Top Story"

  // Remaining articles per section (skip the hero article).
  const remainingSections: Section[] = newsletter.sections
    .map((s, i) => (i === 0 ? { ...s, articles: s.articles.slice(1) } : s))
    .filter((s) => s.articles.length > 0)

  return (
    <article className="mx-auto max-w-3xl px-0 pb-20">
      {/* Magazine masthead */}
      <header className="mt-2 px-5 pb-7 pt-6 sm:px-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Estew Intel
          </span>
          <span className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {formattedShort}
          </span>
        </div>
        <h1 className="mt-6 font-serif text-[56px] font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-[72px]">
          ESTEW<span className="text-destructive">.</span>
        </h1>
        <p className="mt-2 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          AI &amp; Technology Intelligence · Daily Briefing
        </p>
        <div className="mt-5 h-[3px] w-full bg-destructive" aria-hidden="true" />
      </header>

      {/* Issue header */}
      <div className="px-5 sm:px-8">
        <p className="font-sans text-[12px] text-muted-foreground">
          {formattedDate}
        </p>
        <h2 className="mt-3 font-serif text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
          {newsletter.subject}
        </h2>
        {newsletter.intro && (
          <p className="mt-4 font-serif text-[16px] italic leading-relaxed text-muted-foreground">
            {newsletter.intro}
          </p>
        )}
      </div>

      {/* Hero article */}
      {heroArticle && (
        <section className="mt-10 px-5 sm:px-8">
          <SectionLabel>{heroSectionTitle}</SectionLabel>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid gap-0 sm:grid-cols-2">
              <ArticleImage
                src={heroArticle.imageUrl}
                alt={heroArticle.headline}
                className="aspect-[4/3] w-full sm:aspect-auto sm:h-full"
              />
              <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-destructive">
                  {heroArticle.source}
                </p>
                <a
                  href={heroArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <h3 className="font-serif text-[24px] font-bold leading-[1.15] tracking-tight text-foreground transition-colors group-hover:text-destructive sm:text-[28px]">
                    {heroArticle.headline}
                  </h3>
                </a>
                <p className="font-serif text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]">
                  {heroArticle.summary}
                </p>
                <a
                  href={heroArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex w-fit items-center justify-center border border-foreground px-4 py-2 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Read full story →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Remaining sections */}
      {remainingSections.map((section) => (
        <section key={section.title} className="mt-10 px-5 sm:px-8">
          <div className="border-t border-border pt-6">
            <SectionLabel>{section.title}</SectionLabel>
            {section.description && (
              <p className="mt-1 font-serif text-[14px] italic text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {section.articles.map((a, i) => (
              <ArticleCard key={`${section.title}-${i}`} article={a} />
            ))}
          </div>
        </section>
      ))}

      {/* AI Tool of the Day */}
      {newsletter.aiToolOfDay?.name && (
        <section className="mt-10 px-5 sm:px-8">
          <div className="border-t border-border pt-6">
            <SectionLabel>AI Tool of the Day</SectionLabel>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex flex-col gap-0 sm:flex-row">
              {newsletter.aiToolOfDay.imageUrl && (
                <div className="shrink-0 sm:w-[200px]">
                  <ArticleImage
                    src={newsletter.aiToolOfDay.imageUrl}
                    alt={newsletter.aiToolOfDay.name || "AI Tool"}
                    className="aspect-[4/3] w-full sm:aspect-square sm:h-full"
                  />
                </div>
              )}
              <div className="flex flex-col gap-3 p-6 sm:p-7">
                <h4 className="font-serif text-[20px] font-bold leading-tight tracking-tight text-foreground sm:text-[22px]">
                  {newsletter.aiToolOfDay.name}
                </h4>
                {newsletter.aiToolOfDay.description && (
                  <p className="font-serif text-[15px] leading-relaxed text-muted-foreground">
                    {newsletter.aiToolOfDay.description}
                  </p>
                )}
                {newsletter.aiToolOfDay.url && (
                  <a
                    href={newsletter.aiToolOfDay.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex w-fit items-center justify-center bg-foreground px-4 py-2 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90"
                  >
                    Try it →
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-secondary/40 px-5 py-10 sm:px-8">
        <h3 className="font-serif text-[40px] font-extrabold leading-none tracking-tight text-foreground">
          ESTEW<span className="text-destructive">.</span>
        </h3>
        <p className="mt-2 max-w-md font-sans text-[12px] leading-relaxed text-muted-foreground">
          AI &amp; Technology Intelligence — Published daily for builders,
          founders &amp; investors.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          <Link href="/newsletter" className="hover:text-foreground hover:underline">
            Archive
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/" className="hover:text-foreground hover:underline">
            Visit Estew
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/profile" className="hover:text-foreground hover:underline">
            Manage subscription
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            Privacy
          </Link>
        </div>
      </footer>
    </article>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors"
    >
      <ArticleImage
        src={article.imageUrl}
        alt={article.headline}
        className="aspect-[16/9] w-full"
      />
      <div className="flex flex-col gap-2 p-4">
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-destructive">
          {article.source}
        </p>
        <h4 className="font-serif text-[18px] font-bold leading-[1.2] tracking-tight text-foreground transition-colors group-hover:text-destructive">
          {article.headline}
        </h4>
        <p className="line-clamp-3 font-serif text-[14px] leading-relaxed text-muted-foreground">
          {article.summary}
        </p>
        <span className="mt-1 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-foreground">
          Read more →
        </span>
      </div>
    </a>
  )
}

function ArticleImage({
  src,
  alt,
  className = "",
}: {
  src?: string
  alt: string
  className?: string
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-secondary ${className}`}
      >
        <ImageOff size={28} strokeWidth={1.25} className="text-muted-foreground/40" />
      </div>
    )
  }
  return (
    <div className={`relative overflow-hidden bg-secondary ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.display = "none"
        }}
      />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-destructive">
      {children}
    </p>
  )
}

function formatLongDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function formatShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}
