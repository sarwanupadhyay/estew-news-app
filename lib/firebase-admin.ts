import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let adminApp: App | null = null
let adminDb: Firestore | null = null
let initError: string | null = null

function parseServiceAccount(raw: string): { ok: true; value: any } | { ok: false; error: string } {
  let cleaned = raw.trim()

  // Strip surrounding single or double quotes if the user pasted the value with quotes
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1)
  }

  // If the value looks like base64 (no { at the start), try to decode it first
  if (!cleaned.startsWith("{")) {
    // Detect a raw PEM private key — this is the most common mistake
    if (cleaned.startsWith("-----BEGIN")) {
      return {
        ok: false,
        error:
          "FIREBASE_SERVICE_ACCOUNT_KEY contains only the PEM private key (starts with '-----BEGIN'). " +
          "You must paste the ENTIRE service account JSON file from Firebase Console > Project Settings > " +
          "Service accounts > Generate new private key. The value should start with '{' and contain a 'private_key' field inside it.",
      }
    }

    // Try base64 decode as a fallback (some people store it base64-encoded)
    try {
      const decoded = Buffer.from(cleaned, "base64").toString("utf-8").trim()
      if (decoded.startsWith("{")) {
        cleaned = decoded
      }
    } catch {
      // ignore, fall through to JSON parse error below
    }
  }

  if (!cleaned.startsWith("{")) {
    return {
      ok: false,
      error:
        "FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. The value must be the entire service account JSON object " +
        "starting with '{' and ending with '}'. Got something starting with: " +
        JSON.stringify(cleaned.slice(0, 30)),
    }
  }

  try {
    const parsed = JSON.parse(cleaned)
    return { ok: true, value: parsed }
  } catch (err) {
    return {
      ok: false,
      error:
        "FIREBASE_SERVICE_ACCOUNT_KEY failed JSON.parse: " +
        (err as Error).message +
        ". Re-download the service account file from Firebase Console and paste the whole JSON as-is.",
    }
  }
}

function initAdmin(): Firestore | null {
  if (adminDb) return adminDb
  if (initError) return null

  if (getApps().length > 0) {
    adminApp = getApps()[0]
    adminDb = getFirestore(adminApp)
    return adminDb
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!serviceAccountKey) {
    initError = "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set."
    console.error("[v0] " + initError)
    return null
  }

  const result = parseServiceAccount(serviceAccountKey)
  if (!result.ok) {
    initError = result.error
    console.error("[v0] " + initError)
    return null
  }

  const serviceAccount = result.value
  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    initError =
      "FIREBASE_SERVICE_ACCOUNT_KEY is missing required fields (project_id, client_email, private_key). " +
      "Re-download the service account JSON from Firebase Console."
    console.error("[v0] " + initError)
    return null
  }

  try {
    adminApp = initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      }),
      projectId: serviceAccount.project_id,
    })
    adminDb = getFirestore(adminApp)
    return adminDb
  } catch (err) {
    initError = "Firebase Admin initializeApp failed: " + (err as Error).message
    console.error("[v0] " + initError)
    return null
  }
}

export function getAdminDb(): Firestore | null {
  return initAdmin()
}

export function getAdminInitError(): string | null {
  initAdmin()
  return initError
}

export function isAdminConfigured(): boolean {
  return getAdminDb() !== null
}
