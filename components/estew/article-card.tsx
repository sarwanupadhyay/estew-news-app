"use client"

import type { Article } from "@/lib/types"
import { CategoryBadge } from "./category-badge"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { timeAgo } from "@/lib/time"
import { motion } from "framer-motion"

export function ArticleCard({ article, index }: { article: Article; index: number }) {
  const { setSelectedArticleId } = useAppStore()
  const { profile, toggleSaveArticle } = useAuth()
  const isSaved = profile?.savedArticles?.includes(article.id) || false

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleSaveArticle(article.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      className="mx-4 mb-1 cursor-pointer rounded-lg border-b border-border bg-background transition-colors active:bg-muted/30"
      onClick={() => setSelectedArticleId(article.id)}
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
            {article.sourceLogoUrl ? (
              <img
                src={article.sourceLogoUrl}
                alt={article.sourceName}
                className="h-4 w-4 shrink-0 rounded-full object-contain"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            ) : (
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[8px] font-bold text-muted-foreground">
                {article.sourceName.charAt(0)}
              </div>
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
        <div className="shrink-0 overflow-hidden rounded-xl" style={{ width: 88, height: 88 }}>
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/88x88/1a1b2e/666?text=News"
            }}
          />
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
  )
}
