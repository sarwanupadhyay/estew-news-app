import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"

// Rate limit: 100 emails per minute = ~1.6 seconds between batches of 10
const BATCH_SIZE = 10
const BATCH_DELAY_MS = 1000

// Get newsletter subscribers (users where newsletterSubscribed = true)
async function getNewsletterSubscribers() {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("newsletterSubscribed", "==", true))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      userId: doc.id,
      email: doc.data().email || "",
      displayName: doc.data().displayName || doc.data().name || "",
    }))
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return []
  }
}

// Log email delivery result
async function logDelivery(
  newsletterId: string,
  userId: string,
  email: string,
  status: "success" | "failed",
  errorMessage?: string
) {
  try {
    await addDoc(collection(db, "newsletter_logs"), {
      newsletterId,
      userId,
      email,
      status,
      errorMessage: errorMessage || null,
      sentAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error logging delivery:", error)
  }
}

// Send email using Resend API
async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Using Resend test domain for free tier - replace with verified domain in production
        from: process.env.RESEND_FROM_EMAIL || "Estew <newsletter@news.estew.xyz>",
        to: [to],
        subject: subject,
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.message || "Failed to send email" }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Convert newsletter text content to HTML
function convertToHtml(content: string, subject: string): string {
  // Convert plain text to styled HTML email
  const lines = content.split("\n")
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 2px solid #e74c3c; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #e74c3c; margin: 0; font-size: 24px; }
    .section { margin-bottom: 25px; }
    .section-title { color: #e74c3c; font-size: 18px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 15px; }
    .article { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
    .article:last-child { border-bottom: none; }
    .article h3 { margin: 0 0 8px 0; color: #2c3e50; font-size: 16px; }
    .article p { margin: 0 0 8px 0; color: #666; font-size: 14px; }
    .article a { color: #e74c3c; text-decoration: none; }
    .article a:hover { text-decoration: underline; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
    .footer a { color: #e74c3c; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ESTEW DAILY TECH BRIEFING</h1>
    </div>
    <div class="content">
`

  let inSection = false
  let currentSection = ""

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip the main title and date lines (they're in the header)
    if (trimmedLine.startsWith("ESTEW DAILY TECH BRIEFING") || trimmedLine.startsWith("Date:")) {
      continue
    }

    // Section headers
    if (trimmedLine === "TOP STORY" || trimmedLine === "AI & MACHINE LEARNING" ||
      trimmedLine === "PRODUCT LAUNCHES" || trimmedLine === "MARKET UPDATES") {
      if (inSection) {
        html += `</div>`
      }
      html += `<div class="section"><div class="section-title">${trimmedLine}</div>`
      inSection = true
      currentSection = trimmedLine
      continue
    }

    // Skip separator lines
    if (trimmedLine.match(/^[-=]+$/)) {
      continue
    }

    // Headlines (bold lines)
    if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
      html += `<div class="article"><h3>${trimmedLine.slice(2, -2)}</h3>`
      continue
    }

    // Links
    if (trimmedLine.startsWith("Read more:") || trimmedLine.startsWith("Source:")) {
      const url = trimmedLine.replace(/^(Read more:|Source:)\s*/, "")
      if (url.startsWith("http")) {
        html += `<p><a href="${url}">Read more</a></p></div>`
      }
      continue
    }

    // Regular content
    if (trimmedLine && !trimmedLine.startsWith("-")) {
      html += `<p>${trimmedLine}</p>`
    }
  }

  if (inSection) {
    html += `</div>`
  }

  html += `
    </div>
    <div class="footer">
      <p>You're receiving this because you subscribed to the Estew newsletter.</p>
      <p><a href="https://v0-estew.vercel.app/settings">Manage preferences</a> | <a href="https://v0-estew.vercel.app">Visit Estew</a></p>
    </div>
  </div>
</body>
</html>`

  return html
}

// Helper function to delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// POST - Send newsletter to all subscribers
export async function POST(request: Request) {
  try {
    const { newsletterId } = await request.json()

    if (!newsletterId) {
      return NextResponse.json(
        { error: "Newsletter ID is required" },
        { status: 400 }
      )
    }

    // Get the newsletter
    const newsletterRef = doc(db, "newsletters", newsletterId)
    const newsletterSnap = await getDoc(newsletterRef)

    if (!newsletterSnap.exists()) {
      return NextResponse.json(
        { error: "Newsletter not found" },
        { status: 404 }
      )
    }

    const newsletter = newsletterSnap.data()

    // Check if already sent
    if (newsletter.status === "sent") {
      return NextResponse.json(
        { error: "Newsletter has already been sent" },
        { status: 400 }
      )
    }

    // Get subscribers
    const subscribers = await getNewsletterSubscribers()

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No subscribers found" },
        { status: 400 }
      )
    }

    // Update newsletter status to "sending"
    await updateDoc(newsletterRef, {
      status: "sending",
      deliveryStats: {
        totalRecipients: subscribers.length,
        delivered: 0,
        failed: 0,
        pending: subscribers.length,
      },
      updatedAt: serverTimestamp(),
    })

    // Prepare email content
    const subject = newsletter.subject || `Estew Daily Tech Briefing - ${newsletter.date}`
    const textContent = newsletter.content
    const htmlContent = convertToHtml(newsletter.content, subject)

    let delivered = 0
    let failed = 0

    // Send emails in batches to respect rate limits
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)

      const results = await Promise.all(
        batch.map(async (subscriber) => {
          const result = await sendEmail(subscriber.email, subject, htmlContent, textContent)

          // Log the delivery
          await logDelivery(
            newsletterId,
            subscriber.userId,
            subscriber.email,
            result.success ? "success" : "failed",
            result.error
          )

          return result
        })
      )

      // Count results
      for (const result of results) {
        if (result.success) {
          delivered++
        } else {
          failed++
        }
      }

      // Update progress
      await updateDoc(newsletterRef, {
        deliveryStats: {
          totalRecipients: subscribers.length,
          delivered,
          failed,
          pending: subscribers.length - delivered - failed,
        },
        updatedAt: serverTimestamp(),
      })

      // Delay before next batch (rate limiting)
      if (i + BATCH_SIZE < subscribers.length) {
        await delay(BATCH_DELAY_MS)
      }
    }

    // Update final status
    const finalStatus = failed === 0 ? "sent" : delivered > 0 ? "partially_sent" : "failed"

    await updateDoc(newsletterRef, {
      status: finalStatus,
      sentAt: serverTimestamp(),
      deliveryStats: {
        totalRecipients: subscribers.length,
        delivered,
        failed,
        pending: 0,
      },
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      newsletterId,
      stats: {
        totalRecipients: subscribers.length,
        delivered,
        failed,
      },
    })
  } catch (error) {
    console.error("Newsletter send error:", error)
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    )
  }
}

// GET - Get delivery logs for a newsletter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const newsletterId = searchParams.get("newsletterId")

    if (!newsletterId) {
      return NextResponse.json(
        { error: "Newsletter ID is required" },
        { status: 400 }
      )
    }

    const logsRef = collection(db, "newsletter_logs")
    const q = query(logsRef, where("newsletterId", "==", newsletterId))
    const snapshot = await getDocs(q)

    const logs = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        email: data.email,
        status: data.status,
        errorMessage: data.errorMessage,
        sentAt: data.sentAt instanceof Timestamp
          ? data.sentAt.toDate().toISOString()
          : data.sentAt,
      }
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error fetching delivery logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch delivery logs" },
      { status: 500 }
    )
  }
}
