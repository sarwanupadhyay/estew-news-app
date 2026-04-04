import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue, Timestamp } from "firebase-admin/firestore"

export interface AITool {
  id: string
  name: string
  description: string
  url: string
  imageUrl?: string
  category: "productivity" | "coding" | "writing" | "image" | "video" | "audio" | "research" | "other"
  featured: boolean
  createdAt: string
  updatedAt: string
}

// GET - Fetch all AI tools
export async function GET() {
  if (!adminDb) {
    return NextResponse.json({ tools: [], error: "Firebase Admin not configured" })
  }
  
  try {
    const snapshot = await adminDb.collection("ai_tools")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get()

    const tools: AITool[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        name: data.name || "",
        description: data.description || "",
        url: data.url || "",
        imageUrl: data.imageUrl || "",
        category: data.category || "other",
        featured: data.featured || false,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt || new Date().toISOString(),
      }
    })

    return NextResponse.json({ tools })
  } catch (error) {
    console.error("Error fetching AI tools:", error)
    return NextResponse.json(
      { tools: [], error: "Failed to fetch AI tools" },
      { status: 500 }
    )
  }
}

// POST - Create new AI tool
export async function POST(request: Request) {
  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
  }
  
  try {
    const body = await request.json()
    const { name, description, url, imageUrl, category, featured } = body

    if (!name || !description || !url) {
      return NextResponse.json(
        { error: "Name, description, and URL are required" },
        { status: 400 }
      )
    }

    const toolId = `tool_${Date.now()}`
    const toolRef = adminDb.collection("ai_tools").doc(toolId)

    await toolRef.set({
      name,
      description,
      url,
      imageUrl: imageUrl || "",
      category: category || "other",
      featured: featured || false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      toolId,
      message: "AI tool created successfully",
    })
  } catch (error) {
    console.error("Error creating AI tool:", error)
    return NextResponse.json(
      { error: "Failed to create AI tool" },
      { status: 500 }
    )
  }
}

// PATCH - Update AI tool
export async function PATCH(request: Request) {
  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
  }
  
  try {
    const body = await request.json()
    const { id, name, description, url, imageUrl, category, featured } = body

    if (!id) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      )
    }

    const toolRef = adminDb.collection("ai_tools").doc(id)
    const updateData: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (url !== undefined) updateData.url = url
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (category !== undefined) updateData.category = category
    if (featured !== undefined) updateData.featured = featured

    await toolRef.set(updateData, { merge: true })

    return NextResponse.json({
      success: true,
      message: "AI tool updated successfully",
    })
  } catch (error) {
    console.error("Error updating AI tool:", error)
    return NextResponse.json(
      { error: "Failed to update AI tool" },
      { status: 500 }
    )
  }
}

// DELETE - Remove AI tool
export async function DELETE(request: Request) {
  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      )
    }

    const toolRef = adminDb.collection("ai_tools").doc(id)
    await toolRef.delete()

    return NextResponse.json({
      success: true,
      message: "AI tool deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting AI tool:", error)
    return NextResponse.json(
      { error: "Failed to delete AI tool" },
      { status: 500 }
    )
  }
}
