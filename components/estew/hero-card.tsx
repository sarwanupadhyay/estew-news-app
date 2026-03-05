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
        {/* 16:9 Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ borderRadius: 20 }}>
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          {/* Dark glass overlay on bottom 60% */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 40%, transparent 60%)",
            }}
          />

          {/* Category badge - top left */}
          <div className="absolute left-3 top-3">
            <CategoryBadge category={article.category} />
          </div>

          {/* Source chip - top right (glass pill) */}
          <div
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              background: "rgba(0, 0, 0, 0.35)",
              backdropFilter: "blur(20px) saturate(150%)",
              WebkitBackdropFilter: "blur(20px) saturate(150%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <img
              src={article.sourceLogoUrl}
              alt={article.sourceName}
              className="h-4 w-4 rounded-full object-contain"
              crossOrigin="anonymous"
            />
            <span className="font-sans text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>
              {article.sourceName}
            </span>
          </div>

          {/* Content overlay - bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2
              className="mb-2 font-serif font-bold leading-tight"
              style={{
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                fontSize: "clamp(20px, 5vw, 24px)",
                lineHeight: 1.15,
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {article.title}
            </h2>
            {/* Meta row */}
            <div className="flex items-center gap-2">
              <img
                src={article.sourceLogoUrl}
                alt=""
                className="h-4 w-4 rounded-full object-contain"
                crossOrigin="anonymous"
              />
              <span className="font-sans text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                {article.sourceName}
              </span>
              <span className="font-sans text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                {"/"} {timeAgo(article.publishedAt)}
              </span>
              <span className="font-sans text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                {"/"} {formatViewCount(article.viewCount)} views
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Bookmark - glass circle button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleSaveArticle(article.id)
        }}
        className="spring-bounce absolute bottom-4 right-4 flex items-center justify-center rounded-full active:scale-95"
        style={{
          width: 40,
          height: 40,
          background: "rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {isSaved ? (
          <BookmarkCheck size={18} strokeWidth={1.5} style={{ color: "#0066FF" }} />
        ) : (
          <Bookmark size={18} strokeWidth={1.5} style={{ color: "rgba(255,255,255,0.8)" }} />
        )}
      </button>
    </motion.div>
  )
}
