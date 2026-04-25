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

async function fetchRecentArticles(): Promise<{ articles: RawArticle[]; error?: string }> {
  const dayAgoMs = Date.now() - 24 * 60 * 60 * 1000

  const db = getAdminDb()
  if (!db) {
    return {
      articles: [],
      error:
        "Firestore is not configured. Please check your FIREBASE_SERVICE_ACCOUNT_KEY environment variable.",
    }
  }

  try {
    const snap = await db
      .collection("articles")
      .orderBy("publishedAt", "desc")
      .limit(80)
      .get()

    const fromDb: RawArticle[] = snap.docs
      .map((d) => {
        const x = d.data()
        const publishedAt =
          typeof x.publishedAt === "string"
            ? x.publishedAt
            : x.publishedAt?.toDate?.()?.toISOString() ?? ""
        return {
          title: x.title || "",
          summary: x.summary || x.description || "",
          url: x.originalUrl || x.url || "",
          source: x.sourceName || x.source || "Unknown",
          category: x.category || "Other",
          publishedAt,
        }
      })
      .filter((a) => a.title && a.url)

    const recent = fromDb.filter(
      (a) => a.publishedAt && new Date(a.publishedAt).getTime() >= dayAgoMs,
    )

    // Prefer last-24h, but fall back to most recent stored articles if DB is sparse
    const articles = recent.length >= 8 ? recent : fromDb.slice(0, 30)
    return { articles }
  } catch (err) {
    console.error("[v0] Firestore fetch error:", err)
    return {
      articles: [],
      error: "Failed to read articles from Firestore: " + (err as Error).message,
    }
  }
}

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { articles, error: fetchError } = await fetchRecentArticles()

  if (fetchError) {
    return NextResponse.json({ error: fetchError }, { status: 503 })
  }

  if (articles.length === 0) {
    return NextResponse.json(
      {
        error:
          "No articles found in Firestore. Please ingest fresh articles into the 'articles' collection before generating a newsletter.",
      },
      { status: 503 },
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
