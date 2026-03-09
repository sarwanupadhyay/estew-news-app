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

// GET - Fetch all newsletter subscribers from users table
export async function GET() {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("newsletterSubscribed", "==", true))
    const snapshot = await getDocs(q)
    
    const subscribers = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        email: data.email || "",
        displayName: data.displayName || data.name || data.email?.split("@")[0] || "",
        subscribedAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
        status: "active",
      }
    })

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
    const q = query(usersRef, where("newsletterSubscribed", "==", true))
    const snapshot = await getDocs(q)
    
    let syncedCount = 0
    
    for (const userDoc of snapshot.docs) {
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
