import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"
import type { Newsletter } from "@/lib/newsletter-html"

export interface SavedNewsletterSummary {
  id: string
  subject: string
  date: string
  createdAt: string
  sectionCount: number
  articleCount: number
  hasAiTool: boolean
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json({
      newsletters: [],
      configError: getAdminInitError() || "Firebase Admin not configured",
    })
  }

  try {
    const snap = await db
      .collection("newsletters")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()

    const newsletters: SavedNewsletterSummary[] = snap.docs.map((d) => {
      const x = d.data() as Partial<Newsletter> & {
        createdAt?: string | { toDate?: () => Date }
      }
      const createdAtRaw = x.createdAt
      const createdAt =
        typeof createdAtRaw === "string"
          ? createdAtRaw
          : createdAtRaw && typeof createdAtRaw === "object" && "toDate" in createdAtRaw
            ? createdAtRaw.toDate?.()?.toISOString() ?? ""
            : x.date || ""

      const sections = Array.isArray(x.sections) ? x.sections : []
      const articleCount = sections.reduce(
        (sum, s) => sum + (Array.isArray(s.articles) ? s.articles.length : 0),
        0,
      )

      return {
        id: d.id,
        subject: x.subject || "(untitled)",
        date: x.date || createdAt,
        createdAt,
        sectionCount: sections.length,
        articleCount,
        hasAiTool: Boolean(x.aiToolOfDay),
      }
    })

    return NextResponse.json({ newsletters })
  } catch (err) {
    console.error("[v0] Newsletters list error:", err)
    return NextResponse.json(
      { newsletters: [], error: "Failed to load newsletters: " + (err as Error).message },
      { status: 500 },
    )
  }
}
