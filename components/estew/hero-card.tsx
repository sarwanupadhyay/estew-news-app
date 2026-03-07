"use client"

import { useState } from "react"
import type { Article } from "@/lib/types"
import { CategoryBadge } from "./category-badge"
import { Bookmark, BookmarkCheck, Lock } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { timeAgo } from "@/lib/time"
import { motion } from "framer-motion"

// Get favicon for source using DuckDuckGo (better CORS support)
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
    // Check rate limit before opening
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative mx-4 mb-4 overflow-hidden rounded-2xl"
      >
        <button
          onClick={handleClick}
          className="block w-full text-left"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
            {/* Loading skeleton */}
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}
            
            {/* Error fallback */}
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <span className="font-serif text-4xl font-bold text-primary/30">
                  {article.category}
                </span>
              </div>
            ) : (
              <img
                src={article.imageUrl}
                alt=""
                className={`h-full w-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            )}
            
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }}
            />

            {/* Category badge top-left */}
            <div className="absolute left-3 top-3">
              <CategoryBadge category={article.category} />
            </div>

            {/* Content overlay bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="mb-2 line-clamp-2 font-serif text-xl font-bold leading-tight text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
                {article.title}
              </h2>
              <div className="flex items-center gap-2">
                {logoError ? (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-[8px] font-bold text-gray-800">
                    {sourceInitial}
                  </div>
                ) : (
                  <img
                    src={faviconUrl}
                    alt=""
                    className="h-4 w-4 rounded-sm bg-white/90 object-contain"
                    onError={() => setLogoError(true)}
                  />
                )}
                <span className="font-sans text-[12px] font-medium text-white/90">
                  {article.sourceName}
                </span>
                <span className="text-white/50">/</span>
                <span className="font-sans text-[12px] text-white/70">
                  {timeAgo(article.publishedAt)}
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Bookmark button */}
        <button
          onClick={handleSave}
          className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform active:scale-90"
        >
          {isSaved ? (
            <BookmarkCheck size={16} strokeWidth={1.5} className="text-primary" />
          ) : (
            <Bookmark size={16} strokeWidth={1.5} className="text-white/80" />
          )}
        </button>
      </motion.div>

      {/* Rate Limit Modal */}
      {limitReached && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-6" onClick={() => setLimitReached(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-2xl bg-background p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
              <Lock size={24} className="text-amber-500" />
            </div>
            <h3 className="mb-2 font-serif text-xl font-bold text-foreground">Daily Limit Reached</h3>
            <p className="mb-5 font-sans text-[14px] text-muted-foreground">{limitMessage}</p>
            <button
              onClick={() => {
                setLimitReached(false)
                useAppStore.getState().setActiveTab("profile")
              }}
              className="w-full rounded-full bg-primary py-3 font-sans text-[14px] font-semibold text-primary-foreground"
            >
              Upgrade to Pro
            </button>
            <button
              onClick={() => setLimitReached(false)}
              className="mt-3 font-sans text-[13px] text-muted-foreground"
            >
              Maybe later
            </button>
          </motion.div>
        </div>
      )}
    </>
  )
}
