import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountKey) {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not set")
    throw new Error("Firebase Admin SDK not configured")
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount
    return initializeApp({
      credential: cert(serviceAccount),
    })
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error)
    throw new Error("Invalid Firebase Admin credentials")
  }
}

// Initialize app
let app: ReturnType<typeof initializeApp> | null = null
try {
  app = initializeFirebaseAdmin()
} catch (error) {
  console.error("Firebase Admin initialization error:", error)
}

// Export Firestore instance
export const adminDb = app ? getFirestore(app) : null

// Helper to check if admin is available
export function isAdminAvailable(): boolean {
  return adminDb !== null
}
