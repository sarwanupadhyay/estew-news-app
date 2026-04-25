import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Missing tool id" }, { status: 400 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      { error: getAdminInitError() || "Firebase Admin not configured" },
      { status: 500 },
    )
  }

  try {
    await db.collection("ai_tools").doc(id).delete()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] AI tool delete error:", err)
    return NextResponse.json(
      { error: "Failed to delete AI tool: " + (err as Error).message },
      { status: 500 },
    )
  }
}
