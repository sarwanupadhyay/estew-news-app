"use client"

import { ExternalLink, Sparkles } from "lucide-react"
import type { Newsletter } from "@/lib/newsletter-html"

export function NewsletterPreview({ newsletter }: { newsletter: Newsletter }) {
  const formattedDate = new Date(newsletter.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Preview</div>
        <div className="text-xs text-muted-foreground">{formattedDate}</div>
      </div>

      <div className="bg-[#F8FAFC] px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <span className="inline-block rounded-full bg-[#7C3AED] px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
              Estew Daily
            </span>
            <p className="mt-3 text-xs text-[#64748B]">{formattedDate}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h1 className="mb-5 font-serif text-2xl font-bold leading-tight text-[#0F172A] sm:text-3xl">
              {newsletter.subject}
            </h1>

            <p className="mb-2 text-[15px] text-[#1E293B]">Hi there,</p>

            {newsletter.intro && (
              <p className="mb-7 text-[15px] leading-relaxed text-[#475569]">{newsletter.intro}</p>
            )}

            {newsletter.sections.map((section, sIdx) => (
              <div key={sIdx} className="mb-9 last:mb-0">
                <div className="mb-3 flex items-center gap-2 border-b-2 border-[#7C3AED] pb-2">
                  <span className="text-xl leading-none">{section.emoji}</span>
                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-[#1E293B]">
                    {section.title}
                  </h2>
                </div>
                {section.description && (
                  <p className="mb-3 text-[13px] italic text-[#64748B]">{section.description}</p>
                )}
                <div className="space-y-5">
                  {section.articles.map((article, aIdx) => (
                    <div
                      key={aIdx}
                      className={aIdx > 0 ? "border-t border-[#E2E8F0] pt-5" : ""}
                    >
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        {article.imageUrl && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={article.imageUrl || "/placeholder.svg"}
                            alt={article.headline}
                            className="mb-3 block aspect-[16/9] w-full rounded-xl object-cover"
                            loading="lazy"
                          />
                        )}
                        <h3 className="mb-2 font-serif text-lg font-semibold leading-snug text-[#0F172A] group-hover:text-[#7C3AED]">
                          {article.headline}
                        </h3>
                        <p className="mb-2 text-sm leading-relaxed text-[#475569]">
                          {article.summary}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#7C3AED]">
                          {article.source} — Read more
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {newsletter.aiToolOfDay && (
              <div className="my-8 rounded-2xl border border-[#DDD6FE] bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] p-6">
                <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#7C3AED]">
                  <Sparkles className="h-3 w-3" />
                  AI Tool of the Day
                </div>
                {newsletter.aiToolOfDay.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={newsletter.aiToolOfDay.imageUrl || "/placeholder.svg"}
                    alt={newsletter.aiToolOfDay.name}
                    className="mb-4 block aspect-[16/9] w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                )}
                <h3 className="mb-2 font-serif text-xl font-bold text-[#0F172A]">
                  {newsletter.aiToolOfDay.name}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-[#475569]">
                  {newsletter.aiToolOfDay.description}
                </p>
                <a
                  href={newsletter.aiToolOfDay.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg bg-[#7C3AED] px-5 py-2.5 text-[13px] font-semibold text-white"
                >
                  Try it out →
                </a>
              </div>
            )}

            <div className="mt-8 border-t border-[#E2E8F0] pt-6 text-center">
              <a
                href="https://estew.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-[#0F172A] px-7 py-3 text-sm font-semibold text-white"
              >
                Read more on Estew
              </a>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[#94A3B8]">
            <p>You&apos;re receiving this because you subscribed to Estew Daily.</p>
            <p className="mt-1">
              Sent with love by <strong className="text-[#475569]">Estew</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
