import { Timestamp } from "firebase-admin/firestore"
import { getAdminDb } from "./firebase-admin"

/**
 * Reads a Firestore date field that may be:
 *  - a Firestore Timestamp (server SDK or rest-shaped {_seconds})
 *  - an ISO string
 *  - a JS Date
 */
export function readDate(v: unknown): Date | null {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v === "string") {
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof v === "object") {
    const obj = v as { toDate?: () => Date; _seconds?: number }
    if (typeof obj.toDate === "function") {
      try {
        return obj.toDate()
      } catch {
        return null
      }
    }
    if (typeof obj._seconds === "number") {
      try {
        return new Date(obj._seconds * 1000)
      } catch {
        return null
      }
    }
  }
  return null
}

export interface ExpiredUserSummary {
  uid: string
  email: string
  displayName: string
  renewalDate: string | null
  daysExpired: number
}

/**
 * Scans all `plan == "pro"` users with a renewalDate in the past and:
 *  1. Downgrades them to plan = "free" with subscriptionStatus = "expired"
 *  2. Returns the list so the admin panel can show a notification banner
 *
 * This is idempotent — running it repeatedly only flips users whose
 * renewalDate is past AND whose plan is still "pro". Already-expired users
 * are excluded from the returned list because their plan has been moved.
 */
export async function expirePastDueProUsers(): Promise<{
  expiredNow: ExpiredUserSummary[]
  alreadyExpired: ExpiredUserSummary[]
  error?: string
}> {
  const db = getAdminDb()
  if (!db) {
    return {
      expiredNow: [],
      alreadyExpired: [],
      error: "Firebase Admin not configured",
    }
  }

  const now = new Date()

  try {
    const proSnap = await db.collection("users").where("plan", "==", "pro").get()
    const expiredNow: ExpiredUserSummary[] = []

    for (const doc of proSnap.docs) {
      const d = doc.data() as Record<string, unknown>
      const renewal = readDate(d.renewalDate)
      if (!renewal) continue
      if (renewal.getTime() > now.getTime()) continue

      const daysExpired = Math.floor(
        (now.getTime() - renewal.getTime()) / (24 * 60 * 60 * 1000),
      )

      await doc.ref.update({
        plan: "free",
        subscriptionStatus: "expired",
        subscriptionEndDate: Timestamp.fromDate(now),
      })

      expiredNow.push({
        uid: doc.id,
        email: (d.email as string) || "",
        displayName: (d.displayName as string) || "",
        renewalDate: renewal.toISOString(),
        daysExpired,
      })
    }

    // Also collect users who were already marked expired so the dashboard can
    // continue showing the notification until the admin acknowledges them.
    const alreadyExpiredSnap = await db
      .collection("users")
      .where("subscriptionStatus", "==", "expired")
      .get()
    const seenUids = new Set(expiredNow.map((u) => u.uid))
    const alreadyExpired: ExpiredUserSummary[] = []
    for (const doc of alreadyExpiredSnap.docs) {
      if (seenUids.has(doc.id)) continue
      const d = doc.data() as Record<string, unknown>
      const renewal = readDate(d.renewalDate)
      const daysExpired = renewal
        ? Math.floor((now.getTime() - renewal.getTime()) / (24 * 60 * 60 * 1000))
        : 0
      alreadyExpired.push({
        uid: doc.id,
        email: (d.email as string) || "",
        displayName: (d.displayName as string) || "",
        renewalDate: renewal ? renewal.toISOString() : null,
        daysExpired,
      })
    }

    return { expiredNow, alreadyExpired }
  } catch (err) {
    console.error("[v0] expirePastDueProUsers error:", err)
    return {
      expiredNow: [],
      alreadyExpired: [],
      error: (err as Error).message,
    }
  }
}
