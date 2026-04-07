import { db } from "./firebase"
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import type { Article } from "./types"

/**
 * Article Storage Engine
 * Manages article persistence, deduplication, and lifecycle
 */

// Generate a stable unique ID from URL using a proper hash
function generateArticleId(url: string): string {
  // Use a simple but reliable hash function
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Convert to positive hex string and prefix
  const positiveHash = Math.abs(hash).toString(16)
  // Add timestamp suffix for uniqueness in case of hash collision
  const timestamp = Date.now().toString(36)
  return `art_${positiveHash}_${timestamp}`
}

// In-memory cache to prevent duplicate writes in the same request
const persistenceCache = new Map<string, string>()

// Ensure article exists in Firestore, prevent duplicates by originalUrl
export async function persistArticle(article: Article): Promise<string> {
  const originalUrl = article.originalUrl
  
  // Check in-memory cache first (prevents duplicate writes in same batch)
  if (persistenceCache.has(originalUrl)) {
    return persistenceCache.get(originalUrl)!
  }

  try {
    // Check if article already exists by originalUrl
    const articlesRef = collection(db, "articles")
    const q = query(articlesRef, where("originalUrl", "==", originalUrl))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      // Article already exists, return existing ID
      const existingId = querySnapshot.docs[0].id
      persistenceCache.set(originalUrl, existingId)
      return existingId
    }

    // Generate new unique ID
    const articleId = generateArticleId(originalUrl)
    const articleRef = doc(db, "articles", articleId)
    
    // Check if this ID already exists (handle potential collision)
    const existingDoc = await getDoc(articleRef)
    if (existingDoc.exists()) {
      // ID collision - return existing doc's ID since it's the same URL
      const existingData = existingDoc.data()
      if (existingData.originalUrl === originalUrl) {
        persistenceCache.set(originalUrl, articleId)
        return articleId
      }
      // Different URL but same hash - append random suffix
      const uniqueId = `${articleId}_${Math.random().toString(36).substring(2, 8)}`
      const uniqueRef = doc(db, "articles", uniqueId)
      
      await setDoc(uniqueRef, {
        ...article,
        id: uniqueId,
        storageTier: "hot",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isArchived: false,
      })
      
      persistenceCache.set(originalUrl, uniqueId)
      return uniqueId
    }

    // Store article with metadata for lifecycle management
    await setDoc(articleRef, {
      ...article,
      id: articleId,
      storageTier: "hot",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isArchived: false,
    })

    persistenceCache.set(originalUrl, articleId)
    return articleId
  } catch (error) {
    console.error("Error persisting article:", error)
    // Return a fallback ID to prevent crashes
    const fallbackId = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    return fallbackId
  }
}

// Clear persistence cache (call periodically to free memory)
export function clearPersistenceCache(): void {
  persistenceCache.clear()
}

// Save article for user - stores full article data in user's subcollection
// This avoids permission issues with the global articles collection
export async function saveArticleForUser(userId: string, articleId: string, articleData?: Article): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      savedArticles: arrayUnion(articleId),
      updatedAt: serverTimestamp(),
    })

    // Store full article data in user's saved_articles subcollection
    // This ensures we can retrieve the article even if global storage fails
    const savedRef = doc(db, `users/${userId}/saved_articles`, articleId)
    await setDoc(
      savedRef,
      {
        articleId,
        ...(articleData ? { articleData } : {}),
        savedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error("Error saving article for user:", error)
    throw error
  }
}

// Remove saved article (only reference, not the article itself)
export async function removeSavedArticle(userId: string, articleId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      savedArticles: arrayRemove(articleId),
      updatedAt: serverTimestamp(),
    })

    // Also delete the subcollection reference
    const savedRef = doc(db, `users/${userId}/saved_articles`, articleId)
    await deleteDoc(savedRef)
  } catch (error) {
    console.error("Error removing saved article:", error)
    throw error
  }
}

// Retrieve article from Firestore by ID
export async function getArticle(articleId: string): Promise<Article | null> {
  try {
    const docRef = doc(db, "articles", articleId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? (docSnap.data() as Article) : null
  } catch (error) {
    console.error("Error retrieving article:", error)
    return null
  }
}

// Get user's saved articles with full article data
export async function getUserSavedArticles(userId: string): Promise<Article[]> {
  try {
    // Get articles from user's saved_articles subcollection
    // This is the primary source as it doesn't have permission issues
    const savedArticlesRef = collection(db, `users/${userId}/saved_articles`)
    const savedSnapshot = await getDocs(savedArticlesRef)
    
    const articles: Article[] = []
    
    for (const docSnap of savedSnapshot.docs) {
      const data = docSnap.data()
      
      // If article data is stored in the subcollection, use it directly
      if (data.articleData) {
        articles.push(data.articleData as Article)
      } else {
        // Fallback: try to get from global articles collection
        const article = await getArticle(data.articleId)
        if (article) {
          articles.push(article)
        }
      }
    }
    
    // Sort by savedAt timestamp (newest first)
    articles.sort((a, b) => {
      const aIndex = savedSnapshot.docs.findIndex(d => d.data().articleId === a.id)
      const bIndex = savedSnapshot.docs.findIndex(d => d.data().articleId === b.id)
      return bIndex - aIndex // Reverse order
    })
    
    return articles
  } catch (error) {
    console.error("Error getting user saved articles:", error)
    return []
  }
}

// Check if article is referenced by any user (for deletion protection)
export async function isArticleReferencedByUser(articleId: string): Promise<boolean> {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("savedArticles", "array-contains", articleId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.size > 0
  } catch (error) {
    console.error("Error checking article references:", error)
    return false
  }
}

// Archive old articles (older than 30 days in hot, 180 days archive)
export async function archiveOldArticles(): Promise<number> {
  try {
    const articlesRef = collection(db, "articles")
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const oneHundredEightyDaysAgo = now - 180 * 24 * 60 * 60 * 1000

    const hotQuery = query(articlesRef, where("storageTier", "==", "hot"))
    const hotSnapshot = await getDocs(hotQuery)

    let archiveCount = 0

    for (const docSnap of hotSnapshot.docs) {
      const article = docSnap.data()
      const createdAt = article.createdAt?.toMillis?.() || 0

      if (createdAt < thirtyDaysAgo) {
        await updateDoc(docSnap.ref, {
          storageTier: "warm",
          updatedAt: serverTimestamp(),
        })
        archiveCount++
      }
    }

    const warmQuery = query(articlesRef, where("storageTier", "==", "warm"))
    const warmSnapshot = await getDocs(warmQuery)

    for (const docSnap of warmSnapshot.docs) {
      const article = docSnap.data()
      const createdAt = article.createdAt?.toMillis?.() || 0

      if (createdAt < oneHundredEightyDaysAgo) {
        const isReferenced = await isArticleReferencedByUser(docSnap.id)
        if (!isReferenced) {
          await updateDoc(docSnap.ref, {
            storageTier: "archive",
            isArchived: true,
            updatedAt: serverTimestamp(),
          })
        }
        archiveCount++
      }
    }

    return archiveCount
  } catch (error) {
    console.error("Error archiving old articles:", error)
    return 0
  }
}
