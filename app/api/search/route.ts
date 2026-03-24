import { NextResponse } from "next/server"
import type { Article } from "@/lib/types"
import { mockArticles, mockCompanies, mockAgencies } from "@/lib/mock-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.toLowerCase() || ""
  const type = searchParams.get("type") || "articles" // articles, companies, sources
  const source = searchParams.get("source") // filter by source name

  if (!query && !source) {
    return NextResponse.json({ results: [], message: "No search query provided" })
  }

  try {
    if (type === "articles") {
      return searchArticles(query, source)
    } else if (type === "companies") {
      return searchCompanies(query)
    } else if (type === "sources") {
      return searchSources(query)
    }

    return NextResponse.json({ results: [], message: "Invalid search type" })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 })
  }
}

function searchArticles(query: string, source?: string | null) {
  let articles: Article[] = [...mockArticles]

  // Filter by source if provided
  if (source) {
    const sourceQuery = source.toLowerCase()
    articles = articles.filter((article) =>
      article.sourceName.toLowerCase().includes(sourceQuery)
    )
  }

  // Filter by search query (search in title, summary, tags, sourceName)
  if (query) {
    articles = articles.filter((article) => {
      const searchableText = [
        article.title,
        article.summary,
        article.sourceName,
        ...(article.tags || []),
      ]
        .join(" ")
        .toLowerCase()

      return searchableText.includes(query)
    })
  }

  return NextResponse.json({
    results: articles.slice(0, 20),
    total: articles.length,
    source: "mock",
  })
}

function searchCompanies(query: string) {
  let results = mockCompanies

  if (query) {
    results = mockCompanies.filter((company) => {
      const searchableText = [company.name, company.description, company.category]
        .join(" ")
        .toLowerCase()
      return searchableText.includes(query)
    })
  }

  return NextResponse.json({
    results,
    total: results.length,
  })
}

function searchSources(query: string) {
  let results = mockAgencies

  if (query) {
    results = mockAgencies.filter((agency) => {
      const searchableText = [agency.name, ...agency.categoryFocus]
        .join(" ")
        .toLowerCase()
      return searchableText.includes(query)
    })
  }

  return NextResponse.json({
    results,
    total: results.length,
  })
}
