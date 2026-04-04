"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateProfile,
  type User,
} from "./firebase"
import { checkArticleLimit, getUsageStats } from "./rate-limiter"

export interface UserProfile {
  plan: "free" | "pro"
  topics: string[]
  companies: string[]
  savedArticles: string[]
  displayName: string
  photoURL?: string
  hasOnboarded: boolean
  newsletterSubscribed: boolean
}

export interface UsageStats {
  articlesUsed: number
  articlesLimit: number
  isUnlimited: boolean
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  usage: UsageStats
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, newsletterSubscribed?: boolean) => Promise<void>
  signOut: () => Promise<void>
  saveProfile: (data: Partial<UserProfile>) => Promise<void>
  toggleSaveArticle: (articleId: string) => Promise<void>
  completeOnboarding: (topics: string[], companies: string[], plan: "free" | "pro") => Promise<void>
  updateDisplayName: (name: string) => Promise<void>
  updatePhotoURL: (url: string) => Promise<void>
  checkArticleAccess: () => Promise<{ allowed: boolean; message?: string; shouldUpgrade?: boolean }>
  refreshUsage: () => Promise<void>
}

const defaultProfile: UserProfile = {
  plan: "free",
  topics: [],
  companies: [],
  savedArticles: [],
  displayName: "",
  hasOnboarded: false,
  newsletterSubscribed: false,
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  usage: { articlesUsed: 0, articlesLimit: 20, isUnlimited: false },
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  saveProfile: async () => {},
  toggleSaveArticle: async () => {},
  completeOnboarding: async () => {},
  updateDisplayName: async () => {},
  updatePhotoURL: async () => {},
  checkArticleAccess: async () => ({ allowed: true }),
  refreshUsage: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState<UsageStats>({ articlesUsed: 0, articlesLimit: 20, isUnlimited: false })

  // Load profile when user changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[v0] Auth: User state changed:", firebaseUser?.email || "signed out")
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          console.log("[v0] Auth: Loading profile for", firebaseUser.uid)
          const data = await getUserProfile(firebaseUser.uid)
          if (data) {
            console.log("[v0] Auth: Profile found - plan:", data.plan, "hasOnboarded:", data.hasOnboarded, "newsletterSubscribed:", data.newsletterSubscribed)
            // Get the plan directly from Firebase - this preserves Pro status
            const plan = data.plan || "free"
            const topics = data.topics || []
            const companies = data.companies || []
            
            // Determine if user has completed onboarding:
            // 1. If hasOnboarded is explicitly set (true or false), use that value
            // 2. Only for LEGACY users (hasOnboarded === undefined): check if they have topics/companies
            // 3. NEW users will have hasOnboarded explicitly set to false by createUserProfile
            let hasOnboarded: boolean
            if (typeof data.hasOnboarded === "boolean") {
              // Explicit value - use it directly
              hasOnboarded = data.hasOnboarded
            } else {
              // Legacy user detection: only consider them onboarded if they have preferences set
              // This protects existing users who were created before hasOnboarded field existed
              hasOnboarded = topics.length > 0 || companies.length > 0
            }
            
            
            const profileData = {
              plan,
              topics,
              companies,
              savedArticles: data.savedArticles || [],
              displayName: data.displayName || firebaseUser.displayName || "",
              photoURL: data.photoURL || firebaseUser.photoURL || undefined,
              hasOnboarded,
              newsletterSubscribed: data.newsletterSubscribed ?? false,
            }
            console.log("[v0] Auth: Setting profile:", profileData.displayName, "plan:", profileData.plan, "hasOnboarded:", profileData.hasOnboarded)
            setProfile(profileData)
            // Load usage stats
            const stats = await getUsageStats(firebaseUser.uid, plan)
            setUsage({ articlesUsed: stats.used, articlesLimit: stats.limit, isUnlimited: stats.isUnlimited })
          } else {
            // New user - will go through onboarding
            setProfile({ ...defaultProfile, displayName: firebaseUser.displayName || "", photoURL: firebaseUser.photoURL || undefined })
          }
        } catch (err) {
          console.error("[v0] Error loading profile:", err)
          // On Firebase permission error, we cannot determine if user is new or existing
          // Default to showing them the app (hasOnboarded: true) to avoid breaking existing users
          // New users who hit this error will need to set preferences in their profile later
          setProfile({
            ...defaultProfile,
            displayName: firebaseUser.displayName || "",
            photoURL: firebaseUser.photoURL || undefined,
            hasOnboarded: true, // Assume existing user on error to avoid accidental plan downgrade
          })
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogleFn = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    // Check if user exists in Firestore
    const existing = await getUserProfile(result.user.uid)
    if (!existing) {
      // Create initial profile for new Google users - they need to complete onboarding
      await createUserProfile(result.user.uid, {
        email: result.user.email || "",
        displayName: result.user.displayName || "",
        photoURL: result.user.photoURL || undefined,
        plan: "free",
        topics: [],
        companies: [],
        savedArticles: [],
        hasOnboarded: false, // New users need onboarding
      })
    }
    // If existing user, their hasOnboarded status is preserved from Firestore
  }

  const signInWithEmailFn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUpWithEmailFn = async (email: string, password: string, newsletterSubscribed: boolean = false) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    // Create initial profile - new users need onboarding
    await createUserProfile(result.user.uid, {
      email: result.user.email || "",
      displayName: email.split("@")[0],
      plan: "free",
      topics: [],
      companies: [],
      savedArticles: [],
      newsletterSubscribed,
      hasOnboarded: false, // New users need onboarding
    })
  }

  const signOutFn = async () => {
    await firebaseSignOut(auth)
    setProfile(null)
  }

  const saveProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      console.error("[v0] saveProfile: No user logged in")
      return
    }
    try {
      await updateUserProfile(user.uid, data)
      setProfile((prev) => prev ? { ...prev, ...data } : null)
    } catch (err) {
      console.error("[v0] saveProfile error:", err)
      // Still update local state optimistically
      setProfile((prev) => prev ? { ...prev, ...data } : null)
      throw err // Re-throw so caller knows it failed
    }
  }

  // Toggle saved article in local state only
  // Firebase update is handled separately by saveArticleForUser/removeSavedArticle
  const toggleSaveArticle = async (articleId: string) => {
    if (!user || !profile) return
    const newSaved = profile.savedArticles.includes(articleId)
      ? profile.savedArticles.filter((id) => id !== articleId)
      : [...profile.savedArticles, articleId]
    // Only update local state - Firebase is already updated by the caller
    setProfile((prev) => prev ? { ...prev, savedArticles: newSaved } : null)
  }

  const completeOnboarding = async (topics: string[], companies: string[], plan: "free" | "pro") => {
    if (!user) {
      console.error("[v0] completeOnboarding: No user logged in")
      return
    }
    try {
      // Check if user already has a profile with a plan - don't overwrite existing paid plan
      const existingProfile = await getUserProfile(user.uid)
      const existingPlan = existingProfile?.plan
      
      
      // Only set the new plan if user doesn't have an existing plan (truly new user)
      // If they already have a plan (returning user), preserve it
      // IMPORTANT: "pro" plan should never be downgraded to "free"
      let finalPlan: "free" | "pro"
      if (existingPlan === "pro") {
        // Never downgrade pro users
        finalPlan = "pro"
      } else if (existingPlan) {
        // User has a plan, use it
        finalPlan = existingPlan
      } else {
        // New user, use the requested plan
        finalPlan = plan
      }
      
      
      const data = { topics, companies, plan: finalPlan, hasOnboarded: true }
      await updateUserProfile(user.uid, data)
      setProfile((prev) => prev ? { ...prev, ...data } : null)
    } catch (err) {
      console.error("[v0] completeOnboarding error:", err)
      // Still update local state to unblock user, preserve existing plan if available
      setProfile((prev) => {
        if (!prev) return null
        return { ...prev, topics, companies, hasOnboarded: true }
        // Note: NOT updating plan here to avoid accidentally downgrading
      })
    }
  }

  const updateDisplayName = async (name: string) => {
    if (!user) return
    await updateProfile(user, { displayName: name })
    await updateUserProfile(user.uid, { displayName: name })
    setProfile((prev) => prev ? { ...prev, displayName: name } : null)
  }

  const updatePhotoURL = async (url: string) => {
    if (!user) return
    await updateProfile(user, { photoURL: url })
    await updateUserProfile(user.uid, { photoURL: url })
    setProfile((prev) => prev ? { ...prev, photoURL: url } : null)
  }

  const checkArticleAccess = async () => {
    if (!user || !profile) return { allowed: true }
    const result = await checkArticleLimit(user.uid, profile.plan)
    if (result.allowed) {
      // Update local usage count
      setUsage((prev) => ({
        ...prev,
        articlesUsed: prev.articlesUsed + 1,
      }))
    }
    return {
      allowed: result.allowed,
      message: result.message,
      shouldUpgrade: result.shouldUpgrade,
    }
  }

  const refreshUsage = async () => {
    if (!user || !profile) return
    const stats = await getUsageStats(user.uid, profile.plan)
    setUsage({ articlesUsed: stats.used, articlesLimit: stats.limit, isUnlimited: stats.isUnlimited })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        usage,
        signInWithGoogle: signInWithGoogleFn,
        signInWithEmail: signInWithEmailFn,
        signUpWithEmail: signUpWithEmailFn,
        signOut: signOutFn,
        saveProfile,
        toggleSaveArticle,
        completeOnboarding,
        updateDisplayName,
        updatePhotoURL,
        checkArticleAccess,
        refreshUsage,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
