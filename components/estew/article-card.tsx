"use client"

import { useState } from "react"
import type { Article } from "@/lib/types"
import { Bookmark, BookmarkCheck, Lock } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { timeAgo } from "@/lib/time"

// Get favicon for source using DuckDuckGo
function getSourceFavicon(sourceName: string, sourceUrl?: string): string {
  let domain = sourceUrl || ""
  if (!domain.includes(".")) {
    domain = `${sourceName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
  } else {
    try {
      const url = new URL(domain.startsWith("http") ? domain : `https://${domain}`)
      domain = url.hostname
    } catch {
      domain = `${sourceName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
    }
  }
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`
}

export function ArticleCard({ article, index }: { article: Article; index: number }) {
  const { setSelectedArticleId } = useAppStore()
  const { profile, toggleSaveArticle, checkArticleAccess } = useAuth()
  const isSaved = profile?.savedArticles?.includes(article.id) || false
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [limitMessage, setLimitMessage] = useState("")

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleSaveArticle(article.id)
  }

  const handleClick = async () => {
    const result = await checkArticleAccess()
    if (!result.allowed) {
      setLimitReached(true)
      setLimitMessage(result.message || "Daily limit reached")
      return
    }
    setSelectedArticleId(article.id)
  }

  const sourceInitial = article.sourceName.charAt(0).toUpperCase()
  const faviconUrl = getSourceFavicon(article.sourceName, article.originalUrl)
  const animationDelay = Math.min(index, 4) * 40

  return (
    <>
      <article
        className="group cursor-pointer px-4 py-3 transition-colors hover:bg-muted/50 active:bg-muted/70"
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={handleClick}
      >
        <div className="flex gap-3">
          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Title - 2 lines max */}
            <h3 className="mb-1.5 line-clamp-2 font-sans text-[15px] font-medium leading-snug text-foreground">
              {article.title}
            </h3>
            
            {/* Meta row */}
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              {logoError ? (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted text-[9px] font-semibold">
                  {sourceInitial}
                </span>
              ) : (
                <img
                  src={faviconUrl}
                  alt=""
                  className="h-4 w-4 shrink-0 rounded object-contain"
                  onError={() => setLogoError(true)}
                />
              )}
              <span className="truncate font-medium">{article.sourceName}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="shrink-0">{timeAgo(article.publishedAt)}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="shrink-0 text-primary/80">{article.category}</span>
            </div>
          </div>

          {/* Thumbnail - smaller, right-aligned */}
          <div className="relative shrink-0 overflow-hidden rounded-lg bg-muted" style={{ width: 72, height: 72 }}>
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 animate-shimmer" />
            )}
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-lg font-semibold text-muted-foreground/30">
                  {article.category.charAt(0)}
                </span>
              </div>
            ) : (
              <img
                src={article.imageUrl}
                alt=""
                className={`h-full w-full object-cover transition-opacity duration-200 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Bookmark - minimal */}
          <button
            onClick={handleSave}
            className="flex h-6 w-6 shrink-0 items-center justify-center self-start opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={isSaved ? "Unsave article" : "Save article"}
          >
            {isSaved ? (
              <BookmarkCheck size={16} className="text-primary" />
            ) : (
              <Bookmark size={16} className="text-muted-foreground" />
            )}
          </button>
        </div>
      </article>

      {/* Divider */}
      <div className="mx-4 border-b border-border" />

      {/* Rate Limit Modal */}
      {limitReached && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-6 animate-fade-in" 
          onClick={() => setLimitReached(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-background p-6 text-center animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <Lock size={20} className="text-amber-500" />
            </div>
            <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">Daily Limit Reached</h3>
            <p className="mb-5 text-[14px] text-muted-foreground">{limitMessage}</p>
            <button
              onClick={() => {
                setLimitReached(false)
                useAppStore.getState().setActiveTab("profile")
              }}
              className="w-full rounded-lg bg-primary py-2.5 text-[14px] font-medium text-primary-foreground press-effect"
            >
              Upgrade to Pro
            </button>
            <button
              onClick={() => setLimitReached(false)}
              className="mt-3 text-[13px] text-muted-foreground hover:text-foreground"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </>
  )
}
