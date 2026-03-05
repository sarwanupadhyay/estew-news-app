"use client"

import { CATEGORIES } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"

export function CategoryTabs() {
  const { activeCategory, setActiveCategory } = useAppStore()

  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto px-5 py-2">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.value
        return (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className="spring-bounce relative shrink-0 px-4 py-2 font-sans text-[13px] font-medium"
            style={{
              color: isActive ? "#0066FF" : "var(--text-muted)",
            }}
          >
            {cat.label}
            {isActive && (
              <motion.div
                layoutId="cat-underline"
                className="absolute bottom-0 left-2 right-2"
                style={{
                  height: 2,
                  borderRadius: 999,
                  background: "#0066FF",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
