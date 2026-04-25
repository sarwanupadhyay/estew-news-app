import { NextResponse } from "next/server"
import type { Article, Category } from "@/lib/types"
import { mockArticles } from "@/lib/mock-data"
import { getCachedFeed } from "@/lib/redis-cache"
import { persistArticlesAdmin } from "@/lib/article-storage-admin"

// Generate a stable, deterministic ID from URL using a hash function
// This ensures the same article always gets the same ID regardless of when it's fetched
function generateStableArticleId(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  const positiveHash = Math.abs(hash).toString(16)
  return `art_${positiveHash}`
}

const CATEGORY_QUERIES: Record<string, string> = {
  AI: "artificial intelligence OR GPT OR LLM OR machine learning",
  Market: "tech stocks OR nasdaq OR startup funding OR IPO",
  Launches: "product launch OR release OR announcement tech",
  Apps: "mobile app OR software release OR SaaS",
  Startups: "startup funding OR Y Combinator OR venture capital",
  Products: "consumer tech OR gadget OR hardware",
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || "All"

  // Use Redis cache for feed queries to reduce Firestore reads
  const cachedResult = await getCachedFeed(category, async () => {
    return fetchFeedData(category)
  })

  return NextResponse.json(cachedResult)
}

async function fetchFeedData(category: string) {
  const apiKey = process.env.NEWS_API_KEY

  // If no API key, return mock data with stable IDs based on URL hash
  if (!apiKey) {
    let articles = mockArticles.map((a) => ({
      ...a,
      id: generateStableArticleId(a.originalUrl),
    }))
    if (category !== "All") {
      articles = articles.filter((a) => a.category === category)
    }
    return { articles, source: "mock" }
  }

  try {
    const query =
      category === "All"
        ? "technology OR AI OR startup"
        : CATEGORY_QUERIES[category] || "technology"

    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=20&language=en`,
      {
        headers: { "X-Api-Key": apiKey },
        next: { revalidate: 600 },
      }
    )

    if (!res.ok) {
      throw new Error(`NewsAPI responded with ${res.status}`)
    }

    const data = await res.json()
    const categoryList: Category[] = ["AI", "Market", "Launches", "Apps", "Startups", "Products"]

    // Build articles with STABLE IDs based on URL hash
    // This ensures the same article always gets the same ID, enabling proper save/unsave functionality
    // Filter out PyPI.org and other unwanted sources
    const articles: Article[] = (data.articles || [])
      .filter((item: { url?: string; source?: { name?: string } }) => {
        if (!item.url || item.url === "#") return false
        // Exclude PyPI.org articles
        const url = item.url.toLowerCase()
        const sourceName = (item.source?.name || "").toLowerCase()
        if (url.includes("pypi.org") || sourceName.includes("pypi")) return false
        return true
      })
      .map((item: {
        title?: string
        description?: string
        url?: string
        source?: { name?: string }
        publishedAt?: string
        urlToImage?: string
      }, i: number) => {
        const originalUrl = item.url || `https://example.com/article/${Date.now()}_${i}`
        return {
          // Use stable, URL-based ID - this is critical for saved articles to work
          id: generateStableArticleId(originalUrl),
          title: item.title || "Untitled",
          summary: item.description || "",
          originalUrl,
          sourceName: item.source?.name || "Unknown",
          sourceLogoUrl: `https://icons.duckduckgo.com/ip3/${new URL(originalUrl).hostname}.ico`,
          sourceAgencyId: "",
          publishedAt: item.publishedAt || new Date().toISOString(),
          fetchedAt: new Date().toISOString(),
          category: category === "All" ? categoryList[i % categoryList.length] : (category as Category),
          tags: [],
          isVerifiedSource: true,
          companyId: null,
          founderId: null,
          imageUrl: item.urlToImage || `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80`,
          viewCount: Math.floor(Math.random() * 15000) + 1000,
        }
      })

    // Persist live articles to Firestore so the admin panel and newsletter
    // generator can read them. Uses Firebase Admin SDK with batched writes.
    // Stable IDs ensure re-fetches deduplicate instead of creating new docs.
    try {
      const result = await persistArticlesAdmin(articles)
      console.log(
        `[v0] Persisted ${result.written}/${articles.length} articles to Firestore` +
          (result.error ? ` (warning: ${result.error})` : ""),
      )
    } catch (err) {
      // Never let persistence errors break the user-facing feed.
      console.error("[v0] Article persistence failed (non-fatal):", err)
    }

    return { articles, source: "live" }
  } catch (error) {
    console.error("NewsAPI error:", error)
    // Fallback to mock data with stable URL-based IDs
    let articles = mockArticles.map((a) => ({
      ...a,
      id: generateStableArticleId(a.originalUrl),
    }))
    if (category !== "All") {
      articles = articles.filter((a) => a.category === category)
    }
    return { articles, source: "mock-fallback" }
  }
}
