import { NextResponse } from "next/server"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"

interface NewsletterDoc {
  date?: string
  subject?: string
  intro?: string
  sections?: Array<{
    title?: string
    description?: string
    articles?: Array<{ headline?: string; imageUrl?: string }>
  }>
  aiToolOfDay?: { name?: string; imageUrl?: string } | null
  createdAt?: string | { toDate?: () => Date } | Date
  articleCount?: number
}

interface NewsletterListItem {
  id: string
  date: string
  subject: string
  intro?: string
  preview: string
  coverImage?: string | null
  articleCount: number
  sectionCount: number
  createdAt: string
}

/**
 * Public list of recent newsletters.
 * - Maximum window is 30 days (no matter what the client asks for).
 * - Returns up to 30 most-recent newsletters within the window.
 * - The client paginates 10-at-a-time over this slice.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestedDays = parseInt(url.searchParams.get("days") || "30", 10)
  const days = Math.min(Math.max(isNaN(requestedDays) ? 30 : requestedDays, 1), 30)

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      {
        newsletters: [],
        days,
        total: 0,
        error: getAdminInitError() || "Firestore is not configured",
      },
      { status: 200 },
    )
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffIso = cutoff.toISOString()

  try {
    // We compare against `createdAt` which is stored as an ISO string on
    // generated newsletters (see the generate route).
    const snap = await db
      .collection("newsletters")
      .where("createdAt", ">=", cutoffIso)
      .orderBy("createdAt", "desc")
      .limit(30)
      .get()

    const newsletters: NewsletterListItem[] = snap.docs.map((doc) => {
      const data = doc.data() as NewsletterDoc

      const sections = Array.isArray(data.sections) ? data.sections : []

      // Best-effort cover image: first article image we can find.
      let coverImage: string | null = null
      for (const s of sections) {
        const articles = Array.isArray(s.articles) ? s.articles : []
        for (const a of articles) {
          if (a?.imageUrl) {
            coverImage = a.imageUrl
            break
          }
        }
        if (coverImage) break
      }
      if (!coverImage && data.aiToolOfDay?.imageUrl) {
        coverImage = data.aiToolOfDay.imageUrl
      }

      const preview =
        data.intro ||
        sections[0]?.description ||
        sections[0]?.articles?.[0]?.headline ||
        ""

      const articleCount =
        typeof data.articleCount === "number"
          ? data.articleCount
          : sections.reduce(
              (acc, s) => acc + (Array.isArray(s.articles) ? s.articles.length : 0),
              0,
            )

      return {
        id: doc.id,
        date: data.date || normalizeIso(data.createdAt) || new Date().toISOString(),
        subject: data.subject || "Estew Daily",
        intro: data.intro,
        preview,
        coverImage,
        articleCount,
        sectionCount: sections.length,
        createdAt: normalizeIso(data.createdAt) || new Date().toISOString(),
      }
    })

    return NextResponse.json({
      newsletters,
      days,
      total: newsletters.length,
    })
  } catch (err) {
    console.error("[v0] Newsletter list error:", err)
    return NextResponse.json(
      {
        newsletters: [],
        days,
        total: 0,
        error: "Failed to load newsletters: " + (err as Error).message,
      },
      { status: 500 },
    )
  }
}

function normalizeIso(
  v: string | { toDate?: () => Date } | Date | undefined,
): string | null {
  if (!v) return null
  if (typeof v === "string") return v
  if (v instanceof Date) return v.toISOString()
  if (typeof v === "object" && typeof v.toDate === "function") {
    try {
      return v.toDate().toISOString()
    } catch {
      return null
    }
  }
  return null
}
