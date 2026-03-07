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
  signUpWithEmail: (email: string, password: string) => Promise<void>
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
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const data = await getUserProfile(firebaseUser.uid)
          if (data) {
            const plan = data.plan || "free"
            setProfile({
              plan,
              topics: data.topics || [],
              companies: data.companies || [],
              savedArticles: data.savedArticles || [],
              displayName: data.displayName || firebaseUser.displayName || "",
              photoURL: data.photoURL || firebaseUser.photoURL || undefined,
              hasOnboarded: data.hasOnboarded ?? true,
            })
            // Load usage stats
            const stats = await getUsageStats(firebaseUser.uid, plan)
            setUsage({ articlesUsed: stats.used, articlesLimit: stats.limit, isUnlimited: stats.isUnlimited })
          } else {
            // New user - will go through onboarding
            setProfile({ ...defaultProfile, displayName: firebaseUser.displayName || "", photoURL: firebaseUser.photoURL || undefined })
          }
        } catch (err) {
          console.error("[v0] Error loading profile:", err)
          setProfile(defaultProfile)
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
      // Create initial profile for new Google users
      await createUserProfile(result.user.uid, {
        email: result.user.email || "",
        displayName: result.user.displayName || "",
        photoURL: result.user.photoURL || undefined,
        plan: "free",
        topics: [],
        companies: [],
        savedArticles: [],
      })
    }
  }

  const signInWithEmailFn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUpWithEmailFn = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    // Create initial profile
    await createUserProfile(result.user.uid, {
      email: result.user.email || "",
      displayName: email.split("@")[0],
      plan: "free",
      topics: [],
      companies: [],
      savedArticles: [],
    })
  }

  const signOutFn = async () => {
    await firebaseSignOut(auth)
    setProfile(null)
  }

  const saveProfile = async (data: Partial<UserProfile>) => {
    if (!user) return
    await updateUserProfile(user.uid, data)
    setProfile((prev) => prev ? { ...prev, ...data } : null)
  }

  const toggleSaveArticle = async (articleId: string) => {
    if (!user || !profile) return
    const newSaved = profile.savedArticles.includes(articleId)
      ? profile.savedArticles.filter((id) => id !== articleId)
      : [...profile.savedArticles, articleId]
    await updateUserProfile(user.uid, { savedArticles: newSaved })
    setProfile((prev) => prev ? { ...prev, savedArticles: newSaved } : null)
  }

  const completeOnboarding = async (topics: string[], companies: string[], plan: "free" | "pro") => {
    if (!user) return
    const data = { topics, companies, plan, hasOnboarded: true }
    await updateUserProfile(user.uid, data)
    setProfile((prev) => prev ? { ...prev, ...data } : null)
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
