import { NextResponse } from "next/server"
import { createHash } from "node:crypto"
import { getAdminDb } from "@/lib/firebase-admin"

/**
 * AI summary endpoint.
 * - Uses OpenRouter (https://openrouter.ai) so we are not locked to a single
 *   provider. Set OPENROUTER_API_KEY to enable real summaries.
 * - Caches every successful summary in the Firestore `article_summaries`
 *   collection, keyed by a SHA-256 hash of the article URL. Subsequent Pro
 *   users requesting the same article hit the cache and get an instant
 *   response.
 * - Always falls back to the original article excerpt on any failure so the
 *   user never sees a broken state.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

// Free + cheap model on OpenRouter that handles short editorial summaries
// well. Override with SUMMARY_MODEL env if you want to swap providers.
const DEFAULT_MODEL = "google/gemini-2.5-flash-lite"

const TTL_DAYS = 30

function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex")
}

async function readFromCache(
  cacheKey: string,
): Promise<{ aiSummary: string; cachedAt: string } | null> {
  const db = getAdminDb()
  if (!db) return null
  try {
    const doc = await db.collection("article_summaries").doc(cacheKey).get()
    if (!doc.exists) return null
    const data = doc.data() as { aiSummary?: string; cachedAt?: string } | undefined
    if (!data?.aiSummary || !data.cachedAt) return null
    // Expire cache entries after TTL_DAYS so summaries don't go stale forever
    const ageMs = Date.now() - new Date(data.cachedAt).getTime()
    if (ageMs > TTL_DAYS * 24 * 60 * 60 * 1000) return null
    return { aiSummary: data.aiSummary, cachedAt: data.cachedAt }
  } catch (err) {
    console.error("[v0] summary cache read error:", err)
    return null
  }
}

async function writeToCache(
  cacheKey: string,
  payload: {
    aiSummary: string
    title: string
    url: string
    model: string
  },
): Promise<void> {
  const db = getAdminDb()
  if (!db) return
  try {
    await db.collection("article_summaries").doc(cacheKey).set({
      ...payload,
      cachedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[v0] summary cache write error:", err)
  }
}

export async function POST(request: Request) {
  const { title, summary, url } = (await request.json()) as {
    title?: string
    summary?: string
    url?: string
  }

  const safeTitle = (title || "").trim()
  const safeSummary = (summary || "").trim()
  const safeUrl = (url || "").trim()

  if (!safeUrl) {
    return NextResponse.json({
      aiSummary: safeSummary || "No summary available.",
      source: "no_url",
    })
  }

  const cacheKey = hashUrl(safeUrl)

  // 1) Cache lookup — every Pro user reading the same article shares this
  const cached = await readFromCache(cacheKey)
  if (cached) {
    return NextResponse.json({
      aiSummary: cached.aiSummary,
      source: "cache",
      cachedAt: cached.cachedAt,
    })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      aiSummary: safeSummary || "No summary available.",
      source: "no_api_key",
    })
  }

  const model = process.env.SUMMARY_MODEL || DEFAULT_MODEL

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // OpenRouter recommends these so requests are attributed correctly
        "HTTP-Referer": "https://estew.xyz",
        "X-Title": "Estew",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a concise tech news editor. Summarize articles in 2-3 crisp sentences. Be factual, neutral, and highlight the key takeaway. No filler words. No marketing tone. Do not start with 'This article'.",
          },
          {
            role: "user",
            content: `Summarize this tech article:\n\nTitle: ${safeTitle}\nExcerpt: ${safeSummary}\nSource: ${safeUrl}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      if (res.status === 429) {
        console.warn("[v0] OpenRouter rate limited:", errText.slice(0, 200))
        return NextResponse.json({
          aiSummary: safeSummary || "No summary available.",
          source: "rate_limited",
        })
      }
      console.error(`[v0] OpenRouter ${res.status}:`, errText.slice(0, 300))
      return NextResponse.json({
        aiSummary: safeSummary || "No summary available.",
        source: "api_error",
      })
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const aiSummary = data.choices?.[0]?.message?.content?.trim()

    if (!aiSummary) {
      return NextResponse.json({
        aiSummary: safeSummary || "No summary available.",
        source: "empty_response",
      })
    }

    // 2) Persist to Firestore so the next user gets it instantly
    await writeToCache(cacheKey, {
      aiSummary,
      title: safeTitle,
      url: safeUrl,
      model,
    })

    return NextResponse.json({ aiSummary, source: "openrouter", model })
  } catch (error) {
    console.error("[v0] summarization error:", error)
    return NextResponse.json({
      aiSummary: safeSummary || "No summary available.",
      source: "fallback",
    })
  }
}
