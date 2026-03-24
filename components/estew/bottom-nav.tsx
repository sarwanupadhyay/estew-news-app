"use client"

import { Home, Compass, TrendingUp, Bookmark, User } from "lucide-react"
import { useAppStore } from "@/lib/store"

const tabs = [
  { id: "home" as const, label: "Home", icon: Home },
  { id: "explore" as const, label: "Explore", icon: Compass },
  { id: "trending" as const, label: "Trending", icon: TrendingUp },
  { id: "saved" as const, label: "Saved", icon: Bookmark },
  { id: "profile" as const, label: "Profile", icon: User },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore()

  const handleTabClick = (tabId: typeof tabs[number]["id"]) => {
    window.scrollTo({ top: 0, behavior: "instant" })
    setActiveTab(tabId)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[428px] border-t border-border bg-background/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
    >
      <div className="flex h-14 items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="text-[10px] font-medium">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
