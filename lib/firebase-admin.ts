import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let adminApp: App | null = null
let adminDb: Firestore | null = null

function initAdmin() {
  if (adminDb) return adminDb

  if (getApps().length > 0) {
    adminApp = getApps()[0]
    adminDb = getFirestore(adminApp)
    return adminDb
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set")
  }

  let serviceAccount
  try {
    const cleaned = serviceAccountKey.trim()
    serviceAccount = JSON.parse(cleaned)
  } catch (err) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON: " + (err as Error).message)
  }

  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  })

  adminDb = getFirestore(adminApp)
  return adminDb
}

export function getAdminDb(): Firestore {
  return initAdmin()
}
