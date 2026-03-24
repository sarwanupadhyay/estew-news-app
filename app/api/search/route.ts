import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import type { Article } from "@/lib/types"
import { mockArticles, mockCompanies, mockAgencies } from "@/lib/mock-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const searchQuery = searchParams.get("q")?.toLowerCase() || ""
  const type = searchParams.get("type") || "articles"
  const source = searchParams.get("source")?.toLowerCase() || ""

  try {
    if (type === "articles") {
      return searchArticles(searchQuery, source)
    } else if (type === "companies") {
      return searchCompanies(searchQuery)
    } else if (type === "sources") {
      return searchSources(searchQuery)
    }

    return NextResponse.json({ results: [], message: "Invalid search type" })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 })
  }
}

async function searchArticles(searchQuery: string, source: string) {
  let articles: Article[] = []

  try {
    // Fetch articles from Firebase
    const articlesRef = collection(db, "articles")
    const q = query(articlesRef, orderBy("publishedAt", "desc"), limit(100))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      // Fallback to mock data if no articles in Firebase
      articles = mockArticles.map((a, i) => ({
        ...a,
        id: `mock_${a.originalUrl.replace(/[^a-z0-9]/gi, "_").substring(0, 30)}_${i}`,
      }))
    } else {
      articles = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Article[]
    }
  } catch (firebaseError) {
    console.error("Firebase query error, using mock data:", firebaseError)
    // Fallback to mock data
    articles = mockArticles.map((a, i) => ({
      ...a,
      id: `mock_${a.originalUrl.replace(/[^a-z0-9]/gi, "_").substring(0, 30)}_${i}`,
    }))
  }

  // Filter by source if provided
  if (source) {
    articles = articles.filter((article) => {
      const articleSource = article.sourceName?.toLowerCase() || ""
      const articleUrl = article.originalUrl?.toLowerCase() || ""
      return articleSource.includes(source) || articleUrl.includes(source)
    })
  }

  // Filter by search query
  if (searchQuery) {
    articles = articles.filter((article) => {
      const title = article.title?.toLowerCase() || ""
      const summary = article.summary?.toLowerCase() || ""
      const sourceName = article.sourceName?.toLowerCase() || ""
      const category = article.category?.toLowerCase() || ""
      const tags = (article.tags || []).join(" ").toLowerCase()

      return (
        title.includes(searchQuery) ||
        summary.includes(searchQuery) ||
        sourceName.includes(searchQuery) ||
        category.includes(searchQuery) ||
        tags.includes(searchQuery)
      )
    })
  }

  return NextResponse.json({
    results: articles.slice(0, 30),
    total: articles.length,
  })
}

function searchCompanies(searchQuery: string) {
  let results = mockCompanies

  if (searchQuery) {
    results = mockCompanies.filter((company) => {
      const searchableText = [company.name, company.description, company.category]
        .join(" ")
        .toLowerCase()
      return searchableText.includes(searchQuery)
    })
  }

  return NextResponse.json({
    results,
    total: results.length,
  })
}

function searchSources(searchQuery: string) {
  let results = mockAgencies

  if (searchQuery) {
    results = mockAgencies.filter((agency) => {
      const searchableText = [agency.name, ...agency.categoryFocus]
        .join(" ")
        .toLowerCase()
      return searchableText.includes(searchQuery)
    })
  }

  return NextResponse.json({
    results,
    total: results.length,
  })
}
