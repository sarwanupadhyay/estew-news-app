"use client"

import { CATEGORIES } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"

export function CategoryTabs() {
  const { activeCategory, setActiveCategory } = useAppStore()

  return (
    <div className="no-scrollbar flex gap-0 overflow-x-auto border-b border-border bg-background px-4">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.value
        return (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`relative shrink-0 px-3 py-3 text-[13px] font-medium transition-colors ${
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}
