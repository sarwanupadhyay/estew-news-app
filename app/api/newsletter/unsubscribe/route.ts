import { NextResponse } from "next/server"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token"

/**
 * Handle POST unsubscribe requests:
 *  - From the in-app /unsubscribe confirmation page (JSON body { token })
 *  - From RFC 8058 one-click unsubscribe (form-encoded, headers set by clients)
 *
 * Public route — token signature is the only authorization needed.
 */
export async function POST(request: Request) {
  const token = await extractToken(request)
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  const verified = verifyUnsubscribeToken(token)
  if (!verified) {
    return NextResponse.json(
      { error: "Invalid or expired unsubscribe link" },
      { status: 400 },
    )
  }

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      { error: getAdminInitError() || "Firestore is not configured" },
      { status: 500 },
    )
  }

  const email = verified.email.toLowerCase()
  const now = new Date()

  try {
    // Find every user with this email (defensive — there should be at most one)
    // and flip newsletterSubscribed off.
    const snap = await db
      .collection("users")
      .where("email", "==", email)
      .get()

    if (!snap.empty) {
      const batch = db.batch()
      snap.docs.forEach((d) => {
        batch.update(d.ref, {
          newsletterSubscribed: false,
          unsubscribedAt: now,
          updatedAt: now,
        })
      })
      await batch.commit()
    }

    // Also record the unsubscribe in a dedicated collection so we don't
    // accidentally mail this address again, even if no user record exists
    // (e.g. one-off "single send" recipients).
    await db
      .collection("unsubscribed_emails")
      .doc(emailToDocId(email))
      .set(
        {
          email,
          unsubscribedAt: now,
        },
        { merge: true },
      )

    return NextResponse.json({ success: true, email })
  } catch (err) {
    console.error("[v0] Unsubscribe error:", err)
    return NextResponse.json(
      { error: "Failed to unsubscribe: " + (err as Error).message },
      { status: 500 },
    )
  }
}

async function extractToken(request: Request): Promise<string | null> {
  // Try query string first
  const url = new URL(request.url)
  const queryToken = url.searchParams.get("token")
  if (queryToken) return queryToken

  // Try JSON body
  const contentType = request.headers.get("content-type") || ""
  try {
    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}))
      if (typeof body?.token === "string") return body.token
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text()
      const params = new URLSearchParams(text)
      const t = params.get("token")
      if (t) return t
    }
  } catch {
    // Fall through
  }
  return null
}

function emailToDocId(email: string): string {
  // Firestore doc IDs cannot contain '/'; sanitize the email.
  return email.replace(/\//g, "_")
}
