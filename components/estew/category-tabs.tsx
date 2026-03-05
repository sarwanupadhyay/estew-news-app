"use client"

import { CATEGORIES } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"

export function CategoryTabs() {
  const { activeCategory, setActiveCategory } = useAppStore()

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-2">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.value
        return (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className="spring-bounce relative shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium"
            style={{
              background: isActive ? "rgba(0, 102, 255, 0.15)" : "var(--glass-bg)",
              border: isActive ? "1px solid rgba(0, 102, 255, 0.3)" : "1px solid var(--glass-border)",
              color: isActive ? "#0066FF" : "var(--text-secondary)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {cat.label}
            {isActive && (
              <motion.div
                layoutId="cat-tab-active"
                className="absolute inset-0 rounded-full"
                style={{
                  background: "rgba(0, 102, 255, 0.15)",
                  border: "1px solid rgba(0, 102, 255, 0.3)",
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
