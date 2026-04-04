import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin(): Firestore | null {
  console.log("[v0] Initializing Firebase Admin SDK...")
  
  if (getApps().length > 0) {
    console.log("[v0] Firebase Admin already initialized, reusing existing app")
    return getFirestore(getApps()[0])
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountKey) {
    console.error("[v0] FIREBASE_SERVICE_ACCOUNT_KEY is not set - admin features will be disabled")
    return null
  }

  console.log("[v0] Found FIREBASE_SERVICE_ACCOUNT_KEY, length:", serviceAccountKey.length)

  try {
    const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount
    console.log("[v0] Parsed service account for project:", (serviceAccount as any).project_id)
    
    const app = initializeApp({
      credential: cert(serviceAccount),
    })
    
    console.log("[v0] Firebase Admin app initialized successfully")
    return getFirestore(app)
  } catch (error) {
    console.error("[v0] Failed to initialize Firebase Admin:", error)
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
