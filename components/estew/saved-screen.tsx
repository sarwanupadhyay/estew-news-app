"use client"

import { useAppStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { useArticles } from "@/lib/use-articles"
import { CategoryBadge } from "./category-badge"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import Image from "next/image"

export function SavedScreen() {
  const { setSelectedArticleId, articles: storeArticles } = useAppStore()
  const { profile, toggleSaveArticle } = useAuth()
  const { articles: fetchedArticles } = useArticles("All")
  const allArticles = storeArticles.length > 0 ? storeArticles : fetchedArticles
  const [filter, setFilter] = useState("All")
  
  // Use profile's saved articles from Firestore
  const savedArticleIds = profile?.savedArticles || []
  const saved = allArticles.filter((a) => savedArticleIds.includes(a.id))
  const filtered = filter === "All" ? saved : saved.filter((a) => a.category === filter)
  const filterCats = ["All", "AI", "Launches", "Market"]

  const handleUnsave = async (articleId: string) => {
    await toggleSaveArticle(articleId)
  }

  return (
    <div className="flex flex-col pb-20">
      <div className="flex items-center gap-2.5 border-b border-border px-5 pb-3 pt-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <Image src="/images/logo.png" alt="Estew" width={24} height={24} className="dark:invert" />
        <div>
          <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">Saved</h1>
          <p className="font-sans text-[12px] text-muted-foreground">
            {saved.length} article{saved.length !== 1 ? "s" : ""} bookmarked
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3">
        {filterCats.map((cat) => {
          const isActive = filter === cat
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 rounded-full border px-3 py-1.5 font-sans text-[12px] font-medium transition-colors ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-20">
          <Bookmark size={36} strokeWidth={1} className="text-muted-foreground/40" />
          <p className="mt-4 font-sans text-[15px] font-medium text-muted-foreground">
            No saved articles yet
          </p>
          <p className="mt-1 font-sans text-[13px] text-muted-foreground/60">
            Tap the bookmark icon to save articles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5 py-1">
          {filtered.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card"
            >
              <button
                onClick={() => setSelectedArticleId(article.id)}
                className="block w-full text-left"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/200x150/1a1b2e/666?text=News"
                    }}
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="line-clamp-2 font-sans text-[12px] font-semibold leading-snug text-white">
                      {article.title}
                    </h3>
                  </div>
                  <div className="absolute left-2 top-2">
                    <CategoryBadge category={article.category} />
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleUnsave(article.id)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform active:scale-90"
              >
                <BookmarkCheck size={12} strokeWidth={1.5} className="text-primary" />
              </button>
              <div className="flex items-center gap-1.5 px-2.5 py-2">
                {article.sourceLogoUrl ? (
                  <img 
                    src={article.sourceLogoUrl} 
                    alt={article.sourceName} 
                    className="h-3.5 w-3.5 rounded-full object-contain" 
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                ) : (
                  <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-muted text-[7px] font-bold text-muted-foreground">
                    {article.sourceName.charAt(0)}
                  </div>
                )}
                <span className="truncate font-sans text-[10px] text-muted-foreground">{article.sourceName}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
