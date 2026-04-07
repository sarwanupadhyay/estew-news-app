"use client"

import { useAppStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { useAiSummary } from "@/lib/use-articles"
import { timeAgo } from "@/lib/time"
import { saveArticleForUser, removeSavedArticle } from "@/lib/article-storage"
import { recordActivity } from "@/lib/activity-service"
import { ExternalLink, X, Bookmark, BookmarkCheck, Sparkles, Lock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"

export function ArticleDetail() {
  const { selectedArticleId, setSelectedArticleId, getArticleById, selectedArticle, setSelectedArticle } = useAppStore()
  const { profile, user, toggleSaveArticle } = useAuth()
  const [isSavingArticle, setIsSavingArticle] = useState(false)
  const hasRecordedActivity = useRef(false)
  
  const article = selectedArticle || (selectedArticleId ? getArticleById(selectedArticleId) : undefined)
  const isSaved = profile?.savedArticles?.includes(article?.id || "") || false
  const isPro = profile?.plan === "pro"

  const handleClose = () => {
    setSelectedArticleId(null)
    setSelectedArticle(null)
  }

  useEffect(() => {
    if (article && user && !hasRecordedActivity.current) {
      hasRecordedActivity.current = true
      recordActivity(user.uid, {
        type: "article_read",
        articleId: article.id,
        articleTitle: article.title,
        articleSource: article.sourceName,
        articleCategory: article.category,
      }).catch((err) => console.error("Failed to record activity:", err))
    }
    
    return () => {
      if (!selectedArticleId) {
        hasRecordedActivity.current = false
      }
    }
  }, [article, user, selectedArticleId])

  const handleSave = async () => {
    if (!article || !user) return

    setIsSavingArticle(true)
    try {
      if (isSaved) {
        // Unsave article - remove from both Firebase and local state
        await removeSavedArticle(user.uid, article.id)
        await recordActivity(user.uid, {
          type: "article_unsaved",
          articleId: article.id,
          articleTitle: article.title,
          articleSource: article.sourceName,
          articleCategory: article.category,
        })
      } else {
        // Save article - store full article data in user's subcollection
        await saveArticleForUser(user.uid, article.id, article)
        await recordActivity(user.uid, {
          type: "article_saved",
          articleId: article.id,
          articleTitle: article.title,
          articleSource: article.sourceName,
          articleCategory: article.category,
        })
      }
      // Update local state to reflect the change
      await toggleSaveArticle(article.id)
    } catch (error) {
      console.error("Error saving article:", error)
    } finally {
      setIsSavingArticle(false)
    }
  }

  return (
    <AnimatePresence>
      {article && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={handleClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[428px] overflow-hidden rounded-t-3xl border-t border-border bg-card"
            style={{ maxHeight: "90vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-muted" />
            </div>

            <div className="no-scrollbar overflow-y-auto px-4 pb-8" style={{ maxHeight: "calc(90vh - 24px)" }}>
              {/* Close */}
              <div className="mb-3 flex justify-end">
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                  aria-label="Close"
                >
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* Image */}
              <div className="mb-4 overflow-hidden rounded-xl">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="aspect-video w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/640x360/1a1b2e/666?text=Tech+News"
                  }}
                />
              </div>

              {/* Meta */}
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{article.sourceName}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>{timeAgo(article.publishedAt)}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-primary">{article.category}</span>
              </div>

              {/* Title */}
              <h2 className="mb-3 text-lg font-semibold leading-snug text-foreground">
                {article.title}
              </h2>

              {/* Summary */}
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {article.summary}
              </p>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {article.tags.slice(0, 4).map((tag) => (
                    <span 
                      key={tag} 
                      className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* AI Summary */}
              <AiSummarySection 
                title={article.title} 
                summary={article.summary} 
                url={article.originalUrl} 
                isPro={isPro} 
              />

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={article.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground press-effect"
                >
                  Read Full Article
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={handleSave}
                  disabled={isSavingArticle}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card transition-colors hover:bg-muted disabled:opacity-50 press-effect"
                  aria-label={isSaved ? "Unsave" : "Save"}
                >
                  {isSaved ? (
                    <BookmarkCheck size={18} className="text-primary" />
                  ) : (
                    <Bookmark size={18} className="text-muted-foreground" />
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

function AiSummarySection({ title, summary, url, isPro }: { title: string; summary: string; url: string; isPro: boolean }) {
  const { aiSummary, isLoading } = useAiSummary(title, summary, url, isPro)

  if (!isPro) {
    return (
      <div className="mb-5 rounded-xl border border-warning/20 bg-warning/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Lock size={14} className="text-warning" />
          <span className="text-xs font-semibold text-warning">AI Summary</span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          AI-powered summaries are available with Estew Pro.
        </p>
        <button className="flex items-center gap-1.5 rounded-lg bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning transition-colors hover:bg-warning/20">
          <Sparkles size={12} />
          Upgrade to Pro
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={14} className="animate-pulse text-primary" />
          <span className="text-xs font-semibold text-primary">AI Summary</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full animate-shimmer rounded" />
          <div className="h-3 w-4/5 animate-shimmer rounded" />
        </div>
      </div>
    )
  }

  if (!aiSummary) return null

  return (
    <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={14} className="text-primary" />
        <span className="text-xs font-semibold text-primary">AI Summary</span>
      </div>
      <p className="text-sm leading-relaxed text-foreground">
        {aiSummary}
      </p>
    </div>
  )
}
