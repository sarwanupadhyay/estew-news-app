import { db } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  where,
  deleteDoc,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore"

// Activity types
export interface Activity {
  id: string
  type: "article_read" | "article_saved" | "article_unsaved" | "search" | "category_view"
  articleId?: string
  articleTitle?: string
  articleSource?: string
  articleCategory?: string
  searchQuery?: string
  category?: string
  timestamp: Date
}

export interface ActivityPage {
  activities: Activity[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

// Record user activity
export async function recordActivity(
  userId: string,
  activity: Omit<Activity, "id" | "timestamp">
): Promise<string> {
  const activityRef = doc(collection(db, "users", userId, "activities"))
  
  await setDoc(activityRef, {
    ...activity,
    timestamp: serverTimestamp(),
  })
  
  return activityRef.id
}

// Get user activities for a specific date with pagination
export async function getActivitiesByDate(
  userId: string,
  date: Date,
  pageSize: number = 10,
  lastDocument?: QueryDocumentSnapshot<DocumentData> | null
): Promise<ActivityPage> {
  const activitiesRef = collection(db, "users", userId, "activities")
  
  // Create date range for the selected day
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  console.log("[v0] Fetching activities for date:", date.toISOString(), "userId:", userId)
  
  try {
    // Simplified query - just filter by timestamp range, then filter type in code
    // This avoids needing a composite index
    let q = query(
      activitiesRef,
      where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
      where("timestamp", "<=", Timestamp.fromDate(endOfDay)),
      orderBy("timestamp", "desc"),
      limit(50) // Fetch more to filter by type
    )
    
    // If we have a last document, start after it for pagination
    if (lastDocument) {
      q = query(
        activitiesRef,
        where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
        where("timestamp", "<=", Timestamp.fromDate(endOfDay)),
        orderBy("timestamp", "desc"),
        startAfter(lastDocument),
        limit(50)
      )
    }
    
    const snapshot = await getDocs(q)
    console.log("[v0] Raw activities fetched:", snapshot.docs.length)
    
    // Filter by type in code to avoid composite index requirement
    const filteredDocs = snapshot.docs.filter(doc => doc.data().type === "article_read")
    console.log("[v0] Filtered article_read activities:", filteredDocs.length)
    
    const docs = filteredDocs.slice(0, pageSize + 1)
  
    // Check if there are more results
    const hasMore = docs.length > pageSize
    const activitiesToReturn = hasMore ? docs.slice(0, pageSize) : docs
    
    const activities = activitiesToReturn.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        type: data.type,
        articleId: data.articleId,
        articleTitle: data.articleTitle,
        articleSource: data.articleSource,
        articleCategory: data.articleCategory,
        searchQuery: data.searchQuery,
        category: data.category,
        timestamp: data.timestamp instanceof Timestamp 
          ? data.timestamp.toDate() 
          : new Date(data.timestamp),
      }
    })
    
    console.log("[v0] Returning activities:", activities.length)
    
    return {
      activities,
      lastDoc: activitiesToReturn.length > 0 ? activitiesToReturn[activitiesToReturn.length - 1] : null,
      hasMore,
    }
  } catch (error) {
    console.error("[v0] Error fetching activities:", error)
    return {
      activities: [],
      lastDoc: null,
      hasMore: false,
    }
  }
}

// Get all dates that have activities (for calendar highlighting)
export async function getActivityDates(userId: string): Promise<Set<string>> {
  const activitiesRef = collection(db, "users", userId, "activities")
  
  // Get activities from the last 90 days
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  
  try {
    // Simplified query - filter by type in code to avoid composite index
    const q = query(
      activitiesRef,
      where("timestamp", ">=", Timestamp.fromDate(ninetyDaysAgo)),
      orderBy("timestamp", "desc")
    )
    
    const snapshot = await getDocs(q)
    const dates = new Set<string>()
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      // Filter for article_read type
      if (data.type !== "article_read") return
      
      const timestamp = data.timestamp instanceof Timestamp 
        ? data.timestamp.toDate() 
        : new Date(data.timestamp)
      // Format as YYYY-MM-DD for easy comparison
      const dateStr = timestamp.toISOString().split("T")[0]
      dates.add(dateStr)
    })
    
    console.log("[v0] Activity dates found:", dates.size)
    return dates
  } catch (error) {
    console.error("[v0] Error fetching activity dates:", error)
    return new Set()
  }
}

// Get user activity history (legacy - for backwards compatibility)
export async function getUserActivities(
  userId: string,
  limitCount: number = 50,
  activityType?: Activity["type"]
): Promise<Activity[]> {
  const activitiesRef = collection(db, "users", userId, "activities")
  
  let q = query(
    activitiesRef,
    orderBy("timestamp", "desc"),
    limit(limitCount)
  )
  
  if (activityType) {
    q = query(
      activitiesRef,
      where("type", "==", activityType),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    )
  }
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      type: data.type,
      articleId: data.articleId,
      articleTitle: data.articleTitle,
      articleSource: data.articleSource,
      articleCategory: data.articleCategory,
      searchQuery: data.searchQuery,
      category: data.category,
      timestamp: data.timestamp instanceof Timestamp 
        ? data.timestamp.toDate() 
        : new Date(data.timestamp),
    }
  })
}

// Get reading history specifically (legacy)
export async function getReadingHistory(
  userId: string,
  userPlan: "free" | "pro",
  dailyLimit: number = 20
): Promise<Activity[]> {
  const activitiesRef = collection(db, "users", userId, "activities")
  
  const limitCount = userPlan === "pro" ? 100 : dailyLimit
  
  const q = query(
    activitiesRef,
    where("type", "==", "article_read"),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  )
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      type: data.type,
      articleId: data.articleId,
      articleTitle: data.articleTitle,
      articleSource: data.articleSource,
      articleCategory: data.articleCategory,
      timestamp: data.timestamp instanceof Timestamp 
        ? data.timestamp.toDate() 
        : new Date(data.timestamp),
    }
  })
}

// Get today's read count
export async function getTodayReadCount(userId: string): Promise<number> {
  const activitiesRef = collection(db, "users", userId, "activities")
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const q = query(
    activitiesRef,
    where("type", "==", "article_read"),
    where("timestamp", ">=", Timestamp.fromDate(today)),
    orderBy("timestamp", "desc")
  )
  
  const snapshot = await getDocs(q)
  return snapshot.size
}

// Clear old activities (for maintenance)
export async function clearOldActivities(
  userId: string,
  daysOld: number = 30
): Promise<number> {
  const activitiesRef = collection(db, "users", userId, "activities")
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  const q = query(
    activitiesRef,
    where("timestamp", "<", Timestamp.fromDate(cutoffDate))
  )
  
  const snapshot = await getDocs(q)
  
  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
  await Promise.all(deletePromises)
  
  return snapshot.size
}

// Format activity for display
export function formatActivityLabel(activity: Activity): string {
  switch (activity.type) {
    case "article_read":
      return `Read: ${activity.articleTitle || "Unknown article"}`
    case "article_saved":
      return `Saved: ${activity.articleTitle || "Unknown article"}`
    case "article_unsaved":
      return `Removed from saved: ${activity.articleTitle || "Unknown article"}`
    case "search":
      return `Searched: "${activity.searchQuery}"`
    case "category_view":
      return `Browsed: ${activity.category} category`
    default:
      return "Unknown activity"
  }
}
