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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
      className="glass spring-smooth mx-5 flex gap-3 p-3 active:scale-[0.98]"
      style={{ cursor: "pointer" }}
      onClick={() => setSelectedArticleId(article.id)}
    >
      {/* Thumbnail */}
      <div className="h-[90px] w-[90px] shrink-0 overflow-hidden" style={{ borderRadius: 16 }}>
        <img
          src={article.imageUrl}
          alt={article.title}
          className="h-full w-full object-cover"
          crossOrigin="anonymous"
        />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <CategoryBadge category={article.category} />
          </div>
          <h3
            className="line-clamp-2 font-sans text-[15px] font-semibold leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {article.title}
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img
              src={article.sourceLogoUrl}
              alt={article.sourceName}
              className="h-3.5 w-3.5 rounded-full object-contain"
              crossOrigin="anonymous"
            />
            <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
              {article.sourceName}
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {"/"} {timeAgo(article.publishedAt)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleSaveArticle(article.id)
            }}
            className="spring-bounce flex h-7 w-7 items-center justify-center rounded-full active:scale-90"
          >
            {isSaved ? (
              <BookmarkCheck size={14} strokeWidth={1.5} style={{ color: "#0066FF" }} />
            ) : (
              <Bookmark size={14} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
