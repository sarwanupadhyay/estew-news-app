"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { MeshBackground } from "./mesh-background"
import { BottomNav } from "./bottom-nav"
import { ArticleDetail } from "./article-detail"
import { FeedScreen } from "./feed-screen"
import { ExploreScreen } from "./explore-screen"
import { TrendingScreen } from "./trending-screen"
import { SavedScreen } from "./saved-screen"
import { ProfileScreen } from "./profile-screen"
import { LandingScreen } from "./landing-screen"
import { OnboardingScreen } from "./onboarding-screen"
import { AnimatePresence, motion } from "framer-motion"

type AuthState = "landing" | "onboarding" | "app"

export function AppShell() {
  const [authState, setAuthState] = useState<AuthState>("landing")
  const { activeTab } = useAppStore()

  if (authState === "landing") {
    return (
      <div className="mx-auto max-w-[428px]">
        <LandingScreen onLogin={() => setAuthState("onboarding")} />
      </div>
    )
  }

  if (authState === "onboarding") {
    return (
      <div className="mx-auto max-w-[428px]">
        <OnboardingScreen onComplete={() => setAuthState("app")} />
      </div>
    )
  }

  return (
    <div className="mesh-bg relative mx-auto min-h-screen max-w-[428px]">
      <MeshBackground />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {activeTab === "home" && <FeedScreen />}
            {activeTab === "explore" && <ExploreScreen />}
            {activeTab === "trending" && <TrendingScreen />}
            {activeTab === "saved" && <SavedScreen />}
            {activeTab === "profile" && <ProfileScreen />}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />
      <ArticleDetail />
    </div>
  )
}
