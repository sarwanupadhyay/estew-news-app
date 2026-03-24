"use client"

import { useEffect } from "react"
import { useArticles } from "@/lib/use-articles"
import { useAppStore } from "@/lib/store"
import { TopHeader } from "./top-header"
import { CategoryTabs } from "./category-tabs"
import { HeroCard } from "./hero-card"
import { ArticleCard } from "./article-card"

// Skeleton components for loading states
function HeroSkeleton() {
  return (
    <div className="mx-4 mb-4">
      <div className="aspect-[16/9] w-full animate-shimmer rounded-xl" />
    </div>
  )
}

function ArticleSkeleton() {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="h-4 w-full animate-shimmer rounded" />
          <div className="h-4 w-3/4 animate-shimmer rounded" />
          <div className="mt-1 flex items-center gap-2">
            <div className="h-4 w-4 animate-shimmer rounded" />
            <div className="h-3 w-20 animate-shimmer rounded" />
            <div className="h-3 w-12 animate-shimmer rounded" />
          </div>
        </div>
        <div className="h-[72px] w-[72px] shrink-0 animate-shimmer rounded-lg" />
      </div>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="animate-fade-in">
      <HeroSkeleton />
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          <ArticleSkeleton />
          <div className="mx-4 border-b border-border" />
        </div>
      ))}
    </div>
  )
}

export function FeedScreen() {
  const { activeCategory, setArticles } = useAppStore()
  const { articles, isLoading } = useArticles(activeCategory)

  // Sync fetched articles to the global store
  useEffect(() => {
    if (articles.length > 0) {
      setArticles(articles)
    }
  }, [articles, setArticles])

  const hero = articles[0]
  const rest = articles.slice(1)

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <TopHeader />
      <CategoryTabs />

      {isLoading ? (
        <FeedSkeleton />
      ) : articles.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
          <p className="text-center text-[15px] text-muted-foreground">
            No articles in this category yet.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col">
          {hero && <HeroCard article={hero} />}
          {rest.map((article, i) => (
            <ArticleCard key={article.id} article={article} index={i} />
          ))}
        </div>
      )}

      {/* Bottom safe area spacing */}
      <div className="h-4" />
    </div>
  )
}
