"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
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

type AppState = "landing" | "onboarding" | "app"

export function AppShell() {
  const { user, loading } = useAuth()
  const [appState, setAppState] = useState<AppState>("landing")
  const [hasOnboarded, setHasOnboarded] = useState(false)
  const { activeTab } = useAppStore()

  useEffect(() => {
    if (!loading && user && !hasOnboarded) {
      setAppState("onboarding")
    } else if (!loading && user && hasOnboarded) {
      setAppState("app")
    }
  }, [user, loading, hasOnboarded])

  const handleLogin = () => {
    setAppState("onboarding")
  }

  const handleOnboardingComplete = () => {
    setHasOnboarded(true)
    setAppState("app")
  }

  // Show a loading screen while auth initializes
  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[428px] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
          <span className="font-sans text-xs text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  if (appState === "landing") {
    return (
      <div className="mx-auto max-w-[428px]">
        <LandingScreen onLogin={handleLogin} />
      </div>
    )
  }

  if (appState === "onboarding") {
    return (
      <div className="mx-auto max-w-[428px]">
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </div>
    )
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-[428px] bg-background">
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
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
