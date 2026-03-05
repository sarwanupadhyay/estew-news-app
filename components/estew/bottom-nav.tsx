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
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[428px]"
      style={{
        background: "rgba(255, 255, 255, 0.18)",
        backdropFilter: "blur(40px) saturate(200%)",
        WebkitBackdropFilter: "blur(40px) saturate(200%)",
        borderTop: "1px solid rgba(255, 255, 255, 0.28)",
        boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
        height: "auto",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2" style={{ height: 64 }}>
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
              {isActive ? (
                <>
                  <span
                    className="font-sans text-[10px] font-medium"
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
              ) : (
                <span className="font-sans text-[10px] font-medium" style={{ color: "transparent" }}>
                  {tab.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
