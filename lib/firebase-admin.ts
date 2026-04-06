import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin(): Firestore | null {
  if (getApps().length > 0) {
    return getFirestore(getApps()[0])
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountKey) {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not set - admin features will be disabled")
    return null
  }

  // Debug: Check what the key looks like
  console.log("[v0] Service account key length:", serviceAccountKey.length)
  console.log("[v0] Key starts with:", serviceAccountKey.substring(0, 30))

  try {
    let cleanedKey = serviceAccountKey.trim()
    
    // Remove any surrounding quotes if present
    if ((cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) || 
        (cleanedKey.startsWith("'") && cleanedKey.endsWith("'"))) {
      cleanedKey = cleanedKey.slice(1, -1)
    }
    
    // If the key is base64 encoded, decode it
    if (!cleanedKey.startsWith("{")) {
      try {
        const decoded = Buffer.from(cleanedKey, "base64").toString("utf-8")
        if (decoded.startsWith("{")) {
          cleanedKey = decoded
        }
      } catch {
        // Not base64, continue with original
      }
    }
    
    if (!cleanedKey.startsWith("{")) {
      console.error("FIREBASE_SERVICE_ACCOUNT_KEY must contain valid JSON starting with {")
      return null
    }
    
    const serviceAccount = JSON.parse(cleanedKey) as ServiceAccount
    console.log("[v0] Parsed service account for project:", (serviceAccount as any).project_id)
    
    const app = initializeApp({
      credential: cert(serviceAccount),
    })
    
    console.log("[v0] Firebase Admin initialized successfully!")
    return getFirestore(app)
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error)
    return null
  }
}

// Export Firestore instance - initialized lazily
let _adminDb: Firestore | null | undefined = undefined

export function getAdminDb(): Firestore | null {
  if (_adminDb === undefined) {
    _adminDb = initializeFirebaseAdmin()
  }
  return _adminDb
}

// For backwards compatibility
export const adminDb = null as Firestore | null // Will be replaced by getAdminDb()

// Helper to check if admin is available
export function isAdminAvailable(): boolean {
  return getAdminDb() !== null
}
