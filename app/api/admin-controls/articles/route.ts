import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json({
      articles: [],
      total: 0,
      recent24h: 0,
      shown: 0,
      configError: getAdminInitError() || "Firebase Admin not configured",
    })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200)
    const category = searchParams.get("category") || ""
    const search = searchParams.get("search")?.toLowerCase() || ""

    let queryRef: FirebaseFirestore.Query = db.collection("articles")

    if (category && category !== "all") {
      queryRef = queryRef.where("category", "==", category)
    }

    queryRef = queryRef.orderBy("publishedAt", "desc").limit(limit)

    const snapshot = await queryRef.get()

    let articles = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "Untitled",
        summary: data.summary || "",
        sourceName: data.sourceName || "Unknown",
        category: data.category || "Other",
        publishedAt: data.publishedAt || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
        imageUrl: data.imageUrl || "",
        originalUrl: data.originalUrl || "",
        viewCount: data.viewCount || 0,
        storageTier: data.storageTier || "hot",
      }
    })

    if (search) {
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.sourceName.toLowerCase().includes(search) ||
          a.summary.toLowerCase().includes(search),
      )
    }

    const countAgg = await db.collection("articles").count().get()
    const total = countAgg.data().count

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const recent24h = articles.filter((a) => a.publishedAt && a.publishedAt > dayAgo).length

    return NextResponse.json({
      articles,
      total,
      recent24h,
      shown: articles.length,
    })
  } catch (err) {
    console.error("[v0] Articles list error:", err)
    return NextResponse.json({
      articles: [],
      total: 0,
      recent24h: 0,
      shown: 0,
      error: (err as Error).message,
    })
  }
}
