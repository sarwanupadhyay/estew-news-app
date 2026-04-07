import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"
import { Timestamp, FieldValue } from "firebase-admin/firestore"

// GET - Fetch newsletter subscribers or all users
export async function GET(request: Request) {
  const adminDb = getAdminDb()
  if (!adminDb) {
    return NextResponse.json({ users: [], subscribers: [], count: 0 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const fetchAll = searchParams.get("all") === "true"
    
    let snapshot
    
    if (fetchAll) {
      // Fetch ALL users (for audience selection)
      snapshot = await adminDb.collection("users").get()
    } else {
      // Fetch only subscribers
      snapshot = await adminDb.collection("users")
        .where("newsletterSubscribed", "==", true)
        .get()
    }
    
    const users = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        email: data.email || "",
        displayName: data.displayName || data.name || data.email?.split("@")[0] || "",
        newsletterSubscribed: data.newsletterSubscribed === true,
        subscribedAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
        status: "active",
      }
    })

    // Return in format expected by the editor component
    if (fetchAll) {
      return NextResponse.json({ 
        users,
        count: users.length,
        subscriberCount: users.filter(u => u.newsletterSubscribed).length,
      })
    }

    return NextResponse.json({ 
      subscribers: users,
      count: users.length,
    })
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error)
    return NextResponse.json(
      { error: "Failed to fetch newsletter subscribers", users: [], subscribers: [], count: 0 },
      { status: 500 }
    )
  }
}

// POST - Sync newsletter subscribers to separate collection
export async function POST() {
  const adminDb = getAdminDb()
  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 })
  }
  
  try {
    const snapshot = await adminDb.collection("users")
      .where("newsletterSubscribed", "==", true)
      .get()
    
    let syncedCount = 0
    
    for (const userDoc of snapshot.docs) {
      const data = userDoc.data()
      const subscriberRef = adminDb.collection("newsletter_subscribers").doc(userDoc.id)
      
      await subscriberRef.set({
        userId: userDoc.id,
        email: data.email || "",
        displayName: data.displayName || data.name || "",
        subscribedAt: data.createdAt || FieldValue.serverTimestamp(),
        status: "active",
        syncedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
      
      syncedCount++
    }

    return NextResponse.json({ 
      success: true,
      message: `Synced ${syncedCount} newsletter subscribers`,
      count: syncedCount,
    })
  } catch (error) {
    console.error("Error syncing newsletter subscribers:", error)
    return NextResponse.json(
      { error: "Failed to sync newsletter subscribers" },
      { status: 500 }
    )
  }
}
