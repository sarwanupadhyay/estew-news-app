import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"
import type { Newsletter } from "@/lib/newsletter-html"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Missing newsletter id" }, { status: 400 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      { error: getAdminInitError() || "Firebase Admin not configured" },
      { status: 500 },
    )
  }

  try {
    const doc = await db.collection("newsletters").doc(id).get()
    if (!doc.exists) {
      return NextResponse.json({ error: "Newsletter not found" }, { status: 404 })
    }
    const data = doc.data() as Partial<Newsletter> & { createdAt?: unknown }
    const newsletter: Newsletter = {
      date: data.date || new Date().toISOString(),
      subject: data.subject || "(untitled)",
      intro: data.intro,
      sections: Array.isArray(data.sections) ? data.sections : [],
      aiToolOfDay: data.aiToolOfDay ?? null,
    }
    return NextResponse.json({ id: doc.id, newsletter })
  } catch (err) {
    console.error("[v0] Newsletter GET error:", err)
    return NextResponse.json(
      { error: "Failed to load newsletter: " + (err as Error).message },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Missing newsletter id" }, { status: 400 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      { error: getAdminInitError() || "Firebase Admin not configured" },
      { status: 500 },
    )
  }

  try {
    await db.collection("newsletters").doc(id).delete()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] Newsletter delete error:", err)
    return NextResponse.json(
      { error: "Failed to delete newsletter: " + (err as Error).message },
      { status: 500 },
    )
  }
}
