import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

type Action = "extend" | "cancel" | "activate"

interface Body {
  action: Action
  // For extend: number of days to add (default 30)
  days?: number
}

export async function POST(
  req: Request,
  context: { params: Promise<{ uid: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { uid } = await context.params
  const body = (await req.json()) as Body

  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      {
        error:
          getAdminInitError() || "Firebase Admin not configured. Cannot modify subscriptions.",
      },
      { status: 500 },
    )
  }

  const userRef = db.collection("users").doc(uid)
  const snap = await userRef.get()
  if (!snap.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const data = snap.data() ?? {}

  // Helper to read a date field that may be Timestamp or ISO string
  const readDate = (v: unknown): Date | null => {
    if (!v) return null
    if (typeof v === "string") {
      const d = new Date(v)
      return isNaN(d.getTime()) ? null : d
    }
    if (typeof (v as { toDate?: () => Date }).toDate === "function") {
      return (v as { toDate: () => Date }).toDate()
    }
    return null
  }

  const now = new Date()

  if (body.action === "cancel") {
    await userRef.update({
      plan: "free",
      subscriptionStatus: "cancelled",
      subscriptionEndDate: Timestamp.fromDate(now),
      renewalDate: null,
      cancelledAt: Timestamp.fromDate(now),
    })
    return NextResponse.json({
      ok: true,
      message: "Subscription cancelled. User downgraded to Free.",
    })
  }

  if (body.action === "activate") {
    const days = Math.max(1, Math.min(body.days ?? 30, 365))
    const start = now
    const renewal = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    await userRef.update({
      plan: "pro",
      subscriptionStatus: "active",
      subscriptionStartDate: Timestamp.fromDate(start),
      renewalDate: Timestamp.fromDate(renewal),
      subscriptionEndDate: null,
      cancelledAt: null,
    })
    return NextResponse.json({
      ok: true,
      message: `Pro plan activated for ${days} days.`,
      renewalDate: renewal.toISOString(),
    })
  }

  if (body.action === "extend") {
    const days = Math.max(1, Math.min(body.days ?? 30, 365))
    const currentRenewal = readDate(data.renewalDate)
    // If current renewal is in the past or missing, base extension on now
    const base = currentRenewal && currentRenewal.getTime() > now.getTime() ? currentRenewal : now
    const newRenewal = new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
    await userRef.update({
      plan: "pro",
      subscriptionStatus: "active",
      renewalDate: Timestamp.fromDate(newRenewal),
      subscriptionEndDate: null,
      cancelledAt: null,
      ...(data.subscriptionStartDate
        ? {}
        : { subscriptionStartDate: Timestamp.fromDate(now) }),
    })
    return NextResponse.json({
      ok: true,
      message: `Subscription extended by ${days} days.`,
      renewalDate: newRenewal.toISOString(),
    })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
