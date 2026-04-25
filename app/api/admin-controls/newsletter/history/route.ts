import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json({
      sends: [],
      configError: getAdminInitError() || "Firebase Admin not configured",
    })
  }

  try {
    const snap = await db.collection("newsletter_sends").orderBy("sentAt", "desc").limit(20).get()

    const sends = snap.docs.map((doc) => {
      const d = doc.data()
      const sentAt =
        d.sentAt && typeof d.sentAt.toDate === "function"
          ? d.sentAt.toDate().toISOString()
          : new Date().toISOString()
      return {
        id: doc.id,
        sentAt,
        audience: d.audience || "unknown",
        subject: d.subject || "(no subject)",
        total: d.total || 0,
        sent: d.sent || 0,
        failed: d.failed || 0,
        sectionCount: d.newsletter?.sections?.length || 0,
      }
    })

    return NextResponse.json({ sends })
  } catch (err) {
    return NextResponse.json({
      sends: [],
      error: "Failed to load history: " + (err as Error).message,
    })
  }
}
