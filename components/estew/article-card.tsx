"use client"

import { useState } from "react"
import type { Article } from "@/lib/types"
import { Bookmark, BookmarkCheck, Lock, MoreHorizontal } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { timeAgo } from "@/lib/time"

// Get favicon for source
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

  return (
    <>
      <article
        className="group cursor-pointer bg-card p-4 transition-colors hover:bg-muted/50 active:bg-muted"
        onClick={handleClick}
      >
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 animate-shimmer" />
            )}
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-lg font-medium text-muted-foreground/40">
                  {article.category.charAt(0)}
                </span>
              </div>
            ) : (
              <img
                src={article.imageUrl}
                alt=""
                className={`h-full w-full object-cover transition-opacity ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            {/* Title */}
            <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-foreground">
              {article.title}
            </h3>
            
            {/* Meta */}
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
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
              <span className="truncate">{article.sourceName}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="shrink-0">{timeAgo(article.publishedAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleSave}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
              aria-label={isSaved ? "Unsave" : "Save"}
            >
              {isSaved ? (
                <BookmarkCheck size={16} className="text-primary" />
              ) : (
                <Bookmark size={16} className="text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </article>

      {/* Divider */}
      <div className="mx-4 border-b border-border/50" />

      {/* Rate Limit Modal */}
      {limitReached && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-6 animate-fade-in" 
          onClick={() => setLimitReached(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-6 text-center animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <Lock size={20} className="text-warning" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Daily Limit Reached</h3>
            <p className="mb-5 text-sm text-muted-foreground">{limitMessage}</p>
            <button
              onClick={() => {
                setLimitReached(false)
                useAppStore.getState().setActiveTab("profile")
              }}
              className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground press-effect"
            >
              Upgrade to Pro
            </button>
            <button
              onClick={() => setLimitReached(false)}
              className="mt-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </>
  )
}
