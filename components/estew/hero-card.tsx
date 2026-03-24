"use client"

import { useState } from "react"
import type { Article } from "@/lib/types"
import { Bookmark, BookmarkCheck, Lock } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { timeAgo } from "@/lib/time"

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
        className="relative mx-4 mb-4 cursor-pointer overflow-hidden rounded-2xl animate-fade-in"
        onClick={handleClick}
      >
        {/* Image container */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 animate-shimmer" />
          )}
          
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-2xl font-semibold text-primary/30">
                {article.category}
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
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Category badge */}
          <div className="absolute left-3 top-3">
            <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm dark:bg-black/50 dark:text-white">
              {article.category}
            </span>
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="mb-2.5 line-clamp-2 text-lg font-semibold leading-snug text-white">
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
              <span className="text-white/40">·</span>
              <span>{timeAgo(article.publishedAt)}</span>
            </div>
          </div>

          {/* Bookmark */}
          <button
            onClick={handleSave}
            className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-transform active:scale-90"
            aria-label={isSaved ? "Unsave" : "Save"}
          >
            {isSaved ? (
              <BookmarkCheck size={18} className="text-primary" />
            ) : (
              <Bookmark size={18} className="text-white/80" />
            )}
          </button>
        </div>
      </article>

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
