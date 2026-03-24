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
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[428px] border-t border-border bg-card"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="group flex flex-col items-center gap-1 px-4 py-2 transition-colors"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                isActive ? "bg-primary/10" : ""
              }`}>
                <tab.icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={isActive ? "text-primary" : "text-muted-foreground"}
                />
              </div>
              <span className={`text-[10px] font-medium ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
