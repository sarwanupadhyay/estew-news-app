import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

export interface AdminStats {
  totalUsers: number
  totalArticles: number
  totalSubscribers: number
  totalNewsletterSubscribers: number
  recentUsers: {
    id: string
    email: string
    displayName: string
    plan: string
    createdAt: Date
  }[]
  recentArticles: {
    id: string
    title: string
    sourceName: string
    category: string
    publishedAt: Date
    imageUrl?: string
  }[]
  subscribers: {
    id: string
    userId: string
    plan: string
    status: string
    createdAt: Date
  }[]
  newsletterSubscribers: {
    id: string
    email: string
    subscribedAt: Date
  }[]
}

export async function GET() {
  const adminDb = getAdminDb()
  
  if (!adminDb) {
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
    // Get counts
    const [usersSnapshot, articlesSnapshot, subscribersSnapshot] = await Promise.all([
      adminDb.collection("users").count().get(),
      adminDb.collection("articles").count().get(),
      adminDb.collection("subscriptions").count().get(),
    ])

    const totalUsers = usersSnapshot.data().count
    const totalArticles = articlesSnapshot.data().count
    const totalSubscribers = subscribersSnapshot.data().count

    // Get newsletter subscribers count from users who have newsletterSubscribed = true
    const newsletterQuery = adminDb.collection("users").where("newsletterSubscribed", "==", true)
    const newsletterSnapshot = await newsletterQuery.count().get()
    const totalNewsletterSubscribers = newsletterSnapshot.data().count

    // Get recent users
    const recentUsersSnapshot = await adminDb.collection("users")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get()

    const recentUsers = recentUsersSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        email: data.email || "",
        displayName: data.displayName || data.name || "",
        plan: data.plan || "free",
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      }
    })

    // Get recent articles - ordered by createdAt (when stored in Firebase)
    const recentArticlesSnapshot = await adminDb.collection("articles")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()

    const recentArticles = recentArticlesSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        sourceName: data.sourceName || "",
        category: data.category || "",
        publishedAt: data.publishedAt || new Date().toISOString(),
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
        imageUrl: data.imageUrl,
      }
    })

    // Get subscribers
    const subscribersDocSnapshot = await adminDb.collection("subscriptions")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()

    const subscribers = subscribersDocSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId || "",
        plan: data.plan || "pro",
        status: data.status || "active",
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      }
    })

    // Get newsletter subscribers (users with newsletterSubscribed = true)
    const newsletterSubsSnapshot = await adminDb.collection("users")
      .where("newsletterSubscribed", "==", true)
      .limit(100)
      .get()

    const newsletterSubscribers = newsletterSubsSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        email: data.email || "",
        subscribedAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      }
    })

    return NextResponse.json({
      totalUsers,
      totalArticles,
      totalSubscribers,
      totalNewsletterSubscribers,
      recentUsers,
      recentArticles,
      subscribers,
      newsletterSubscribers,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({
      totalUsers: 0,
      totalArticles: 0,
      totalSubscribers: 0,
      totalNewsletterSubscribers: 0,
      recentUsers: [],
      recentArticles: [],
      subscribers: [],
      newsletterSubscribers: [],
      error: String(error)
    }, { status: 500 })
  }
}
