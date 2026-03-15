"use client"

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

export function AppShell() {
  const { user, profile, loading } = useAuth()
  const { activeTab } = useAppStore()

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

  // Not logged in - show landing (full width for desktop homepage)
  if (!user) {
    return <LandingScreen />
  }

  // Logged in but hasn't completed onboarding
  if (profile && !profile.hasOnboarded) {
    return (
      <div className="mx-auto max-w-[428px]">
        <OnboardingScreen />
      </div>
    )
  }

  // Fully authenticated and onboarded
  return (
    <div className="relative mx-auto min-h-screen max-w-[428px] bg-background">
      <div className="relative z-10">
        <div key={activeTab} className="animate-fade-in">
          {activeTab === "home" && <FeedScreen />}
          {activeTab === "explore" && <ExploreScreen />}
          {activeTab === "trending" && <TrendingScreen />}
          {activeTab === "saved" && <SavedScreen />}
          {activeTab === "profile" && <ProfileScreen />}
        </div>
      </div>

      <BottomNav />
      <ArticleDetail />
    </div>
  )
}
