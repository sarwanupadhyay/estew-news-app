import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

export interface AdminUser {
  id: string
  email: string
  displayName: string
  plan: "free" | "pro"
  createdAt: string
  hasOnboarded: boolean
  topics?: string[]
}

export interface AdminArticle {
  id: string
  title: string
  sourceName: string
  category: string
  publishedAt: string
  imageUrl?: string
}

export interface AdminSubscriber {
  id: string
  displayName: string
  email: string
  plan: string
  status: string
  subscribedAt: string
  renewalDate: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  displayName: string
  subscribedAt: string
  status: "active" | "unsubscribed"
}

export interface AdminStats {
  totalUsers: number
  totalArticles: number
  totalSubscribers: number
  totalNewsletterSubscribers: number
  recentUsers: AdminUser[]
  recentArticles: AdminArticle[]
  subscribers: AdminSubscriber[]
  newsletterSubscribers: NewsletterSubscriber[]
}

// GET - Fetch admin stats
export async function GET() {
  const adminDb = getAdminDb()
  if (!adminDb) {
    console.error("[v0] Firebase Admin not configured for stats GET")
    return NextResponse.json({
      totalUsers: 0,
      totalArticles: 0,
      totalSubscribers: 0,
      totalNewsletterSubscribers: 0,
      recentUsers: [],
      recentArticles: [],
      subscribers: [],
      newsletterSubscribers: [],
      error: "Firebase Admin not configured"
    })
  }

  try {
    // Fetch all data in parallel
    const [usersSnapshot, articlesSnapshot, subscriptionsSnapshot] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("articles").orderBy("publishedAt", "desc").limit(20).get().catch(() => ({ docs: [] })),
      adminDb.collection("subscriptions").get().catch(() => ({ docs: [] })),
    ])

    // Process users
    const allUsers = usersSnapshot.docs
    const totalUsers = allUsers.length
    
    // Sort users by createdAt for recent users
    const recentUsers: AdminUser[] = allUsers
      .map(doc => {
        const data = doc.data()
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date(data.createdAt || Date.now())
        return {
          id: doc.id,
          email: data.email || "",
          displayName: data.displayName || data.name || "",
          plan: data.plan || "free",
          createdAt: createdAt.toISOString(),
          hasOnboarded: data.hasOnboarded || false,
          topics: data.topics || [],
          _sortDate: createdAt.getTime(),
        }
      })
      .sort((a, b) => b._sortDate - a._sortDate)
      .slice(0, 20)
      .map(({ _sortDate, ...user }) => user)

    // Count newsletter subscribers
    const newsletterSubscribers: NewsletterSubscriber[] = allUsers
      .filter(doc => doc.data().newsletterSubscribed === true)
      .map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          email: data.email || "",
          displayName: data.displayName || data.name || data.email?.split("@")[0] || "",
          subscribedAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString()
            : new Date(data.createdAt || Date.now()).toISOString(),
          status: "active" as const,
        }
      })

    // Process articles
    const totalArticles = articlesSnapshot.docs.length
    const recentArticles: AdminArticle[] = articlesSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        sourceName: data.sourceName || "",
        category: data.category || "",
        publishedAt: data.publishedAt instanceof Timestamp 
          ? data.publishedAt.toDate().toISOString()
          : new Date(data.publishedAt || Date.now()).toISOString(),
        imageUrl: data.imageUrl,
      }
    })

    // Process subscriptions
    const totalSubscribers = subscriptionsSnapshot.docs.length
    const subscribers: AdminSubscriber[] = subscriptionsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        displayName: data.displayName || doc.id,
        email: data.email || "",
        plan: data.plan || "pro",
        status: data.status || "active",
        subscribedAt: data.startDate instanceof Timestamp 
          ? data.startDate.toDate().toISOString()
          : data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : new Date(data.startDate || data.createdAt || Date.now()).toISOString(),
        renewalDate: data.renewalDate instanceof Timestamp 
          ? data.renewalDate.toDate().toISOString()
          : new Date(data.renewalDate || Date.now()).toISOString(),
      }
    })

    return NextResponse.json({
      totalUsers,
      totalArticles,
      totalSubscribers,
      totalNewsletterSubscribers: newsletterSubscribers.length,
      recentUsers,
      recentArticles,
      subscribers,
      newsletterSubscribers,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { 
        totalUsers: 0,
        totalArticles: 0,
        totalSubscribers: 0,
        totalNewsletterSubscribers: 0,
        recentUsers: [],
        recentArticles: [],
        subscribers: [],
        newsletterSubscribers: [],
        error: "Failed to fetch admin stats" 
      },
      { status: 500 }
    )
  }
}
