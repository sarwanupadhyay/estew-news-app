"use client"

import { CATEGORIES } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"

export function CategoryTabs() {
  const { activeCategory, setActiveCategory } = useAppStore()

  return (
    <div className="no-scrollbar flex gap-0 overflow-x-auto border-b border-border px-5">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.value
        return (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className="relative shrink-0 px-3.5 py-2.5 font-sans text-[13px] font-medium transition-colors"
            style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
          >
            {cat.label}
            {isActive && (
              <motion.div
                layoutId="cat-underline"
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
