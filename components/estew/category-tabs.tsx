"use client"

import { CATEGORIES } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"

export function CategoryTabs() {
  const { activeCategory, setActiveCategory } = useAppStore()

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto bg-card px-4 py-3">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.value
        return (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
