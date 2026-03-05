"use client"

import type { Article } from "@/lib/types"
import { CategoryBadge } from "./category-badge"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { timeAgo } from "@/lib/time"
import { motion } from "framer-motion"

export function HeroCard({ article }: { article: Article }) {
  const { savedArticleIds, toggleSaveArticle, setSelectedArticleId } = useAppStore()
  const isSaved = savedArticleIds.includes(article.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative mx-4 overflow-hidden rounded-2xl"
    >
      <button
        onClick={() => setSelectedArticleId(article.id)}
        className="block w-full text-left"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }}
          />

          {/* Category badge top-left */}
          <div className="absolute left-3 top-3">
            <CategoryBadge category={article.category} />
          </div>

          {/* Content overlay bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="mb-2 font-serif text-xl font-bold leading-tight text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
              {article.title}
            </h2>
            <div className="flex items-center gap-2">
              <img
                src={article.sourceLogoUrl}
                alt=""
                className="h-4 w-4 rounded-full bg-white/90 object-contain"
                crossOrigin="anonymous"
              />
              <span className="font-sans text-[12px] font-medium text-white/80">
                {article.sourceName}
              </span>
              <span className="text-white/40">{"/"}</span>
              <span className="font-sans text-[12px] text-white/60">
                {timeAgo(article.publishedAt)}
              </span>
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
        className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform active:scale-90"
      >
        {isSaved ? (
          <BookmarkCheck size={16} strokeWidth={1.5} className="text-primary" />
        ) : (
          <Bookmark size={16} strokeWidth={1.5} className="text-white/80" />
        )}
      </button>
    </motion.div>
  )
}
