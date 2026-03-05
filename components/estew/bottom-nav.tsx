"use client"

import { Home, Compass, TrendingUp, Bookmark, User } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"

const tabs = [
  { id: "home" as const, label: "Home", icon: Home },
  { id: "explore" as const, label: "Explore", icon: Compass },
  { id: "trending" as const, label: "Trending", icon: TrendingUp },
  { id: "saved" as const, label: "Saved", icon: Bookmark },
  { id: "profile" as const, label: "Profile", icon: User },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <nav
      className="glass-heavy fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[428px]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="spring-bounce relative flex flex-col items-center gap-0.5 px-3 py-1.5"
            >
              <tab.icon
                size={22}
                strokeWidth={1.5}
                className="spring-bounce"
                style={{ color: isActive ? "#0066FF" : "#9CA3AF" }}
              />
              {isActive && (
                <>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: "#0066FF" }}
                  >
                    {tab.label}
                  </span>
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 h-1 w-1 rounded-full"
                    style={{ background: "#0066FF" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
