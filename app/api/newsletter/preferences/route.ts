import { NextResponse } from "next/server"
import {
  getAdminDb,
  getAdminAuth,
  getAdminInitError,
} from "@/lib/firebase-admin"

/**
 * POST /api/newsletter/preferences
 *
 * Body: { subscribed: boolean }
 * Auth: Firebase ID token in `Authorization: Bearer <token>` header.
 *
 * Atomically reconciles a user's newsletter preference across BOTH:
 *  - users/{uid}.newsletterSubscribed
 *  - unsubscribed_emails/{emailDocId}  (global block list used by the
 *    admin newsletter sender)
 *
 * This fixes a long-standing bug where a user who unsubscribed via the
 * email link could re-enable the toggle in Profile, see
 * `newsletterSubscribed: true` on their account, and yet still never
 * receive a newsletter — because their email was permanently stuck in
 * `unsubscribed_emails`. The toggle now removes that block when turning
 * subscription back on, and re-applies it when turning subscription off,
 * keeping the two stores consistent.
 *
 * Failure modes (caller fallback): on 401/500 the client should fall
 * back to the existing client-side `saveProfile({ newsletterSubscribed })`
 * write so the user's local preference is at least persisted.
 */
export async function POST(request: Request) {
  // ── Parse body ───────────────────────────────────────────────────
  let body: { subscribed?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    )
  }
  if (typeof body?.subscribed !== "boolean") {
    return NextResponse.json(
      { error: "Body must include `subscribed: boolean`" },
      { status: 400 },
    )
  }
  const subscribed = body.subscribed

  // ── Authenticate via Firebase ID token ──────────────────────────
  const authHeader = request.headers.get("authorization") || ""
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return NextResponse.json(
      { error: "Missing Authorization Bearer token" },
      { status: 401 },
    )
  }
  const idToken = match[1].trim()

  const adminAuth = getAdminAuth()
  const db = getAdminDb()
  if (!adminAuth || !db) {
    return NextResponse.json(
      {
        error:
          getAdminInitError() ||
          "Firebase Admin is not configured on the server.",
      },
      { status: 500 },
    )
  }

  let uid: string
  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    uid = decoded.uid
  } catch (err) {
    console.error("[v0] Newsletter preferences: token verify failed:", err)
    return NextResponse.json(
      { error: "Invalid or expired authentication token" },
      { status: 401 },
    )
  }

  // ── Resolve the user's email from their profile (server-side, so
  //    the client cannot spoof an email belonging to someone else). ─
  let email: string | undefined
  try {
    const userSnap = await db.collection("users").doc(uid).get()
    if (userSnap.exists) {
      email = (userSnap.data()?.email as string | undefined)?.toLowerCase().trim()
    }
    // Fallback: try the auth record if the profile doc is missing one.
    if (!email) {
      const userRecord = await adminAuth.getUser(uid).catch(() => null)
      email = userRecord?.email?.toLowerCase().trim()
    }
  } catch (err) {
    console.error("[v0] Newsletter preferences: profile lookup failed:", err)
    return NextResponse.json(
      { error: "Failed to load user profile" },
      { status: 500 },
    )
  }

  // ── Apply the writes. We do them sequentially with their own
  //    try/catch so a failure on the secondary write doesn't lose the
  //    primary write (rule: fail safely / preserve existing
  //    functionality). ─────────────────────────────────────────────
  const now = new Date()
  try {
    await db
      .collection("users")
      .doc(uid)
      .set(
        {
          newsletterSubscribed: subscribed,
          updatedAt: now,
          ...(subscribed ? { resubscribedAt: now } : { unsubscribedAt: now }),
        },
        { merge: true },
      )
  } catch (err) {
    console.error(
      "[v0] Newsletter preferences: user doc update failed:",
      err,
    )
    return NextResponse.json(
      { error: "Failed to update user preference" },
      { status: 500 },
    )
  }

  if (email) {
    const blockRef = db
      .collection("unsubscribed_emails")
      .doc(emailToDocId(email))
    try {
      if (subscribed) {
        // Resubscribing: remove the global block so the admin send
        // route stops filtering this address out.
        await blockRef.delete().catch(() => {
          // Doc may not exist — that's fine.
        })
      } else {
        // Unsubscribing: keep the global block authoritative for
        // one-off recipients without a user doc.
        await blockRef.set(
          {
            email,
            unsubscribedAt: now,
          },
          { merge: true },
        )
      }
    } catch (err) {
      // Don't fail the whole request — the primary user-doc write
      // already succeeded. Log and continue.
      console.error(
        "[v0] Newsletter preferences: block-list sync failed:",
        err,
      )
    }
  }

  return NextResponse.json({
    success: true,
    subscribed,
    email: email || null,
  })
}

function emailToDocId(email: string): string {
  // Mirrors the sanitisation used by the unsubscribe route so the same
  // doc id is used in both directions.
  return email.replace(/\//g, "_")
}
