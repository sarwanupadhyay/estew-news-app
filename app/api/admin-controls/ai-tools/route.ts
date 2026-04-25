import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"

export interface AiTool {
  id: string
  name: string
  url: string
  description: string
  imageUrl?: string
  createdAt: string
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json({
      tools: [],
      configError: getAdminInitError() || "Firebase Admin not configured",
    })
  }

  try {
    const snap = await db
      .collection("ai_tools")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get()

    const tools: AiTool[] = snap.docs.map((d) => {
      const x = d.data()
      const createdAt =
        typeof x.createdAt === "string"
          ? x.createdAt
          : x.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString()
      return {
        id: d.id,
        name: x.name || "",
        url: x.url || "",
        description: x.description || "",
        imageUrl: x.imageUrl || "",
        createdAt,
      }
    })

    return NextResponse.json({ tools })
  } catch (err) {
    console.error("[v0] AI tools GET error:", err)
    return NextResponse.json(
      { tools: [], error: "Failed to load AI tools: " + (err as Error).message },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      { error: getAdminInitError() || "Firebase Admin not configured" },
      { status: 500 },
    )
  }

  let body: { name?: string; url?: string; description?: string; imageUrl?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const name = body.name?.trim() || ""
  const url = body.url?.trim() || ""
  const description = body.description?.trim() || ""
  const imageUrl = body.imageUrl?.trim() || ""

  if (!name || !url || !description) {
    return NextResponse.json(
      { error: "Name, URL, and description are required" },
      { status: 400 },
    )
  }

  // Light URL validation
  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: "Invalid tool URL" }, { status: 400 })
  }
  if (imageUrl) {
    try {
      new URL(imageUrl)
    } catch {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
    }
  }

  try {
    const createdAt = new Date().toISOString()
    const ref = await db.collection("ai_tools").add({
      name,
      url,
      description,
      imageUrl,
      createdAt,
    })

    return NextResponse.json({
      tool: { id: ref.id, name, url, description, imageUrl, createdAt },
    })
  } catch (err) {
    console.error("[v0] AI tools POST error:", err)
    return NextResponse.json(
      { error: "Failed to save AI tool: " + (err as Error).message },
      { status: 500 },
    )
  }
}
