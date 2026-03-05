import { NextResponse } from "next/server"
import type { Article, Category } from "@/lib/types"
import { mockArticles } from "@/lib/mock-data"

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
  const apiKey = process.env.NEWS_API_KEY

  // If no API key, return mock data
  if (!apiKey) {
    let articles = mockArticles
    if (category !== "All") {
      articles = articles.filter((a) => a.category === category)
    }
    return NextResponse.json({ articles, source: "mock" })
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
        next: { revalidate: 600 }, // 10 min cache
      }
    )

    if (!res.ok) {
      throw new Error(`NewsAPI responded with ${res.status}`)
    }

    const data = await res.json()

    const categoryList: Category[] = ["AI", "Market", "Launches", "Apps", "Startups", "Products"]

    const articles: Article[] = (data.articles || []).map(
      (item: {
        title?: string
        description?: string
        url?: string
        source?: { name?: string }
        publishedAt?: string
        urlToImage?: string
      }, i: number) => ({
        id: `live-${i}-${Date.now()}`,
        title: item.title || "Untitled",
        summary: item.description || "",
        originalUrl: item.url || "#",
        sourceName: item.source?.name || "Unknown",
        sourceLogoUrl: `https://logo.clearbit.com/${new URL(item.url || "https://example.com").hostname}`,
        sourceAgencyId: "",
        publishedAt: item.publishedAt || new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        category: category === "All" ? categoryList[i % categoryList.length] : (category as Category),
        tags: [],
        isVerifiedSource: true,
        companyId: null,
        founderId: null,
        imageUrl:
          item.urlToImage ||
          `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80`,
        viewCount: Math.floor(Math.random() * 15000) + 1000,
      })
    )

    return NextResponse.json({ articles, source: "live" })
  } catch (error) {
    console.error("NewsAPI error:", error)
    // Fallback to mock data
    let articles = mockArticles
    if (category !== "All") {
      articles = articles.filter((a) => a.category === category)
    }
    return NextResponse.json({ articles, source: "mock-fallback" })
  }
}
