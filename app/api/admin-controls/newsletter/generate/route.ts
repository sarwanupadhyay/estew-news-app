import { NextResponse } from "next/server"
import { generateText, Output } from "ai"
import * as z from "zod"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb } from "@/lib/firebase-admin"

export const maxDuration = 60

const newsletterSchema = z.object({
  subject: z.string().describe("An engaging email subject line for today's newsletter, under 70 chars"),
  intro: z.string().describe("A short editorial intro paragraph (2-3 sentences) summarizing the day in tech"),
  sections: z
    .array(
      z.object({
        title: z.string().describe("Section title in Title Case"),
        emoji: z.string().describe("A single relevant emoji"),
        description: z.string().describe("A one-line description of what this section covers"),
        articles: z
          .array(
            z.object({
              headline: z.string().describe("A punchy, rewritten headline (max 90 chars)"),
              summary: z
                .string()
                .describe("A polished 2-3 sentence editorial summary written for the reader"),
              link: z.string().describe("The original article URL"),
              source: z.string().describe("The source publication name"),
            })
          )
          .min(1)
          .max(4),
      })
    )
    .min(4)
    .max(7)
    .describe(
      "5-7 sections covering: Top Story, AI Breakthroughs, Startup Radar, Product Launches, Market Pulse, Quick Bytes, Developer Insight"
    ),
})

interface RawArticle {
  title: string
  summary: string
  url: string
  source: string
  category: string
  publishedAt: string
}

async function fetchRecentArticles(): Promise<RawArticle[]> {
  const dayAgoMs = Date.now() - 24 * 60 * 60 * 1000

  // 1) Try Firestore first
  try {
    const db = getAdminDb()
    const snap = await db
      .collection("articles")
      .orderBy("publishedAt", "desc")
      .limit(60)
      .get()

    const fromDb: RawArticle[] = snap.docs
      .map((d) => {
        const x = d.data()
        return {
          title: x.title || "",
          summary: x.summary || "",
          url: x.originalUrl || "",
          source: x.sourceName || "Unknown",
          category: x.category || "Other",
          publishedAt: x.publishedAt || "",
        }
      })
      .filter(
        (a) => a.title && a.url && new Date(a.publishedAt).getTime() >= dayAgoMs
      )

    if (fromDb.length >= 8) return fromDb
  } catch (err) {
    console.error("[v0] Firestore fetch error:", err)
  }

  // 2) Fallback to live NewsAPI
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        "technology OR AI OR startup OR product launch"
      )}&sortBy=publishedAt&pageSize=40&language=en`,
      { headers: { "X-Api-Key": apiKey }, cache: "no-store" }
    )
    if (!res.ok) return []
    const data = await res.json()
    const articles: RawArticle[] = (data.articles || [])
      .filter((a: { url?: string; title?: string }) => a.url && a.title && a.url !== "[Removed]")
      .map(
        (a: {
          title: string
          description?: string
          url: string
          source?: { name?: string }
          publishedAt?: string
        }) => ({
          title: a.title,
          summary: a.description || "",
          url: a.url,
          source: a.source?.name || "Unknown",
          category: "Tech",
          publishedAt: a.publishedAt || new Date().toISOString(),
        })
      )
      .filter((a: RawArticle) => new Date(a.publishedAt).getTime() >= dayAgoMs)

    return articles
  } catch (err) {
    console.error("[v0] NewsAPI fetch error:", err)
    return []
  }
}

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const articles = await fetchRecentArticles()

  if (articles.length === 0) {
    return NextResponse.json(
      { error: "No articles available from the last 24 hours. Check your NewsAPI key or article feed." },
      { status: 503 }
    )
  }

  const articleListText = articles
    .slice(0, 40)
    .map(
      (a, i) =>
        `${i + 1}. [${a.source}] ${a.title}\n   URL: ${a.url}\n   Summary: ${a.summary}`
    )
    .join("\n\n")

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const systemPrompt = `You are the editor-in-chief of "Estew Daily", a premium tech newsletter read by founders, investors, and engineers.
Your tone is sharp, intelligent, and conversational - never corporate or clickbait.
You distill the day's tech news into a focused, beautifully written briefing.
Always rewrite headlines and summaries in your own voice. Never copy verbatim from the source.
Use only the articles provided - never fabricate news or URLs.`

  const userPrompt = `Date: ${today}

Below are tech articles from the last 24 hours. Curate them into Estew Daily for ${today}.

REQUIREMENTS:
- Pick 5-7 sections from: Top Story, AI Breakthroughs, Startup Radar, Product Launches, Market Pulse, Quick Bytes, Developer Insight
- "Top Story" must contain exactly 1 article (the single most important story of the day)
- Other sections should contain 2-4 articles each
- Use only articles from the list below - reference their exact URL in the link field
- Rewrite every headline and summary in a polished editorial voice
- Use single, relevant emojis for each section (e.g. 🤖 for AI, 🚀 for launches, 💸 for market, 🛠 for developer)
- Subject line should be punchy and reference the day's biggest theme

ARTICLES:
${articleListText}`

  try {
    const { output } = await generateText({
      model: "google/gemini-3-flash",
      output: Output.object({ schema: newsletterSchema }),
      system: systemPrompt,
      prompt: userPrompt,
    })

    return NextResponse.json({
      newsletter: {
        ...output,
        date: new Date().toISOString(),
        articleCount: articles.length,
      },
    })
  } catch (err) {
    console.error("[v0] Newsletter generation error:", err)
    return NextResponse.json(
      { error: "Failed to generate newsletter: " + (err as Error).message },
      { status: 500 }
    )
  }
}
