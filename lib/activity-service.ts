"use client"

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

// Get user activity history
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

// Get reading history specifically
export async function getReadingHistory(
  userId: string,
  userPlan: "free" | "pro",
  dailyLimit: number = 20
): Promise<Activity[]> {
  const activitiesRef = collection(db, "users", userId, "activities")
  
  // For free users, only show activities within their daily limit
  // For pro users, show all activities
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

// Get activity icon based on type
export function getActivityIcon(type: Activity["type"]): string {
  switch (type) {
    case "article_read":
      return "BookOpen"
    case "article_saved":
      return "Bookmark"
    case "article_unsaved":
      return "BookmarkMinus"
    case "search":
      return "Search"
    case "category_view":
      return "Folder"
    default:
      return "Activity"
  }
}
