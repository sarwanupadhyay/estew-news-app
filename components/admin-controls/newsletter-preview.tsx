"use client"

import { ImageOff } from "lucide-react"
import type { Newsletter, NewsletterArticle } from "@/lib/newsletter-html"

/**
 * Admin preview rendered in the actual editorial magazine palette so the
 * admin sees exactly what the recipient receives in their inbox.
 * (Inline colors are intentional — this is meant to look identical to the
 * email and not adopt the dark app theme.)
 */
const C = {
  bg: "#F5F0E6",
  card: "#FFFFFF",
  ink: "#0A0A0A",
  text: "#1A1A1A",
  muted: "#6B6B6B",
  border: "#E5E0D5",
  accent: "#ED4E2B",
}

export function NewsletterPreview({ newsletter }: { newsletter: Newsletter }) {
  const formattedDate = new Date(newsletter.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const formattedShort = new Date(newsletter.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const firstSection = newsletter.sections.find((s) => s.articles.length > 0)
  const heroArticle = firstSection?.articles[0]
  const heroSectionTitle = firstSection?.title || "Top Story"
  const remaining = newsletter.sections
    .map((s, i) => (i === 0 ? { ...s, articles: s.articles.slice(1) } : s))
    .filter((s) => s.articles.length > 0)

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Email Preview
        </div>
        <div className="text-xs text-muted-foreground">{formattedDate}</div>
      </div>

      <div style={{ background: C.bg }} className="px-0 py-0">
        <div className="mx-auto" style={{ maxWidth: 640 }}>
          {/* Header */}
          <div style={{ background: C.ink, padding: "18px 32px 28px" }}>
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: "#A1A1AA",
                  textTransform: "uppercase",
                }}
              >
                ESTEW INTEL
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  color: "#A1A1AA",
                  textTransform: "uppercase",
                }}
              >
                {formattedShort}
              </span>
            </div>
            <h1
              style={{
                margin: "24px 0 6px",
                fontFamily: "Georgia, 'Fraunces', serif",
                fontSize: 64,
                lineHeight: 1,
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.025em",
              }}
            >
              ESTEW<span style={{ color: C.accent }}>.</span>
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.18em",
                color: "#9CA3AF",
                textTransform: "uppercase",
              }}
            >
              AI &amp; Technology Intelligence · Daily Briefing
            </p>
          </div>

          {/* Red rule */}
          <div style={{ height: 3, background: C.accent }} />

          {/* Content */}
          <div style={{ padding: 32 }}>
            <p style={{ margin: 0, fontSize: 13, color: C.muted }}>
              {formattedDate}
            </p>
            <p style={{ margin: "8px 0 18px", fontSize: 15, color: C.text }}>
              Hi there,
            </p>

            {newsletter.intro && (
              <p
                style={{
                  margin: "0 0 24px",
                  fontFamily: "Georgia, 'Fraunces', serif",
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: C.text,
                  fontStyle: "italic",
                }}
              >
                {newsletter.intro}
              </p>
            )}

            <h2
              style={{
                margin: "8px 0 28px",
                fontFamily: "Georgia, 'Fraunces', serif",
                fontSize: 22,
                lineHeight: 1.3,
                fontWeight: 600,
                color: C.text,
              }}
            >
              {newsletter.subject}
            </h2>

            {/* Hero */}
            {heroArticle && (
              <>
                <SectionLabel>{heroSectionTitle}</SectionLabel>
                <div
                  style={{
                    margin: "12px 0 36px",
                    background: C.card,
                    border: `1px solid ${C.border}`,
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2"
                >
                  <div style={{ padding: 24 }}>
                    <ImageBlock
                      src={heroArticle.imageUrl}
                      alt={heroArticle.headline}
                    />
                  </div>
                  <div style={{ padding: "24px 24px 24px 0" }}>
                    <p
                      style={{
                        margin: "0 0 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        color: C.accent,
                        textTransform: "uppercase",
                      }}
                    >
                      {heroArticle.source}
                    </p>
                    <h3
                      style={{
                        margin: "0 0 14px",
                        fontFamily: "Georgia, 'Fraunces', serif",
                        fontSize: 28,
                        lineHeight: 1.15,
                        fontWeight: 700,
                        color: C.text,
                        letterSpacing: "-0.012em",
                      }}
                    >
                      {heroArticle.headline}
                    </h3>
                    <p
                      style={{
                        margin: "0 0 20px",
                        fontFamily: "Georgia, 'Fraunces', serif",
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: C.text,
                      }}
                    >
                      {heroArticle.summary}
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        color: C.text,
                        textTransform: "uppercase",
                        border: `1px solid ${C.text}`,
                        padding: "10px 18px",
                      }}
                    >
                      Read full story →
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Sections */}
            {remaining.map((section) => (
              <div key={section.title} style={{ margin: "0 0 36px" }}>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24 }}>
                  <SectionLabel>{section.title}</SectionLabel>
                  {section.description && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontFamily: "Georgia, 'Fraunces', serif",
                        fontSize: 14,
                        color: C.muted,
                        fontStyle: "italic",
                      }}
                    >
                      {section.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {section.articles.map((a, i) => (
                    <ArticleCard key={`${section.title}-${i}`} article={a} />
                  ))}
                </div>
              </div>
            ))}

            {/* AI Tool — full-width hero card with a blue accent strip so
                it visually breaks from the editorial flow and mirrors the
                same treatment recipients see in the email. */}
            {newsletter.aiToolOfDay && (
              <AiToolCard tool={newsletter.aiToolOfDay} />
            )}

            {/* CTA */}
            <div
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: `1px solid ${C.border}`,
                textAlign: "center",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: C.ink,
                  color: "#FFFFFF",
                  padding: "14px 32px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Read more on Estew
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: C.ink, padding: "36px 32px" }}>
            <h2
              style={{
                margin: "0 0 8px",
                fontFamily: "Georgia, 'Fraunces', serif",
                fontSize: 36,
                lineHeight: 1,
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              ESTEW<span style={{ color: C.accent }}>.</span>
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 12,
                lineHeight: 1.6,
                color: "#9CA3AF",
              }}
            >
              AI &amp; Technology Intelligence — Published daily for builders, founders &amp; investors.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: "0.06em",
                color: "#9CA3AF",
              }}
            >
              <span style={{ textDecoration: "underline" }}>Archive</span>
              &nbsp;·&nbsp;
              <span style={{ textDecoration: "underline" }}>View online</span>
              &nbsp;·&nbsp;
              <span style={{ textDecoration: "underline" }}>Unsubscribe</span>
              &nbsp;·&nbsp;
              <span style={{ textDecoration: "underline" }}>Privacy</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.18em",
        color: C.accent,
        textTransform: "uppercase",
      }}
    >
      {children}
    </p>
  )
}

