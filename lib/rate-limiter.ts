// Rate Limiting Controller for Estew
// Free users: 20 articles/day, Pro users: unlimited
// All users: 60 API requests/minute

import { db } from "./firebase"
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore"

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt?: string
  message?: string
  shouldUpgrade?: boolean
}

const FREE_DAILY_LIMIT = 20
const API_REQUESTS_PER_MINUTE = 60

// Get today's date key (YYYY-MM-DD)
function getTodayKey(): string {
  return new Date().toISOString().split("T")[0]
}

// Check and update article read count for a user
export async function checkArticleLimit(
  userId: string,
  userPlan: "free" | "pro"
): Promise<RateLimitResult> {
  // Pro users have unlimited access
  if (userPlan === "pro") {
    return { allowed: true, remaining: Infinity }
  }

  const todayKey = getTodayKey()
  const limitDocRef = doc(db, "rateLimits", `${userId}_${todayKey}`)

  try {
    const limitDoc = await getDoc(limitDocRef)

    if (!limitDoc.exists()) {
      // First read of the day - create the document
      await setDoc(limitDocRef, {
        userId,
        date: todayKey,
        articleReads: 1,
        createdAt: new Date().toISOString(),
      })
      return { allowed: true, remaining: FREE_DAILY_LIMIT - 1 }
    }

    const data = limitDoc.data()
    const currentReads = data.articleReads || 0

    if (currentReads >= FREE_DAILY_LIMIT) {
      // Limit reached
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      return {
        allowed: false,
        remaining: 0,
        resetAt: tomorrow.toISOString(),
        message: "Daily article limit reached. Upgrade to Pro for unlimited access.",
        shouldUpgrade: true,
      }
    }

    // Increment the read count
    await updateDoc(limitDocRef, {
      articleReads: increment(1),
    })

    return {
      allowed: true,
      remaining: FREE_DAILY_LIMIT - currentReads - 1,
    }
  } catch (error) {
    console.error("Rate limit check error:", error)
    // On error, allow access but log it
    return { allowed: true, remaining: FREE_DAILY_LIMIT }
  }
}

// Get current usage for display
export async function getUsageStats(
  userId: string,
  userPlan: "free" | "pro"
): Promise<{ used: number; limit: number; isUnlimited: boolean }> {
  if (userPlan === "pro") {
    return { used: 0, limit: Infinity, isUnlimited: true }
  }

  const todayKey = getTodayKey()
  const limitDocRef = doc(db, "rateLimits", `${userId}_${todayKey}`)

  try {
    const limitDoc = await getDoc(limitDocRef)
    if (!limitDoc.exists()) {
      return { used: 0, limit: FREE_DAILY_LIMIT, isUnlimited: false }
    }
    const data = limitDoc.data()
    return {
      used: data.articleReads || 0,
      limit: FREE_DAILY_LIMIT,
      isUnlimited: false,
    }
  } catch {
    return { used: 0, limit: FREE_DAILY_LIMIT, isUnlimited: false }
  }
}

// In-memory store for API rate limiting (per minute)
const apiRequestCounts = new Map<string, { count: number; resetAt: number }>()

export function checkApiRateLimit(userId: string): RateLimitResult {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute

  const existing = apiRequestCounts.get(userId)

  if (!existing || now > existing.resetAt) {
    // New window
    apiRequestCounts.set(userId, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: API_REQUESTS_PER_MINUTE - 1 }
  }

  if (existing.count >= API_REQUESTS_PER_MINUTE) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existing.resetAt).toISOString(),
      message: "Too many requests. Please wait.",
    }
  }

  existing.count++
  return { allowed: true, remaining: API_REQUESTS_PER_MINUTE - existing.count }
}
