"use client"

import { mockArticles, CATEGORY_COLORS } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import { timeAgo, formatViewCount } from "@/lib/time"
import { TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

export function TrendingScreen() {
  const { setSelectedArticleId } = useAppStore()
  const sorted = [...mockArticles].sort((a, b) => b.viewCount - a.viewCount)

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 pb-2 pt-4">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Trending
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--text-muted)" }}>
          Most-read stories right now
        </p>
      </div>

      <div className="mt-2 flex flex-col gap-3 px-5">
        {sorted.map((article, i) => {
          const accentColor = CATEGORY_COLORS[article.category] || "#6B7280"
          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              onClick={() => setSelectedArticleId(article.id)}
              className="glass spring-smooth flex items-center gap-3 overflow-hidden p-3 active:scale-[0.98]"
              style={{
                cursor: "pointer",
                borderLeft: `3px solid ${accentColor}`,
              }}
            >
              {/* Rank number */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                <span
                  className="font-serif text-2xl font-bold"
                  style={{ color: i < 3 ? "#0066FF" : "var(--text-muted)", opacity: i < 3 ? 1 : 0.5 }}
                >
                  {i + 1}
                </span>
              </div>

              {/* Thumbnail */}
              <div className="h-14 w-14 shrink-0 overflow-hidden" style={{ borderRadius: 12 }}>
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3
                  className="line-clamp-2 text-[14px] font-semibold leading-snug"
                  style={{ color: "var(--text-primary)" }}
                >
                  {article.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {formatViewCount(article.viewCount)} views
                  </span>
                  <TrendingUp size={12} style={{ color: accentColor }} />
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {timeAgo(article.publishedAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
