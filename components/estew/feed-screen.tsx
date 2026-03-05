"use client"

import { mockArticles } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import { TopHeader } from "./top-header"
import { SourceRow } from "./source-row"
import { CategoryTabs } from "./category-tabs"
import { HeroCard } from "./hero-card"
import { ArticleCard } from "./article-card"

export function FeedScreen() {
  const { activeCategory } = useAppStore()
  const filtered =
    activeCategory === "All"
      ? mockArticles
      : mockArticles.filter((a) => a.category === activeCategory)

  const hero = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div className="flex flex-col pb-20">
      <TopHeader />
      <SourceRow />
      <CategoryTabs />

      <div className="mt-3 flex flex-col">
        {hero && <HeroCard article={hero} />}
        {rest.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center px-5 py-20">
          <p className="text-center font-sans text-[15px] text-muted-foreground">
            No articles in this category yet.
          </p>
        </div>
      )}
    </div>
  )
}
