import { NextResponse } from "next/server"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"

/** Public — fetch a single newsletter by id (used for the web view link). */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  if (!id) {
    return NextResponse.json({ error: "Missing newsletter id" }, { status: 400 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      { error: getAdminInitError() || "Firestore is not configured" },
      { status: 500 },
    )
  }

  try {
    const doc = await db.collection("newsletters").doc(id).get()
    if (!doc.exists) {
      return NextResponse.json({ error: "Newsletter not found" }, { status: 404 })
    }
    const data = doc.data() || {}

    return NextResponse.json({
      newsletter: {
        id: doc.id,
        date: data.date || normalizeIso(data.createdAt) || new Date().toISOString(),
        subject: data.subject || "Estew Daily",
        intro: data.intro || "",
        sections: Array.isArray(data.sections) ? data.sections : [],
        aiToolOfDay: data.aiToolOfDay || null,
        createdAt: normalizeIso(data.createdAt),
      },
    })
  } catch (err) {
    console.error("[v0] Newsletter detail error:", err)
    return NextResponse.json(
      { error: "Failed to load newsletter: " + (err as Error).message },
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
