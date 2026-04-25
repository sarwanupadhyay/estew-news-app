import { NextResponse } from "next/server"
import { Resend } from "resend"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"
import { buildNewsletterHtml, type Newsletter } from "@/lib/newsletter-html"

export const maxDuration = 300

// Always send as "Estew" — extract just the email address from the env var
// (in case it was set as "Some Name <foo@bar.com>") and re-wrap it with the
// "Estew" display name so the recipient always sees "Estew" in their inbox.
function buildFromEmail(): string {
  const raw = (process.env.RESEND_FROM_EMAIL || "newsletter@estew.app").trim()
  // Extract "foo@bar.com" out of "Whatever <foo@bar.com>"
  const match = raw.match(/<([^>]+)>/)
  const email = (match ? match[1] : raw).trim()
  return `Estew <${email}>`
}

const FROM_EMAIL = buildFromEmail()

interface SendBody {
  newsletter: Newsletter
  audience: "all" | "newsletter" | "pro" | "single"
  singleEmail?: string
}

interface Recipient {
  email: string
  name?: string
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY is not configured" }, { status: 500 })
  }

  let body: SendBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.newsletter || !body.newsletter.sections?.length) {
    return NextResponse.json({ error: "Newsletter content is required" }, { status: 400 })
  }

  // Build recipient list
  let recipients: Recipient[] = []

  if (body.audience === "single") {
    if (!body.singleEmail || !body.singleEmail.includes("@")) {
      return NextResponse.json({ error: "Valid single email is required" }, { status: 400 })
    }
    recipients = [{ email: body.singleEmail.trim() }]
  } else {
    try {
      const db = getAdminDb()
      if (!db) {
        return NextResponse.json(
          { error: getAdminInitError() || "Firebase Admin not configured — cannot load recipients" },
          { status: 500 },
        )
      }
      let queryRef: FirebaseFirestore.Query = db.collection("users")
      if (body.audience === "newsletter") {
        queryRef = queryRef.where("newsletterSubscribed", "==", true)
      } else if (body.audience === "pro") {
        queryRef = queryRef.where("plan", "==", "pro")
      }
      const snap = await queryRef.get()
      recipients = snap.docs
        .map((doc) => {
          const d = doc.data()
          return { email: (d.email || "").trim(), name: d.displayName || "" }
        })
        .filter((r) => r.email && r.email.includes("@"))
    } catch (err) {
      console.error("[v0] Recipient fetch error:", err)
      return NextResponse.json(
        { error: "Failed to load recipients: " + (err as Error).message },
        { status: 500 }
      )
    }
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No recipients found for this audience" }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const subject = body.newsletter.subject || "Your daily Estew briefing"

  let sent = 0
  let failed = 0
  const errors: string[] = []

  // Send sequentially to respect Resend rate limits (2 req/sec free tier)
  for (const recipient of recipients) {
    const html = buildNewsletterHtml(body.newsletter, recipient.name)
    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [recipient.email],
        subject,
        html,
      })
      if (error) {
        failed++
        errors.push(`${recipient.email}: ${error.message}`)
      } else {
        sent++
      }
    } catch (err) {
      failed++
      errors.push(`${recipient.email}: ${(err as Error).message}`)
    }
    // Small delay to avoid rate limiting
    if (recipients.length > 5) {
      await new Promise((r) => setTimeout(r, 600))
    }
  }

  // Save send history
  try {
    const db = getAdminDb()
    if (!db) throw new Error("Firebase Admin not configured")
    await db.collection("newsletter_sends").add({
      sentAt: new Date(),
      audience: body.audience,
      subject,
      total: recipients.length,
      sent,
      failed,
      newsletter: body.newsletter,
    })
  } catch (err) {
    console.error("[v0] Failed to save send history:", err)
  }

  return NextResponse.json({
    sent,
    failed,
    total: recipients.length,
    errors: errors.slice(0, 10),
  })
}
