import { db } from "./firebase"
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  getCountFromServer,
} from "firebase/firestore"

// Admin credentials (in production, use environment variables)
const ADMIN_EMAIL = "sarwanupadhyay19@gmail.com"
const ADMIN_PASSWORD = "sarwan@1908"

export interface AdminUser {
  id: string
  email: string
  displayName: string
  plan: "free" | "pro"
  createdAt: Date
  hasOnboarded: boolean
  topics?: string[]
}

export interface AdminArticle {
  id: string
  title: string
  sourceName: string
  category: string
  publishedAt: Date
  imageUrl?: string
}

export interface AdminSubscriber {
  id: string
  displayName: string
  email: string
  plan: string
  status: string
  subscribedAt: Date
  renewalDate: Date
}

export interface AdminStats {
  totalUsers: number
  totalArticles: number
  totalSubscribers: number
  recentUsers: AdminUser[]
  recentArticles: AdminArticle[]
  subscribers: AdminSubscriber[]
}

// Verify admin credentials
export function verifyAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

// Get all users count
export async function getTotalUsersCount(): Promise<number> {
  try {
    const usersRef = collection(db, "users")
    const snapshot = await getCountFromServer(usersRef)
    return snapshot.data().count
  } catch (error) {
    console.error("Error getting users count:", error)
    return 0
  }
}

// Get all articles count
export async function getTotalArticlesCount(): Promise<number> {
  try {
    const articlesRef = collection(db, "articles")
    const snapshot = await getCountFromServer(articlesRef)
    return snapshot.data().count
  } catch (error) {
    console.error("Error getting articles count:", error)
    return 0
  }
}

// Get all subscribers count
export async function getTotalSubscribersCount(): Promise<number> {
  try {
    const subscribersRef = collection(db, "subscriptions")
    const snapshot = await getCountFromServer(subscribersRef)
    return snapshot.data().count
  } catch (error) {
    console.error("Error getting subscribers count:", error)
    return 0
  }
}

// Get recent users
export async function getRecentUsers(limitCount: number = 10): Promise<AdminUser[]> {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(limitCount))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        email: data.email || "",
        displayName: data.displayName || data.name || "",
        plan: data.plan || "free",
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date(data.createdAt || Date.now()),
        hasOnboarded: data.hasOnboarded || false,
        topics: data.topics || [],
      }
    })
  } catch (error) {
    console.error("Error getting recent users:", error)
    return []
  }
}

// Get recent articles
export async function getRecentArticles(limitCount: number = 10): Promise<AdminArticle[]> {
  try {
    const articlesRef = collection(db, "articles")
    const q = query(articlesRef, orderBy("publishedAt", "desc"), limit(limitCount))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        sourceName: data.sourceName || "",
        category: data.category || "",
        publishedAt: data.publishedAt instanceof Timestamp 
          ? data.publishedAt.toDate() 
          : new Date(data.publishedAt || Date.now()),
        imageUrl: data.imageUrl,
      }
    })
  } catch (error) {
    console.error("Error getting recent articles:", error)
    return []
  }
}

// Get all subscribers
export async function getAllSubscribers(): Promise<AdminSubscriber[]> {
  try {
    const subscribersRef = collection(db, "subscriptions")
    const q = query(subscribersRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        displayName: data.displayName || doc.id,
        email: data.email || "",
        plan: data.plan || "pro",
        status: data.status || "active",
        subscribedAt: data.startDate instanceof Timestamp 
          ? data.startDate.toDate() 
          : data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.startDate || data.createdAt || Date.now()),
        renewalDate: data.renewalDate instanceof Timestamp 
          ? data.renewalDate.toDate() 
          : new Date(data.renewalDate || Date.now()),
      }
    })
  } catch (error) {
    console.error("Error getting subscribers:", error)
    return []
  }
}

// Get all admin stats
export async function getAdminStats(): Promise<AdminStats> {
  const [totalUsers, totalArticles, totalSubscribers, recentUsers, recentArticles, subscribers] = 
    await Promise.all([
      getTotalUsersCount(),
      getTotalArticlesCount(),
      getTotalSubscribersCount(),
      getRecentUsers(20),
      getRecentArticles(20),
      getAllSubscribers(),
    ])

  return {
    totalUsers,
    totalArticles,
    totalSubscribers,
    recentUsers,
    recentArticles,
    subscribers,
  }
}

// Newsletter generation prompt
export const NEWSLETTER_SYSTEM_PROMPT = `SYSTEM PROMPT — ESTEW ADMIN NEWSLETTER GENERATOR

You are an AI editor generating newsletters for the Estew tech news platform.

Your task is to create a concise daily tech briefing using articles from the Estew database.

Instructions:

1. Select the most important articles from the provided list.
2. Organize them into sections:

• Top Story
• AI & Machine Learning
• Product Launches
• Market Updates

3. For each article produce:
   • headline
   • 1–2 sentence summary
   • link to original article

Rules:

• Never copy full article text.
• Write clear and concise summaries.
• Maintain a professional tone suitable for a tech intelligence newsletter.

Output must be structured for email rendering.`
