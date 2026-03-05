"use client"

import type { Article } from "@/lib/types"
import { CategoryBadge } from "./category-badge"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { timeAgo } from "@/lib/time"
import { motion } from "framer-motion"

export function ArticleCard({ article, index }: { article: Article; index: number }) {
  const { savedArticleIds, toggleSaveArticle, setSelectedArticleId } = useAppStore()
  const isSaved = savedArticleIds.includes(article.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      className="mx-4 flex cursor-pointer gap-3 border-b border-border py-3 transition-colors active:bg-muted/30"
      onClick={() => setSelectedArticleId(article.id)}
    >
      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="mb-1.5">
            <CategoryBadge category={article.category} />
          </div>
          <h3 className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-foreground">
            {article.title}
          </h3>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <img
            src={article.sourceLogoUrl}
            alt={article.sourceName}
            className="h-3.5 w-3.5 rounded-full object-contain"
            crossOrigin="anonymous"
          />
          <span className="font-sans text-[11px] text-muted-foreground">
            {article.sourceName}
          </span>
          <span className="text-[11px] text-muted-foreground/50">{"/"}</span>
          <span className="font-sans text-[11px] text-muted-foreground">
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
        />
      </div>

      {/* Bookmark */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleSaveArticle(article.id)
        }}
        className="flex h-8 w-6 shrink-0 items-start justify-center pt-1 transition-transform active:scale-90"
      >
        {isSaved ? (
          <BookmarkCheck size={14} strokeWidth={1.5} className="text-primary" />
        ) : (
          <Bookmark size={14} strokeWidth={1.5} className="text-muted-foreground" />
        )}
      </button>
    </motion.div>
  )
}
