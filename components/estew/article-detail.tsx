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
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setSelectedArticleId(null)}
          />

          {/* Bottom Sheet - heavy glass */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[428px] overflow-hidden"
            style={{
              maxHeight: "90vh",
              background: "rgba(255, 255, 255, 0.18)",
              backdropFilter: "blur(40px) saturate(200%)",
              WebkitBackdropFilter: "blur(40px) saturate(200%)",
              border: "1px solid rgba(255, 255, 255, 0.28)",
              borderRadius: "28px 28px 0 0",
              boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
            }}
          >
            {/* Drag handle pill */}
            <div className="flex justify-center pb-2 pt-3">
              <div
                className="rounded-full"
                style={{ width: 40, height: 4, background: "rgba(255,255,255,0.3)" }}
              />
            </div>

            <div className="no-scrollbar overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(90vh - 24px)" }}>
              {/* Close button */}
              <div className="mb-3 flex justify-end">
                <button
                  onClick={() => setSelectedArticleId(null)}
                  className="glass flex items-center justify-center rounded-full"
                  style={{ width: 32, height: 32 }}
                >
                  <X size={16} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
                </button>
              </div>

              {/* Article image - radius-xl */}
              <div className="mb-4 overflow-hidden" style={{ borderRadius: 28 }}>
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="aspect-video w-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Source citation bar - glass pill */}
              <div
                className="glass mb-4 flex items-center gap-2 rounded-full px-3 py-2"
              >
                <img
                  src={article.sourceLogoUrl}
                  alt={article.sourceName}
                  className="h-5 w-5 rounded-full object-contain"
                  crossOrigin="anonymous"
                />
                <span className="font-sans text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {article.sourceName}
                </span>
                <span className="font-sans text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {"/"} Published {timeAgo(article.publishedAt)}
                </span>
              </div>

              {/* Category + tags */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <CategoryBadge category={article.category} size="md" />
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="glass rounded-full px-2.5 py-0.5 font-sans text-[11px] font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Headline - Fraunces 800 */}
              <h2
                className="mb-3 font-serif font-extrabold"
                style={{
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  fontSize: 24,
                  lineHeight: 1.15,
                }}
              >
                {article.title}
              </h2>

              {/* Summary - DM Sans 400, body size, 1.6 line height */}
              <p
                className="mb-6 font-sans text-[15px]"
                style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
              >
                {article.summary}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                {/* Visit Article - primary CTA */}
                <a
                  href={article.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spring-bounce flex flex-1 items-center justify-center gap-2 rounded-full font-sans text-[15px] font-semibold active:scale-[0.97]"
                  style={{
                    height: 48,
                    background: "#0066FF",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 20px rgba(0, 102, 255, 0.35)",
                  }}
                >
                  Visit Article
                  <ExternalLink size={16} strokeWidth={1.5} />
                </a>
                {/* Bookmark - icon button */}
                <button
                  onClick={() => toggleSaveArticle(article.id)}
                  className="glass spring-bounce flex items-center justify-center rounded-full active:scale-[0.97]"
                  style={{ width: 48, height: 48 }}
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
