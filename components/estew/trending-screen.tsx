"use client"

import { CATEGORY_COLORS } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import { useArticles } from "@/lib/use-articles"
import { timeAgo, formatViewCount } from "@/lib/time"
import { TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export function TrendingScreen() {
  const { setSelectedArticleId, articles: storeArticles } = useAppStore()
  const { articles: fetchedArticles } = useArticles("All")
  const allArticles = storeArticles.length > 0 ? storeArticles : fetchedArticles
  const sorted = [...allArticles].sort((a, b) => b.viewCount - a.viewCount)

  return (
    <div className="flex flex-col pb-20">
      <div className="flex items-center gap-2.5 border-b border-border px-5 pb-3 pt-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <Image src="/images/logo.png" alt="Estew" width={24} height={24} className="dark:invert" />
        <div>
          <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">Trending</h1>
          <p className="font-sans text-[12px] text-muted-foreground">Most-read stories right now</p>
        </div>
      </div>

      <div className="flex flex-col px-5">
        {sorted.map((article, i) => {
          const accentColor = CATEGORY_COLORS[article.category] || "#888"
          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedArticleId(article.id)}
              className="flex cursor-pointer items-center gap-3 border-b border-border py-3.5 transition-colors active:bg-muted/30"
            >
              {/* Rank */}
              <span
                className="w-7 text-center font-serif text-xl font-bold"
                style={{ color: i < 3 ? "var(--primary)" : "var(--muted-foreground)", opacity: i < 3 ? 1 : 0.5 }}
              >
                {i + 1}
              </span>

              {/* Thumbnail */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="h-full w-full object-cover" 
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/56x56/1a1b2e/666?text=News"
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className="line-clamp-2 font-sans text-[13px] font-semibold leading-snug text-foreground">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[11px] text-muted-foreground">
                    {formatViewCount(article.viewCount)} views
                  </span>
                  <TrendingUp size={11} style={{ color: accentColor }} />
                  <span className="font-sans text-[11px] text-muted-foreground">
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
