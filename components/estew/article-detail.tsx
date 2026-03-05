"use client"

import { useAppStore } from "@/lib/store"
import { mockArticles } from "@/lib/mock-data"
import { timeAgo } from "@/lib/time"
import { CategoryBadge } from "./category-badge"
import { ExternalLink, X, Bookmark, BookmarkCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ArticleDetail() {
  const { selectedArticleId, setSelectedArticleId, savedArticleIds, toggleSaveArticle } = useAppStore()
  const article = mockArticles.find((a) => a.id === selectedArticleId)

  return (
    <AnimatePresence>
      {article && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={() => setSelectedArticleId(null)}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-heavy fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[428px] overflow-hidden"
            style={{ maxHeight: "90vh", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-white/30" />
            </div>

            <div className="no-scrollbar overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(90vh - 24px)" }}>
              {/* Close button */}
              <div className="mb-3 flex justify-end">
                <button
                  onClick={() => setSelectedArticleId(null)}
                  className="glass flex h-8 w-8 items-center justify-center rounded-full"
                >
                  <X size={16} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
                </button>
              </div>

              {/* Article image */}
              <div className="mb-4 overflow-hidden" style={{ borderRadius: 20 }}>
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="aspect-video w-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Source citation bar */}
              <div className="glass mb-4 flex items-center gap-2 rounded-full px-3 py-2">
                <img
                  src={article.sourceLogoUrl}
                  alt={article.sourceName}
                  className="h-5 w-5 rounded-full object-contain"
                  crossOrigin="anonymous"
                />
                <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {article.sourceName}
                </span>
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {"/"} Published {timeAgo(article.publishedAt)}
                </span>
              </div>

              {/* Category + tags */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <CategoryBadge category={article.category} size="md" />
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="glass rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Headline */}
              <h2
                className="mb-3 font-serif text-2xl font-extrabold leading-tight"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
              >
                {article.title}
              </h2>

              {/* AI Summary */}
              <p
                className="mb-6 text-[15px] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {article.summary}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={article.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spring-bounce flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold text-white active:scale-[0.97]"
                  style={{
                    background: "#0066FF",
                    boxShadow: "0 4px 20px rgba(0, 102, 255, 0.35)",
                  }}
                >
                  Visit Article
                  <ExternalLink size={16} strokeWidth={1.5} />
                </a>
                <button
                  onClick={() => toggleSaveArticle(article.id)}
                  className="glass spring-bounce flex h-12 w-12 items-center justify-center rounded-full active:scale-[0.97]"
                >
                  {savedArticleIds.includes(article.id) ? (
                    <BookmarkCheck size={20} strokeWidth={1.5} style={{ color: "#0066FF" }} />
                  ) : (
                    <Bookmark size={20} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
