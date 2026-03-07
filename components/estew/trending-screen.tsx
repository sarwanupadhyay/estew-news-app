"use client"

import { useState } from "react"
import { CATEGORY_COLORS } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import { useArticles } from "@/lib/use-articles"
import { useAuth } from "@/lib/auth-context"
import { timeAgo, formatViewCount } from "@/lib/time"
import { TrendingUp, Lock, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export function TrendingScreen() {
  const { setSelectedArticleId, articles: storeArticles } = useAppStore()
  const { articles: fetchedArticles } = useArticles("All")
  const { profile, checkArticleAccess } = useAuth()
  const allArticles = storeArticles.length > 0 ? storeArticles : fetchedArticles
  const sorted = [...allArticles].sort((a, b) => b.viewCount - a.viewCount)

  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitMessage, setLimitMessage] = useState("")

  const handleArticleClick = async (articleId: string) => {
    const result = await checkArticleAccess()
    if (!result.allowed) {
      setLimitMessage(result.message || "Daily limit reached")
      setShowLimitModal(true)
      return
    }
    setSelectedArticleId(articleId)
  }

  return (
    <div className="flex flex-col pb-20">
      <div className="flex items-center gap-2.5 border-b border-border px-5 pb-3 pt-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <div className="relative h-6 w-6">
          <Image src="/images/logo.png" alt="Estew" fill className="object-contain dark:invert" />
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">Trending</h1>
          <p className="font-sans text-[12px] text-muted-foreground">Most-read stories right now</p>
        </div>
      </div>

      <div className="flex flex-col px-5">
        {sorted.map((article, i) => (
          <TrendingItem 
            key={article.id} 
            article={article} 
            rank={i + 1} 
            onClick={() => handleArticleClick(article.id)} 
          />
        ))}
      </div>

      {/* Rate Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-8"
            onClick={() => setShowLimitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 mx-auto">
                <Lock size={24} className="text-amber-500" />
              </div>
              <h3 className="text-center font-serif text-xl font-bold text-foreground mb-2">
                Daily Limit Reached
              </h3>
              <p className="text-center font-sans text-[14px] text-muted-foreground mb-6">
                {limitMessage}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowLimitModal(false)
                    // Navigate to profile billing
                    useAppStore.getState().setActiveTab("profile")
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-sans text-[14px] font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
                >
                  <Sparkles size={16} />
                  Upgrade to Pro
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="rounded-xl border border-border py-3 font-sans text-[14px] font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TrendingItem({ article, rank, onClick }: { 
  article: { id: string; title: string; imageUrl: string; category: string; viewCount: number; publishedAt: string }
  rank: number
  onClick: () => void 
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const accentColor = CATEGORY_COLORS[article.category as keyof typeof CATEGORY_COLORS] || "#888"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (rank - 1) * 0.04 }}
      onClick={onClick}
      className="flex cursor-pointer items-center gap-3 border-b border-border py-3.5 transition-colors active:bg-muted/30"
    >
      {/* Rank */}
      <span
        className="w-7 text-center font-serif text-xl font-bold"
        style={{ color: rank <= 3 ? "var(--primary)" : "var(--muted-foreground)", opacity: rank <= 3 ? 1 : 0.5 }}
      >
        {rank}
      </span>

      {/* Thumbnail */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="font-serif text-lg font-bold text-muted-foreground/30">
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
}
