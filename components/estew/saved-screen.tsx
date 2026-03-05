"use client"

import { mockArticles, CATEGORIES } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import { CategoryBadge } from "./category-badge"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export function SavedScreen() {
  const { savedArticleIds, toggleSaveArticle, setSelectedArticleId } = useAppStore()
  const [filter, setFilter] = useState("All")
  const saved = mockArticles.filter((a) => savedArticleIds.includes(a.id))
  const filtered = filter === "All" ? saved : saved.filter((a) => a.category === filter)
  const filterCats = ["All", "AI", "Launches", "Market"]

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pb-2 pt-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 8px) + 16px)" }}>
        <h1
          className="font-serif text-2xl font-bold"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
        >
          Saved
        </h1>
        <p className="mt-1 font-sans text-[13px]" style={{ color: "var(--text-muted)" }}>
          {saved.length} article{saved.length !== 1 ? "s" : ""} bookmarked
        </p>
      </div>

      {/* Filter tabs */}
      <div className="no-scrollbar flex gap-2 px-5 py-2">
        {filterCats.map((cat) => {
          const isActive = filter === cat
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="spring-bounce shrink-0 rounded-full px-3 py-1.5 font-sans text-[12px] font-medium"
              style={{
                background: isActive ? "rgba(0, 102, 255, 0.15)" : "var(--glass-bg)",
                border: isActive ? "1px solid rgba(0, 102, 255, 0.3)" : "1px solid var(--glass-border)",
                color: isActive ? "#0066FF" : "var(--text-muted)",
                backdropFilter: "blur(20px)",
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-20">
          <Bookmark size={40} strokeWidth={1} style={{ color: "var(--text-muted)" }} />
          <p className="mt-4 text-center font-sans text-[15px] font-medium" style={{ color: "var(--text-muted)" }}>
            No saved articles yet
          </p>
          <p className="mt-1 text-center font-sans text-[13px]" style={{ color: "var(--text-muted)" }}>
            Tap the bookmark icon on any article to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5 py-3">
          {filtered.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative overflow-hidden"
              style={{
                borderRadius: 16,
                background: "var(--glass-bg)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid var(--glass-border)",
              }}
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
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
                  />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3
                      className="line-clamp-2 font-sans text-[12px] font-semibold leading-snug"
                      style={{ color: "#FFFFFF" }}
                    >
                      {article.title}
                    </h3>
                  </div>
                  <div className="absolute left-2 top-2">
                    <CategoryBadge category={article.category} />
                  </div>
                </div>
              </button>
              <button
                onClick={() => toggleSaveArticle(article.id)}
                className="spring-bounce absolute right-2 top-2 flex items-center justify-center rounded-full active:scale-90"
                style={{
                  width: 28,
                  height: 28,
                  background: "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <BookmarkCheck size={14} strokeWidth={1.5} style={{ color: "#0066FF" }} />
              </button>
              <div className="flex items-center gap-1.5 px-2.5 py-2">
                <img
                  src={article.sourceLogoUrl}
                  alt={article.sourceName}
                  className="h-3.5 w-3.5 rounded-full object-contain"
                  crossOrigin="anonymous"
                />
                <span className="font-sans text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                  {article.sourceName}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
