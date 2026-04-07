import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let adminDb: Firestore | null = null

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin(): Firestore | null {
  console.log("[v0] initializeFirebaseAdmin called")
  
  if (adminDb) {
    console.log("[v0] Returning cached adminDb")
    return adminDb
  }

  if (getApps().length > 0) {
    console.log("[v0] Reusing existing Firebase Admin app")
    adminDb = getFirestore(getApps()[0])
    return adminDb
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountKey) {
    console.error("[v0] FIREBASE_SERVICE_ACCOUNT_KEY is not set")
    return null
  }

  console.log("[v0] Service account key length:", serviceAccountKey.length)
  console.log("[v0] Key starts with:", serviceAccountKey.substring(0, 20))

  try {
    let cleanedKey = serviceAccountKey.trim()
    
    // Remove surrounding quotes if present
    if ((cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) || 
        (cleanedKey.startsWith("'") && cleanedKey.endsWith("'"))) {
      cleanedKey = cleanedKey.slice(1, -1)
    }
    
    // Try base64 decode if doesn't start with {
    if (!cleanedKey.startsWith("{")) {
      try {
        const decoded = Buffer.from(cleanedKey, "base64").toString("utf-8")
        if (decoded.startsWith("{")) {
          cleanedKey = decoded
        }
      } catch {
        // Not base64
      }
    }
    
    if (!cleanedKey.startsWith("{")) {
      console.error("[v0] FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON starting with {")
      console.error("[v0] Key starts with char code:", cleanedKey.charCodeAt(0))
      return null
    }
    
    console.log("[v0] Parsing service account JSON...")
    const serviceAccount = JSON.parse(cleanedKey) as ServiceAccount
    console.log("[v0] Parsed service account for project:", (serviceAccount as any).project_id)
    
    const app = initializeApp({
      credential: cert(serviceAccount),
    })
    
    console.log("[v0] Firebase Admin app initialized successfully")
    adminDb = getFirestore(app)
    return adminDb
  } catch (error) {
    console.error("[v0] Failed to initialize Firebase Admin:", error)
    return null
  }
}

// Get Admin Firestore instance
export function getAdminDb(): Firestore | null {
  return initializeFirebaseAdmin()
}
