"use client"

import { useState } from "react"
import type { Article } from "@/lib/types"
import { CategoryBadge } from "./category-badge"
import { Bookmark, BookmarkCheck, Lock } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { timeAgo } from "@/lib/time"
import { motion } from "framer-motion"

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
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
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
    console.log("[v0] Article clicked:", article.id, article.title)
    // Check rate limit before opening
    const result = await checkArticleAccess()
    console.log("[v0] Rate limit check:", result)
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
        transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
        className="mx-4 mb-1 cursor-pointer rounded-lg border-b border-border bg-background transition-colors active:bg-muted/30"
        onClick={handleClick}
      >
        <div className="flex gap-3 py-4">
          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mb-1.5">
              <CategoryBadge category={article.category} />
            </div>
            <h3 className="mb-2 line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-foreground">
              {article.title}
            </h3>
            <div className="mt-auto flex items-center gap-2">
              {logoError ? (
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">
                  {sourceInitial}
                </div>
              ) : (
                <img
                  src={faviconUrl}
                  alt=""
                  className="h-4 w-4 shrink-0 rounded-sm object-contain"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              )}
              <span className="truncate font-sans text-[11px] text-muted-foreground">
                {article.sourceName}
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground/50">/</span>
              <span className="shrink-0 font-sans text-[11px] text-muted-foreground">
                {timeAgo(article.publishedAt)}
              </span>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="relative shrink-0 overflow-hidden rounded-xl bg-muted" style={{ width: 88, height: 88 }}>
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="font-serif text-2xl font-bold text-muted-foreground/30">
                  {article.category.charAt(0)}
                </span>
              </div>
            ) : (
              <img
                src={article.imageUrl}
                alt=""
                className={`h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Bookmark */}
          <button
            onClick={handleSave}
            className="flex h-8 w-6 shrink-0 items-start justify-center pt-1 transition-transform active:scale-90"
          >
            {isSaved ? (
              <BookmarkCheck size={14} strokeWidth={1.5} className="text-primary" />
            ) : (
              <Bookmark size={14} strokeWidth={1.5} className="text-muted-foreground" />
            )}
          </button>
        </div>
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
                // Navigate to profile for upgrade
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
