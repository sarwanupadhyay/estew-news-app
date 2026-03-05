"use client"

import { useAppStore } from "@/lib/store"
import { useAiSummary } from "@/lib/use-articles"
import { timeAgo } from "@/lib/time"
import { CategoryBadge } from "./category-badge"
import { ExternalLink, X, Bookmark, BookmarkCheck, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ArticleDetail() {
  const { selectedArticleId, setSelectedArticleId, savedArticleIds, toggleSaveArticle, articles } = useAppStore()
  const article = articles.find((a) => a.id === selectedArticleId)

  return (
    <AnimatePresence>
      {article && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setSelectedArticleId(null)}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[428px] overflow-hidden rounded-t-3xl border-t border-border bg-background"
            style={{ maxHeight: "92vh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            <div className="no-scrollbar overflow-y-auto px-5 pb-10" style={{ maxHeight: "calc(92vh - 20px)" }}>
              {/* Close */}
              <div className="mb-3 flex justify-end">
                <button
                  onClick={() => setSelectedArticleId(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                >
                  <X size={16} strokeWidth={1.5} className="text-muted-foreground" />
                </button>
              </div>

              {/* Image */}
              <div className="mb-5 overflow-hidden rounded-xl">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="aspect-video w-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Source bar */}
              <div className="mb-4 flex items-center gap-2">
                <img
                  src={article.sourceLogoUrl}
                  alt={article.sourceName}
                  className="h-5 w-5 rounded-full object-contain"
                  crossOrigin="anonymous"
                />
                <span className="font-sans text-[13px] font-medium text-foreground">
                  {article.sourceName}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {timeAgo(article.publishedAt)}
                </span>
              </div>

              {/* Category + tags */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <CategoryBadge category={article.category} />
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-2 py-0.5 font-sans text-[11px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Headline */}
              <h2 className="mb-3 font-serif text-2xl font-bold leading-tight text-foreground" style={{ letterSpacing: "-0.02em" }}>
                {article.title}
              </h2>

              {/* Summary */}
              <p className="mb-4 font-sans text-[15px] leading-relaxed text-muted-foreground">
                {article.summary}
              </p>

              {/* AI Summary */}
              <AiSummarySection title={article.title} summary={article.summary} url={article.originalUrl} />

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={article.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 font-sans text-[14px] font-semibold text-primary-foreground transition-transform active:scale-[0.97]"
                >
                  Visit Article
                  <ExternalLink size={15} strokeWidth={1.5} />
                </a>
                <button
                  onClick={() => toggleSaveArticle(article.id)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card transition-transform active:scale-[0.97]"
                >
                  {savedArticleIds.includes(article.id) ? (
                    <BookmarkCheck size={18} strokeWidth={1.5} className="text-primary" />
                  ) : (
                    <Bookmark size={18} strokeWidth={1.5} className="text-muted-foreground" />
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

function AiSummarySection({ title, summary, url }: { title: string; summary: string; url: string }) {
  const { aiSummary, isLoading } = useAiSummary(title, summary, url, true)

  if (isLoading) {
    return (
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={14} className="animate-pulse text-primary" />
          <span className="font-sans text-[12px] font-semibold text-primary">AI Summary</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-primary/10" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-primary/10" />
        </div>
      </div>
    )
  }

  if (!aiSummary) return null

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={14} className="text-primary" />
        <span className="font-sans text-[12px] font-semibold text-primary">AI Summary</span>
      </div>
      <p className="font-sans text-[14px] leading-relaxed text-foreground">
        {aiSummary}
      </p>
    </div>
  )
}
