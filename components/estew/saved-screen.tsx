"use client"

import { mockArticles } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import { CategoryBadge } from "./category-badge"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { motion } from "framer-motion"

export function SavedScreen() {
  const { savedArticleIds, toggleSaveArticle, setSelectedArticleId } = useAppStore()
  const saved = mockArticles.filter((a) => savedArticleIds.includes(a.id))

  return (
    <div className="flex flex-col pb-24">
      <div className="px-5 pb-2 pt-4">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Saved
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--text-muted)" }}>
          {saved.length} article{saved.length !== 1 ? "s" : ""} bookmarked
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-20">
          <Bookmark size={40} strokeWidth={1} style={{ color: "var(--text-muted)" }} />
          <p className="mt-4 text-center text-[15px] font-medium" style={{ color: "var(--text-muted)" }}>
            No saved articles yet
          </p>
          <p className="mt-1 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
            Tap the bookmark icon on any article to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5 py-3">
          {saved.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass relative overflow-hidden"
              style={{ borderRadius: 16 }}
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
                    <h3 className="line-clamp-2 text-[12px] font-semibold leading-snug text-white">
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
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full"
                style={{ background: "rgba(0,0,0,0.4)" }}
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
                <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
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
