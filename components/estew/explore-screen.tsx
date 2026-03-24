"use client"

import { Search, X, TrendingUp, Building2, Newspaper, Clock } from "lucide-react"
import { trendingTopics, CATEGORIES, mockCompanies, mockAgencies } from "@/lib/mock-data"
import { formatViewCount } from "@/lib/time"
import { timeAgo } from "@/lib/time"
import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import type { Article, Company, Agency } from "@/lib/types"
import { useAppStore } from "@/lib/store"

type Segment = "Topics" | "Companies" | "Sources"

interface SearchResults {
  articles: Article[]
  companies: Company[]
  sources: Agency[]
}

export function ExploreScreen() {
  const { setSelectedArticle, addArticle } = useAppStore()
  const [segment, setSegment] = useState<Segment>("Topics")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResults>({
    articles: [],
    companies: [],
    sources: [],
  })
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [followedCompanies, setFollowedCompanies] = useState<Set<string>>(new Set())
  const [followedSources, setFollowedSources] = useState<Set<string>>(new Set())

  // Handle article click - open in detail view
  const handleArticleClick = (article: Article) => {
    addArticle(article) // Add to store for lookup
    setSelectedArticle(article) // Open in ArticleDetail modal
  }

  // Debounced search
  const performSearch = useCallback(async (query: string, source?: string | null) => {
    if (!query && !source) {
      setSearchResults({ articles: [], companies: [], sources: [] })
      return
    }

    setIsSearching(true)
    try {
      const articleParams = new URLSearchParams()
      if (query) articleParams.set("q", query)
      if (source) articleParams.set("source", source)
      articleParams.set("type", "articles")
      
      const [articlesRes, companiesRes, sourcesRes] = await Promise.all([
        fetch(`/api/search?${articleParams}`),
        query ? fetch(`/api/search?q=${encodeURIComponent(query)}&type=companies`) : Promise.resolve(null),
        query ? fetch(`/api/search?q=${encodeURIComponent(query)}&type=sources`) : Promise.resolve(null),
      ])

      const articlesData = await articlesRes.json()
      const companiesData = companiesRes ? await companiesRes.json() : { results: [] }
      const sourcesData = sourcesRes ? await sourcesRes.json() : { results: [] }

      setSearchResults({
        articles: articlesData.results || [],
        companies: companiesData.results || [],
        sources: sourcesData.results || [],
      })
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || selectedSource) {
        performSearch(searchQuery, selectedSource)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedSource, performSearch])

  const clearSearch = () => {
    setSearchQuery("")
    setSelectedSource(null)
    setSearchResults({ articles: [], companies: [], sources: [] })
    setIsSearchFocused(false)
  }

  const handleSourceFilter = (sourceName: string) => {
    setSelectedSource(sourceName)
    setIsSearchFocused(true)
    performSearch(searchQuery, sourceName)
  }

  const toggleFollowCompany = (companyId: string) => {
    setFollowedCompanies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(companyId)) {
        newSet.delete(companyId)
      } else {
        newSet.add(companyId)
      }
      return newSet
    })
  }

  const toggleFollowSource = (sourceId: string) => {
    setFollowedSources(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId)
      } else {
        newSet.add(sourceId)
      }
      return newSet
    })
  }

  const hasSearchResults = searchResults.articles.length > 0 || 
    searchResults.companies.length > 0 || 
    searchResults.sources.length > 0

  const showSearchResults = isSearchFocused && (searchQuery || selectedSource)

  return (
    <div className="flex flex-col bg-background pb-20">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border bg-card px-4 pb-3 pt-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <div className="relative h-6 w-6">
          <Image src="/images/logo.svg" alt="Estew" fill className="object-contain dark:invert" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Explore</h1>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3">
        <div className={`flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 transition-colors ${
          isSearchFocused ? "border-primary" : "border-border"
        }`}>
          <Search size={16} className="shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search articles, companies, sources..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {(searchQuery || selectedSource) && (
            <button onClick={clearSearch} className="shrink-0">
              <X size={16} className="text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Source filter badge */}
        {selectedSource && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtering by:</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {selectedSource}
              <button onClick={() => { setSelectedSource(null); performSearch(searchQuery, null) }}>
                <X size={12} />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showSearchResults && (
        <div className="flex-1 px-4">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : hasSearchResults ? (
            <div className="space-y-6">
              {/* Article Results */}
              {searchResults.articles.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Newspaper size={14} />
                    Articles ({searchResults.articles.length})
                  </h3>
                  <div className="space-y-2">
                    {searchResults.articles.slice(0, 15).map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleArticleClick(article)}
                        className="flex w-full gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50 active:scale-[0.98]"
                      >
                        {article.imageUrl && (
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={article.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              crossOrigin="anonymous"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="line-clamp-2 text-sm font-medium text-foreground">
                            {article.title}
                          </h4>
                          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">{article.sourceName}</span>
                            <span className="text-muted-foreground/50">-</span>
                            <Clock size={10} />
                            <span>{timeAgo(article.publishedAt)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Results */}
              {searchResults.companies.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Building2 size={14} />
                    Companies ({searchResults.companies.length})
                  </h3>
                  <div className="space-y-2">
                    {searchResults.companies.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                          <img src={company.logoUrl} alt={company.name} className="h-6 w-6 object-contain" crossOrigin="anonymous" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground">{company.name}</h4>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{company.description}</p>
                        </div>
                        <button
                          onClick={() => toggleFollowCompany(company.id)}
                          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            followedCompanies.has(company.id)
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          }`}
                        >
                          {followedCompanies.has(company.id) ? "Following" : "Follow"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Results */}
              {searchResults.sources.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Newspaper size={14} />
                    News Sources ({searchResults.sources.length})
                  </h3>
                  <div className="space-y-2">
                    {searchResults.sources.map((source) => (
                      <div
                        key={source.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                          <img src={source.logoUrl} alt={source.name} className="h-6 w-6 object-contain" crossOrigin="anonymous" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground">{source.name}</h4>
                          <p className="text-xs text-muted-foreground">{formatViewCount(source.followerCount)} followers</p>
                        </div>
                        <button
                          onClick={() => handleSourceFilter(source.name)}
                          className="shrink-0 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          View Articles
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search size={32} className="mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground/70">Try a different search term</p>
            </div>
          )}
        </div>
      )}

      {/* Default Content (when not searching) */}
      {!showSearchResults && (
        <>
          {/* Segmented control */}
          <div className="mx-4 mb-4 flex gap-1 rounded-xl bg-muted p-1">
            {(["Topics", "Companies", "Sources"] as Segment[]).map((s) => {
              const isActive = segment === s
              return (
                <button
                  key={s}
                  onClick={() => setSegment(s)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    isActive ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>

          {/* Topics */}
          {segment === "Topics" && (
            <div className="px-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <TrendingUp size={14} />
                Trending Now
              </h2>
              <div className="flex flex-col">
                {trendingTopics.map((topic, i) => (
                  <button
                    key={topic.name}
                    onClick={() => {
                      setSearchQuery(topic.name)
                      setIsSearchFocused(true)
                    }}
                    className="flex items-center gap-3 border-b border-border/50 py-3 text-left transition-colors hover:bg-muted/30"
                  >
                    <span className="w-5 text-sm font-semibold text-muted-foreground/50">
                      {i + 1}
                    </span>
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                      <img src={topic.imageUrl} alt={topic.name} className="h-full w-full object-cover" crossOrigin="anonymous" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{topic.name}</p>
                      <p className="text-xs text-muted-foreground">{formatViewCount(topic.viewCount)} mentions</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Category grid */}
              <h2 className="mb-3 mt-6 text-sm font-semibold text-foreground">Browse Categories</h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.filter((c) => c.value !== "All").map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setSearchQuery(cat.label)
                      setIsSearchFocused(true)
                    }}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card py-5 transition-colors hover:bg-muted/50"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Companies */}
          {segment === "Companies" && (
            <div className="flex flex-col px-4">
              <p className="mb-3 text-xs text-muted-foreground">Follow companies to see their news in your feed</p>
              {mockCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center gap-3 border-b border-border/50 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                    <img src={company.logoUrl} alt={company.name} className="h-6 w-6 object-contain" crossOrigin="anonymous" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground">{company.name}</h3>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{company.description}</p>
                  </div>
                  <button
                    onClick={() => toggleFollowCompany(company.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      followedCompanies.has(company.id)
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {followedCompanies.has(company.id) ? "Following" : "Follow"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Sources */}
          {segment === "Sources" && (
            <div className="flex flex-col px-4">
              <p className="mb-3 text-xs text-muted-foreground">Filter articles by news source</p>
              {mockAgencies.map((agency) => (
                <div
                  key={agency.id}
                  className="flex items-center gap-3 border-b border-border/50 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                    <img src={agency.logoUrl} alt={agency.name} className="h-6 w-6 object-contain" crossOrigin="anonymous" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground">{agency.name}</h3>
                    <p className="text-xs text-muted-foreground">{formatViewCount(agency.followerCount)} followers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSourceFilter(agency.name)}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      Articles
                    </button>
                    <button
                      onClick={() => toggleFollowSource(agency.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        followedSources.has(agency.id)
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {followedSources.has(agency.id) ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