function ArticleCard({ article }: { article: NewsletterArticle }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <ImageBlock src={article.imageUrl} alt={article.headline} cover />
      <div style={{ padding: "16px 18px 18px" }}>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: C.accent,
            textTransform: "uppercase",
          }}
        >
          {article.source}
        </p>
        <h4
          style={{
            margin: "0 0 10px",
            fontFamily: "Georgia, 'Fraunces', serif",
            fontSize: 18,
            lineHeight: 1.25,
            fontWeight: 700,
            color: C.text,
          }}
        >
          {article.headline}
        </h4>
        <p
          style={{
            margin: "0 0 10px",
            fontFamily: "Georgia, 'Fraunces', serif",
            fontSize: 14,
            lineHeight: 1.55,
            color: C.text,
          }}
        >
          {article.summary}
        </p>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: C.text,
            textTransform: "uppercase",
          }}
        >
          Read more →
        </span>
      </div>
    </div>
  )
}

function AiToolCard({
  tool,
}: {
  tool: NonNullable<Newsletter["aiToolOfDay"]>
}) {
  // Blue accent palette — kept inline (not in C) because this card is the
  // only place in the editorial layout that uses blue.
  const BLUE = "#2563EB"
  const BLUE_DARK = "#1D4ED8"
  const BLUE_TINT = "#EFF5FF"
  const BLUE_MUTED = "#DBEAFE"

  return (
    <div style={{ margin: "0 0 36px" }}>
      <div
        style={{
          background: BLUE_TINT,
          border: `1px solid ${BLUE}`,
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        {/* Blue header strip */}
        <div
          style={{
            background: BLUE,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "#FFFFFF",
              textTransform: "uppercase",
            }}
          >
            ★ AI Tool of the Day
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: BLUE_MUTED,
              textTransform: "uppercase",
            }}
          >
            Sponsored Pick
          </span>
        </div>

        {/* Hero image — fills the full card width with a clean 16:9 ratio
            so the image is never the tiny thumbnail it used to be. */}
        <ImageBlock src={tool.imageUrl} alt={tool.name} cover />

        {/* Body */}
        <div style={{ padding: 24, background: BLUE_TINT }}>
          <h4
            style={{
              margin: "0 0 10px",
              fontFamily: "Georgia, 'Fraunces', serif",
              fontSize: 26,
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            {tool.name}
          </h4>
          <p
            style={{
              margin: "0 0 18px",
              fontFamily: "Georgia, 'Fraunces', serif",
              fontSize: 15,
              lineHeight: 1.6,
              color: C.text,
            }}
          >
            {tool.description}
          </p>
          <span
            style={{
              display: "inline-block",
              background: BLUE,
              color: "#FFFFFF",
              padding: "12px 22px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              borderRadius: 4,
              border: `1px solid ${BLUE_DARK}`,
            }}
          >
            Try it →
          </span>
        </div>
      </div>
    </div>
  )
}

function ImageBlock({
  src,
  alt,
  cover,
  square,
}: {
  src?: string
  alt: string
  cover?: boolean
  square?: boolean
}) {
  const aspect = square
    ? { aspectRatio: "1 / 1" as const }
    : cover
      ? { aspectRatio: "16 / 9" as const }
      : { aspectRatio: "4 / 3" as const }

  if (!src) {
    return (
      <div
        style={{ ...aspect, background: C.border }}
        className="flex w-full items-center justify-center"
      >
        <ImageOff size={28} strokeWidth={1.25} color="#9CA3AF" />
      </div>
    )
  }
  return (
    <div style={{ ...aspect, background: C.border }} className="w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="block h-full w-full object-cover"
        loading="lazy"
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.display = "none"
        }}
      />
    </div>
  )
}
