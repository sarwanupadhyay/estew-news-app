import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let adminDb: Firestore | null = null

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin(): Firestore | null {
  if (adminDb) {
    return adminDb
  }

  if (getApps().length > 0) {
    adminDb = getFirestore(getApps()[0])
    return adminDb
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountKey) {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not set")
    return null
  }

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
      console.error("FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON starting with {")
      return null
    }
    
    const serviceAccount = JSON.parse(cleanedKey) as ServiceAccount
    
    const app = initializeApp({
      credential: cert(serviceAccount),
    })
    
    adminDb = getFirestore(app)
    return adminDb
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error)
    return null
  }
}

// Get Admin Firestore instance
export function getAdminDb(): Firestore | null {
  return initializeFirebaseAdmin()
}
