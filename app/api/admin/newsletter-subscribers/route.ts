import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"

// GET - Fetch newsletter subscribers or all users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fetchAll = searchParams.get("all") === "true"
    
    const usersRef = collection(db, "users")
    let allDocs: typeof import("firebase/firestore").QueryDocumentSnapshot[] = []
    
    // Always fetch all users first, then filter - avoids index requirements
    try {
      const snapshot = await getDocs(usersRef)
      allDocs = snapshot.docs
    } catch (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ 
        subscribers: [],
        users: [],
        count: 0,
        error: "Failed to fetch users"
      })
    }
    
    const users = allDocs.map((docSnap) => {
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

    // Filter for subscribers only
    const subscribers = users.filter(u => u.newsletterSubscribed)

    return NextResponse.json({ 
      subscribers,
      count: subscribers.length,
    })
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error)
    return NextResponse.json(
      { error: "Failed to fetch newsletter subscribers" },
      { status: 500 }
    )
  }
}

// POST - Sync newsletter subscribers to separate collection
export async function POST() {
  try {
    const usersRef = collection(db, "users")
    // Fetch all users and filter client-side to avoid index requirements
    const snapshot = await getDocs(usersRef)
    const subscribedUsers = snapshot.docs.filter(d => d.data().newsletterSubscribed === true)
    
    let syncedCount = 0
    
    for (const userDoc of subscribedUsers) {
      const data = userDoc.data()
      const subscriberRef = doc(db, "newsletter_subscribers", userDoc.id)
      
      await setDoc(subscriberRef, {
        userId: userDoc.id,
        email: data.email || "",
        displayName: data.displayName || data.name || "",
        subscribedAt: data.createdAt || serverTimestamp(),
        status: "active",
        syncedAt: serverTimestamp(),
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
