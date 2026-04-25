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

// Ordered list of OpenRouter models to try, top-to-bottom. The first one is
// the preferred model; if it returns a 4xx/5xx (model unavailable, rate-limit,
// quota exceeded, etc.) we transparently fall through to the next free model.
// All entries use the `:free` tier so this never bills against a paid plan.
const MODEL_CHAIN = [
  // Primary model requested by the operator. If OpenRouter returns 404
  // (model not found) or any other failure, the chain falls through.
  "google/gemma-4-31b-it:free",
  // Known-good free fallbacks (latest first) so summaries always get
  // generated even when the primary is unavailable or rate-limited.
  "google/gemma-3-27b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-2-9b-it:free",
] as const

const TTL_DAYS = 30

// Bumped whenever the summary FORMAT changes (e.g. switching from prose to
// bullets). This invalidates older cache entries automatically so users
// don't keep seeing the previous prose summaries we generated earlier.
const CACHE_VERSION = "v2-bullets"

const NO_SUMMARY = "No summary available."

function hashUrl(url: string): string {
  return createHash("sha256").update(`${CACHE_VERSION}:${url}`).digest("hex")
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
    return NextResponse.json({ aiSummary: NO_SUMMARY, source: "no_url" })
  }

  // If we don't have any meaningful source text to summarize, bail out early
  // rather than asking the model to hallucinate from just a title.
  const hasUsableContent = safeSummary.length >= 40

  const cacheKey = hashUrl(safeUrl)

  // 1) Cache lookup — every Pro user reading the same article shares this.
  // Cache key includes the format version so old prose summaries are skipped.
  const cached = await readFromCache(cacheKey)
  if (cached) {
    return NextResponse.json({
      aiSummary: cached.aiSummary,
      source: "cache",
      cachedAt: cached.cachedAt,
    })
  }

  if (!hasUsableContent) {
    return NextResponse.json({ aiSummary: NO_SUMMARY, source: "no_content" })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ aiSummary: NO_SUMMARY, source: "no_api_key" })
  }

  // Allow overriding the primary model via env, but always preserve the
  // free-tier fallback chain so a single failure doesn't break the feature.
  const overrideModel = process.env.SUMMARY_MODEL?.trim()
  const modelsToTry = overrideModel
    ? [overrideModel, ...MODEL_CHAIN.filter((m) => m !== overrideModel)]
    : [...MODEL_CHAIN]

  const systemPrompt = [
    "You are an editor for a tech news app.",
    "Your only job is to produce a short, scannable bullet-point summary of the article.",
    "",
    "Rules:",
    "- Output 2 or 3 bullet points. Never more, never fewer (2 is acceptable when the article is short).",
    "- Each bullet must be 1 short, plain-English sentence (max ~20 words).",
    "- Each bullet must start with the exact prefix '- ' (a hyphen and a space).",
    "- Do NOT use any other formatting: no markdown headers, no bold, no numbering, no emojis.",
    "- Do NOT echo the article verbatim. Rewrite it in your own words.",
    "- Be factual and neutral. No marketing language.",
    "- Do NOT start any bullet with 'This article', 'The article', 'It says', etc.",
    "- Cover the key fact, the why-it-matters, and (if space) the next step.",
  ].join("\n")

  const requestBody = {
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Summarize this article in 2-3 bullet points using the format described.\n\nTitle: ${safeTitle}\n\nArticle excerpt:\n${safeSummary}`,
      },
    ],
    max_tokens: 220,
    temperature: 0.2,
  }

  const attemptErrors: string[] = []

  for (const model of modelsToTry) {
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
        body: JSON.stringify({ model, ...requestBody }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        const snippet = errText.slice(0, 300)
        attemptErrors.push(`${model} → ${res.status}: ${snippet}`)
        // Retry with the next model in the chain on any non-2xx response
        // (404 model-not-found, 429 rate-limit, 402 quota, 5xx upstream, etc.)
        console.warn(`[v0] OpenRouter ${res.status} for ${model}:`, snippet)
        continue
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>
      }
      const raw = data.choices?.[0]?.message?.content?.trim()

      if (!raw) {
        attemptErrors.push(`${model} → empty response`)
        continue
      }

      // Force every model's response into a clean 2-3 bullet list.
      const aiSummary = normalizeBullets(raw)
      if (!aiSummary) {
        attemptErrors.push(`${model} → no usable bullets`)
        continue
      }

      // Persist to Firestore so the next user gets it instantly
      await writeToCache(cacheKey, {
        aiSummary,
        title: safeTitle,
        url: safeUrl,
        model,
      })

      return NextResponse.json({ aiSummary, source: "openrouter", model })
    } catch (error) {
      attemptErrors.push(`${model} → ${(error as Error).message}`)
      console.error(`[v0] summarization network error for ${model}:`, error)
      // Try the next model
      continue
    }
  }

  // Every free model failed — log every attempt for diagnostics. We
  // intentionally do NOT echo the article excerpt back here, because the
  // whole point of the AI summary is to be different from the source text.
  console.error("[v0] All summary models failed:", attemptErrors.join(" | "))
  return NextResponse.json({
    aiSummary: NO_SUMMARY,
    source: "all_models_failed",
    attempts: attemptErrors,
  })
}

/**
 * Force any model output into a clean, predictable bullet list.
 * - Strips markdown bold, numbering, leading asterisks, and stray prose.
 * - Re-prefixes every line with "- " so the client can render it as a list.
 * - Caps the result at 3 bullets and drops empties / over-long lines.
 * - Returns null when nothing usable can be salvaged.
 */
function normalizeBullets(raw: string): string | null {
  const cleaned = raw
    // Drop common preambles like "Here is the summary:" the model sometimes adds
    .replace(/^\s*(here(?:'s| is)|summary|sure|okay)[^\n]*:\s*/i, "")
    .trim()

  const lines = cleaned
    .split(/\r?\n+/)
    .map((line) =>
      line
        .trim()
        // Strip markdown bullet/number prefixes so we can re-add a uniform one
        .replace(/^[-*•·]\s+/, "")
        .replace(/^\d+[.)]\s+/, "")
        // Strip surrounding markdown bold/italics
        .replace(/^\*\*(.*)\*\*$/s, "$1")
        .replace(/^_(.*)_$/s, "$1")
        .trim(),
    )
    .filter((line) => line.length > 0)

  // If the model returned a single paragraph instead of bullets, split it
  // into sentences and use the first 2-3 as bullets.
  let bullets =
    lines.length >= 2
      ? lines
      : (cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned])
          .map((s) => s.trim())
          .filter(Boolean)

  bullets = bullets.filter((b) => b.length >= 8 && b.length <= 240).slice(0, 3)

  if (bullets.length < 2) return null

  return bullets.map((b) => `- ${b.replace(/^[-*•]\s*/, "")}`).join("\n")
}
