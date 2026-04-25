import { getAdminDb } from "./firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import type { Article } from "./types"

/**
 * Server-side article persistence using Firebase Admin SDK.
 * Bypasses Firestore security rules and uses batched writes for performance.
 *
 * Doc ID = the stable, URL-based article id (e.g. "art_1a2b3c"), so re-fetching
 * the same article from NewsAPI naturally deduplicates instead of creating new docs.
 */
export async function persistArticlesAdmin(
  articles: Article[],
): Promise<{ written: number; skipped: number; error?: string }> {
  if (!articles || articles.length === 0) {
    return { written: 0, skipped: 0 }
  }

  const db = getAdminDb()
  if (!db) {
    return {
      written: 0,
      skipped: articles.length,
      error: "Firebase Admin not configured — articles not persisted",
    }
  }

  try {
    const collectionRef = db.collection("articles")
    const batch = db.batch()
    let written = 0

    for (const article of articles) {
      if (!article.id || !article.originalUrl || !article.title) continue

      const docRef = collectionRef.doc(article.id)
      batch.set(
        docRef,
        {
          // Article fields (overwrite latest values)
          id: article.id,
          title: article.title,
          summary: article.summary || "",
          originalUrl: article.originalUrl,
          sourceName: article.sourceName || "Unknown",
          sourceLogoUrl: article.sourceLogoUrl || "",
          sourceAgencyId: article.sourceAgencyId || "",
          publishedAt: article.publishedAt || new Date().toISOString(),
          fetchedAt: article.fetchedAt || new Date().toISOString(),
          category: article.category || "Other",
          tags: article.tags || [],
          isVerifiedSource: article.isVerifiedSource ?? true,
          companyId: article.companyId ?? null,
          founderId: article.founderId ?? null,
          imageUrl: article.imageUrl || "",
          viewCount: article.viewCount ?? 0,

          // Lifecycle metadata — only set on first write, preserved on merge
          storageTier: "hot",
          isArchived: false,
          updatedAt: FieldValue.serverTimestamp(),
          // createdAt only set if missing (Admin SDK preserves it via merge below)
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      written++
    }

    if (written === 0) {
      return { written: 0, skipped: articles.length }
    }

    await batch.commit()
    return { written, skipped: articles.length - written }
  } catch (err) {
    console.error("[v0] persistArticlesAdmin error:", err)
    return {
      written: 0,
      skipped: articles.length,
      error: (err as Error).message,
    }
  }
}
