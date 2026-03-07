"use client"

import { useEffect } from "react"
import { useArticles } from "@/lib/use-articles"
import { useAppStore } from "@/lib/store"
import { TopHeader } from "./top-header"
import { SourceRow } from "./source-row"
import { CategoryTabs } from "./category-tabs"
import { HeroCard } from "./hero-card"
import { ArticleCard } from "./article-card"

export function FeedScreen() {
  const { activeCategory, setArticles } = useAppStore()
  const { articles, isLoading } = useArticles(activeCategory)

  // Sync fetched articles to the global store so other screens (detail, saved, trending) can access them
  useEffect(() => {
    if (articles.length > 0) {
      console.log("[v0] Feed loaded", articles.length, "articles for category:", activeCategory)
      setArticles(articles)
    }
  }, [articles, setArticles, activeCategory])

  const hero = articles[0]
  const rest = articles.slice(1)

  return (
    <div className="flex flex-col pb-20">
      <TopHeader />
      <SourceRow />
      <CategoryTabs />

      {isLoading ? (
        <div className="flex flex-col gap-4 px-4 pt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 h-40 rounded-xl bg-muted" />
              <div className="mb-1 h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col">
          {hero && <HeroCard article={hero} />}
          {rest.map((article, i) => (
            <ArticleCard key={article.id} article={article} index={i} />
          ))}
        </div>
      )}

      {!isLoading && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center px-5 py-20">
          <p className="text-center font-sans text-[15px] text-muted-foreground">
            No articles in this category yet.
          </p>
        </div>
      )}
      
      {/* Bottom spacing */}
      <div className="h-4" />
    </div>
  )
}
