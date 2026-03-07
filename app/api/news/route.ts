import { NextResponse } from "next/server"
import type { Article, Category } from "@/lib/types"
import { mockArticles } from "@/lib/mock-data"
import { persistArticle, clearPersistenceCache } from "@/lib/article-storage"
import { getCachedFeed } from "@/lib/redis-cache"

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

  // If no API key, return mock data with stable IDs
  if (!apiKey) {
    let articles = mockArticles.map((a, i) => ({
      ...a,
      id: `mock_${a.originalUrl.replace(/[^a-z0-9]/gi, "_").substring(0, 30)}_${i}`,
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

    // Clear cache before batch processing
    clearPersistenceCache()

    // Build articles with temporary IDs first
    const rawArticles: Article[] = (data.articles || [])
      .filter((item: { url?: string }) => item.url && item.url !== "#")
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
          id: `temp_${i}`, // Temporary ID, will be replaced
          title: item.title || "Untitled",
          summary: item.description || "",
          originalUrl,
          sourceName: item.source?.name || "Unknown",
          sourceLogoUrl: `https://www.google.com/s2/favicons?domain=${new URL(originalUrl).hostname}&sz=64`,
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

    // Persist articles SEQUENTIALLY to prevent race conditions and overwrites
    const articlesWithIds: Article[] = []
    for (const article of rawArticles) {
      try {
        const persistedId = await persistArticle(article)
        articlesWithIds.push({
          ...article,
          id: persistedId,
        })
      } catch (error) {
        console.error("Failed to persist article:", article.title, error)
        // Still include the article with a unique fallback ID
        articlesWithIds.push({
          ...article,
          id: `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        })
      }
    }

    return { articles: articlesWithIds, source: "live" }
  } catch (error) {
    console.error("NewsAPI error:", error)
    // Fallback to mock data with stable IDs
    let articles = mockArticles.map((a, i) => ({
      ...a,
      id: `mock_${a.originalUrl.replace(/[^a-z0-9]/gi, "_").substring(0, 30)}_${i}`,
    }))
    if (category !== "All") {
      articles = articles.filter((a) => a.category === category)
    }
    return { articles, source: "mock-fallback" }
  }
}
