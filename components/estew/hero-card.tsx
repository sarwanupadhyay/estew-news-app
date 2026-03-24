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

export function HeroCard({ article }: { article: Article }) {
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
        className="relative mx-4 mb-4 cursor-pointer overflow-hidden rounded-xl animate-fade-up"
        onClick={handleClick}
      >
        {/* Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 animate-shimmer" />
          )}
          
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-3xl font-semibold text-muted-foreground/30">
                {article.category}
              </span>
            </div>
          ) : (
            <img
              src={article.imageUrl}
              alt=""
              className={`h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Category badge */}
          <div className="absolute left-3 top-3">
            <span className="rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground">
              {article.category}
            </span>
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight text-white">
              {article.title}
            </h2>
            <div className="flex items-center gap-2 text-[12px] text-white/80">
              {logoError ? (
                <span className="flex h-4 w-4 items-center justify-center rounded bg-white/20 text-[9px] font-semibold text-white">
                  {sourceInitial}
                </span>
              ) : (
                <img
                  src={faviconUrl}
                  alt=""
                  className="h-4 w-4 rounded bg-white/90 object-contain"
                  onError={() => setLogoError(true)}
                />
              )}
              <span className="font-medium">{article.sourceName}</span>
              <span className="text-white/50">·</span>
              <span>{timeAgo(article.publishedAt)}</span>
            </div>
          </div>

          {/* Bookmark button */}
          <button
            onClick={handleSave}
            className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-transform active:scale-90"
            aria-label={isSaved ? "Unsave article" : "Save article"}
          >
            {isSaved ? (
              <BookmarkCheck size={16} className="text-primary" />
            ) : (
              <Bookmark size={16} className="text-white/80" />
            )}
          </button>
        </div>
      </article>

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
