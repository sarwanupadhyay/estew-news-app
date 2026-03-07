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

// Ensure article exists in Firestore, prevent duplicates by originalUrl
export async function persistArticle(article: Article): Promise<string> {
  try {
    // Check if article already exists by originalUrl
    const articlesRef = collection(db, "articles")
    const q = query(articlesRef, where("originalUrl", "==", article.originalUrl))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      // Article already exists, return existing ID
      return querySnapshot.docs[0].id
    }

    // Generate stable ID based on hash of originalUrl
    const articleId = `article_${Buffer.from(article.originalUrl).toString("base64").slice(0, 20)}`
    const articleRef = doc(db, "articles", articleId)

    // Store article with metadata for lifecycle management
    await setDoc(articleRef, {
      ...article,
      id: articleId,
      storageTier: "hot", // hot | warm | archive
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isArchived: false,
    })

    return articleId
  } catch (error) {
    console.error("Error persisting article:", error)
    throw error
  }
}

// Save article reference for user (not duplicate content)
export async function saveArticleForUser(userId: string, articleId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      savedArticles: arrayUnion(articleId),
      updatedAt: serverTimestamp(),
    })

    // Also create a reference doc in a subcollection for faster queries
    const savedRef = doc(db, `users/${userId}/saved_articles`, articleId)
    await setDoc(
      savedRef,
      {
        articleId,
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

// Retrieve article from Firestore
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

// Get user's saved articles
export async function getUserSavedArticles(userId: string): Promise<Article[]> {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists() || !userSnap.data().savedArticles) {
      return []
    }

    const savedArticleIds = userSnap.data().savedArticles as string[]
    const articles: Article[] = []

    // Fetch each article in parallel
    const promises = savedArticleIds.map((id) => getArticle(id))
    const results = await Promise.all(promises)

    return results.filter((article) => article !== null) as Article[]
  } catch (error) {
    console.error("Error getting user saved articles:", error)
    return []
  }
}

// Check if article is referenced by any user (for deletion protection)
export async function isArticleReferencedByUser(articleId: string): Promise<boolean> {
  try {
    // Query users collection for this articleId in their savedArticles array
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

    // Find articles to move from hot to warm
    const hotQuery = query(articlesRef, where("storageTier", "==", "hot"))
    const hotSnapshot = await getDocs(hotQuery)

    let archiveCount = 0

    for (const docSnap of hotSnapshot.docs) {
      const article = docSnap.data()
      const createdAt = article.createdAt?.toMillis?.() || 0

      if (createdAt < thirtyDaysAgo) {
        // Move to warm
        await updateDoc(docSnap.ref, {
          storageTier: "warm",
          updatedAt: serverTimestamp(),
        })
        archiveCount++
      }
    }

    // Find articles to archive from warm
    const warmQuery = query(articlesRef, where("storageTier", "==", "warm"))
    const warmSnapshot = await getDocs(warmQuery)

    for (const docSnap of warmSnapshot.docs) {
      const article = docSnap.data()
      const createdAt = article.createdAt?.toMillis?.() || 0

      if (createdAt < oneHundredEightyDaysAgo) {
        // Check if still referenced
        const isReferenced = await isArticleReferencedByUser(docSnap.id)

        if (!isReferenced) {
          // Move to archive
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
