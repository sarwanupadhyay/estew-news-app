"use client"

import type { Article } from "@/lib/types"
import { CategoryBadge } from "./category-badge"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { timeAgo, formatViewCount } from "@/lib/time"
import { motion } from "framer-motion"

export function HeroCard({ article }: { article: Article }) {
  const { savedArticleIds, toggleSaveArticle, setSelectedArticleId } = useAppStore()
  const isSaved = savedArticleIds.includes(article.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative mx-5 overflow-hidden"
      style={{ borderRadius: 20 }}
    >
      <button
        onClick={() => setSelectedArticleId(article.id)}
        className="block w-full text-left"
      >
        {/* Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ borderRadius: 20 }}>
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          {/* Dark glass overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
            }}
          />

          {/* Category badge - top left */}
          <div className="absolute left-3 top-3">
            <CategoryBadge category={article.category} />
          </div>

          {/* Source chip - top right */}
          <div className="glass-dark absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1">
            <img
              src={article.sourceLogoUrl}
              alt={article.sourceName}
              className="h-4 w-4 rounded-full object-contain"
              crossOrigin="anonymous"
            />
            <span className="text-[11px] font-medium text-white/90">{article.sourceName}</span>
          </div>

          {/* Content overlay - bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2
              className="mb-2 font-serif text-xl font-bold leading-tight text-white"
              style={{ letterSpacing: "-0.02em", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
            >
              {article.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-white/70">
              <span>{timeAgo(article.publishedAt)}</span>
              <span>{"/"}</span>
              <span>{formatViewCount(article.viewCount)} views</span>
            </div>
          </div>
        </div>
      </button>

      {/* Bookmark button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleSaveArticle(article.id)
        }}
        className="glass-dark spring-bounce absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full active:scale-95"
      >
        {isSaved ? (
          <BookmarkCheck size={16} strokeWidth={1.5} style={{ color: "#0066FF" }} />
        ) : (
          <Bookmark size={16} strokeWidth={1.5} className="text-white/80" />
        )}
      </button>
    </motion.div>
  )
}
