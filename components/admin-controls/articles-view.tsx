"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search, ExternalLink, Newspaper, Clock, Eye } from "lucide-react"

interface ArticleItem {
  id: string
  title: string
  summary: string
  sourceName: string
  category: string
  publishedAt: string | null
  createdAt: string | null
  imageUrl: string
  originalUrl: string
  viewCount: number
  storageTier: string
}

interface ArticlesResponse {
  articles: ArticleItem[]
  total: number
  recent24h: number
  shown: number
  error?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const CATEGORIES = ["all", "AI", "Market", "Launches", "Apps", "Startups", "Products"]

export function ArticlesView() {
  const [category, setCategory] = useState("all")
  const [search, setSearch] = useState("")

  const params = new URLSearchParams()
  params.set("limit", "100")
  if (category !== "all") params.set("category", category)
  if (search) params.set("search", search)

  const { data, isLoading } = useSWR<ArticlesResponse>(
    `/api/admin-controls/articles?${params.toString()}`,
    fetcher
  )

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Newspaper className="h-4 w-4 text-primary" /> Total in database
          </div>
          <div className="font-serif text-3xl font-bold text-foreground">
            {isLoading ? "..." : (data?.total ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Clock className="h-4 w-4 text-success" /> Last 24 hours
          </div>
          <div className="font-serif text-3xl font-bold text-foreground">
            {isLoading ? "..." : (data?.recent24h ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Eye className="h-4 w-4 text-info" /> Currently showing
          </div>
          <div className="font-serif text-3xl font-bold text-foreground">
            {isLoading ? "..." : (data?.shown ?? 0).toLocaleString()}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by title, source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-input py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {data?.error && (
          <div className="border-b border-border bg-warning/10 px-4 py-3 text-sm text-foreground">
            <span className="font-medium text-warning">Database notice:</span> {data.error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Article</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Source</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Category</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Published</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Loading articles from Firestore...
                  </td>
                </tr>
              )}
              {!isLoading && (data?.articles?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No articles found.
                  </td>
                </tr>
              )}
              {data?.articles?.map((article) => (
                <tr key={article.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="max-w-md px-4 py-3">
                    <div className="line-clamp-2 font-medium text-foreground">{article.title}</div>
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{article.summary}</div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{article.sourceName}</td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs">
                      {article.category}
                    </span>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-muted-foreground md:table-cell">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {article.originalUrl && (
                      <a
                        href={article.originalUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
