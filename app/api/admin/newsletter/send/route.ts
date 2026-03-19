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

type AudienceType = "ALL_USERS" | "SUBSCRIBERS" | "SELECTED"

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

// Get all users
async function getAllUsers() {
  try {
    const usersRef = collection(db, "users")
    const snapshot = await getDocs(usersRef)

    return snapshot.docs.map((doc) => ({
      userId: doc.id,
      email: doc.data().email || "",
      displayName: doc.data().displayName || doc.data().name || "",
    }))
  } catch (error) {
    console.error("Error fetching all users:", error)
    return []
  }
}

// Get selected users by email
async function getSelectedUsers(emails: string[]) {
  if (!emails || emails.length === 0) return []
  
  try {
    const usersRef = collection(db, "users")
    // Firestore 'in' query supports max 30 items, so we need to batch
    const batches: Array<Promise<any>> = []
    
    for (let i = 0; i < emails.length; i += 30) {
      const batch = emails.slice(i, i + 30)
      const q = query(usersRef, where("email", "in", batch))
      batches.push(getDocs(q))
    }
    
    const results = await Promise.all(batches)
    const users: Array<{ userId: string; email: string; displayName: string }> = []
    
    for (const snapshot of results) {
      for (const doc of snapshot.docs) {
        users.push({
          userId: doc.id,
          email: doc.data().email || "",
          displayName: doc.data().displayName || doc.data().name || "",
        })
      }
    }
    
    return users
  } catch (error) {
    console.error("Error fetching selected users:", error)
    return []
  }
}

// Get recipients based on audience type
async function getRecipientsByAudience(
  audienceType: AudienceType, 
  selectedUsers: string[]
): Promise<Array<{ userId: string; email: string; displayName: string }>> {
  switch (audienceType) {
    case "ALL_USERS":
      return getAllUsers()
    case "SELECTED":
      return getSelectedUsers(selectedUsers)
    case "SUBSCRIBERS":
    default:
      return getNewsletterSubscribers()
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
  // Branded sender name for professional email display
  from: process.env.RESEND_FROM_EMAIL || "Estew Newsletter <newsletter@news.estew.xyz>",
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

// Section icons/labels for the new format
const SECTION_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  top_story: { label: "TOP STORY", emoji: "📰", color: "#EF4444" },
  ai_breakthroughs: { label: "AI BREAKTHROUGHS", emoji: "🤖", color: "#8B5CF6" },
  startup_radar: { label: "STARTUP RADAR", emoji: "🚀", color: "#F59E0B" },
  product_launches: { label: "PRODUCT LAUNCHES", emoji: "📦", color: "#10B981" },
  market_pulse: { label: "MARKET PULSE", emoji: "📊", color: "#3B82F6" },
  ai_tool_of_day: { label: "AI TOOL OF THE DAY", emoji: "🔧", color: "#EC4899" },
  quick_bytes: { label: "QUICK BYTES", emoji: "⚡", color: "#F97316" },
  developer_insight: { label: "DEVELOPER INSIGHT", emoji: "💻", color: "#06B6D4" },
}

// Convert newsletter sections to HTML email
function convertSectionsToHtml(sections: Array<{ id: string; title: string; content: string; articles?: Array<{ title: string; summary: string; sourceUrl: string; imageUrl?: string }> }>, subject: string, aiTool?: { name: string; description: string; url: string; imageUrl?: string }): string {
  let sectionsHtml = ""

  for (const section of sections) {
    // Skip any ai_tool sections from the generated content - we only use the special aiToolOfTheDay
    if (section.id === "ai_tool" || section.type === "ai_tool") {
      continue
    }
    
    const config = SECTION_CONFIG[section.id] || { label: section.title, emoji: "📄", color: "#6B7280" }

    sectionsHtml += `
      <div style="margin-bottom: 32px; padding: 20px; background-color: #1a1a1f; border-radius: 12px; border-left: 4px solid ${config.color};">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <span style="font-size: 20px; margin-right: 10px;">${config.emoji}</span>
          <h2 style="color: ${config.color}; font-size: 16px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">${config.label}</h2>
        </div>
    `

    // If section has articles with images
    if (section.articles && section.articles.length > 0) {
      for (const article of section.articles) {
        sectionsHtml += `
          <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
            ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />` : ""}
            <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.4;">${article.title}</h3>
            <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 8px 0; line-height: 1.6;">${article.summary}</p>
            <a href="${article.sourceUrl}" style="color: ${config.color}; font-size: 12px; text-decoration: none;">Read more →</a>
          </div>
        `
      }
    } else {
      // Plain text content
      const paragraphs = section.content.split("\n").filter(p => p.trim())
      for (const para of paragraphs) {
        // Check if it's a headline (starts with **)
        if (para.trim().startsWith("**") && para.trim().endsWith("**")) {
          sectionsHtml += `<h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 16px 0 8px 0;">${para.trim().slice(2, -2)}</h3>`
        } else if (para.trim().startsWith("Source:") || para.trim().startsWith("Read more:")) {
          const url = para.replace(/^(Source:|Read more:)\s*/i, "").trim()
          if (url.startsWith("http")) {
            sectionsHtml += `<p style="margin: 8px 0;"><a href="${url}" style="color: ${config.color}; font-size: 12px; text-decoration: none;">Read more →</a></p>`
          }
        } else if (para.trim().startsWith("- ")) {
          sectionsHtml += `<p style="color: #a1a1aa; font-size: 14px; margin: 4px 0 4px 16px; line-height: 1.5;">• ${para.trim().slice(2)}</p>`
        } else {
          sectionsHtml += `<p style="color: #d4d4d8; font-size: 14px; margin: 0 0 12px 0; line-height: 1.6;">${para.trim()}</p>`
        }
      }
    }

    sectionsHtml += `</div>`
  }

  // AI Tool of the Day special section
  if (aiTool) {
    sectionsHtml += `
      <div style="margin-bottom: 32px; padding: 24px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 12px;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <span style="font-size: 20px; margin-right: 10px;">🔧</span>
          <h2 style="color: #c4b5fd; font-size: 16px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">AI TOOL OF THE DAY</h2>
        </div>
        ${aiTool.imageUrl ? `<img src="${aiTool.imageUrl}" alt="${aiTool.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;" />` : ""}
        <h3 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">${aiTool.name}</h3>
        <p style="color: #c4b5fd; font-size: 14px; margin: 0 0 16px 0; line-height: 1.6;">${aiTool.description}</p>
        <a href="${aiTool.url}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">Try it now →</a>
      </div>
    `
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header with Logo -->
    <div style="text-align: center; padding: 32px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <!-- Logo -->
      <img src="https://estew.xyz/estew-logo.png" alt="Estew Logo" width="120" height="auto" style="display: block; margin: 0 auto 16px auto; max-width: 120px;" />
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">ESTEW</h1>
      <p style="color: #EF4444; font-size: 12px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Daily Tech Intelligence</p>
      <p style="color: #71717a; font-size: 12px; margin: 12px 0 0 0;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 0;">
      ${sectionsHtml}
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 32px 0; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="color: #71717a; font-size: 12px; margin: 0 0 16px 0;">You're receiving this because you subscribed to the Estew newsletter.</p>
      <div style="margin-bottom: 16px;">
        <a href="https://estew.xyz/" style="color: #a1a1aa; font-size: 12px; text-decoration: none; margin: 0 8px;">Manage preferences</a>
        <span style="color: #3f3f46;">|</span>
        <a href="https://estew.xyz" style="color: #a1a1aa; font-size: 12px; text-decoration: none; margin: 0 8px;">Visit Estew</a>
      </div>
      <p style="color: #52525b; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Estew. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Convert newsletter text content to HTML (fallback for old format)
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
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header with Logo -->
    <div style="text-align: center; padding: 32px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <!-- Logo -->
      <img src="https://estew.xyz/estew-logo.png" alt="Estew Logo" width="120" height="auto" style="display: block; margin: 0 auto 16px auto; max-width: 120px;" />
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">ESTEW</h1>
      <p style="color: #EF4444; font-size: 12px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Daily Tech Intelligence</p>
      <p style="color: #71717a; font-size: 12px; margin: 12px 0 0 0;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
    <div style="padding: 32px 0;">
`

  let inSection = false

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith("ESTEW DAILY TECH BRIEFING") || trimmedLine.startsWith("Date:")) {
      continue
    }

    // Section headers
    if (["TOP STORY", "AI BREAKTHROUGHS", "STARTUP RADAR", "PRODUCT LAUNCHES", "MARKET PULSE", "AI TOOL OF THE DAY", "QUICK BYTES", "DEVELOPER INSIGHT", "AI & MACHINE LEARNING", "MARKET UPDATES"].includes(trimmedLine)) {
      if (inSection) {
        html += `</div>`
      }
      const config = SECTION_CONFIG[trimmedLine.toLowerCase().replace(/ /g, "_")] || { color: "#6B7280", emoji: "📄" }
      html += `<div style="margin-bottom: 24px; padding: 16px; background-color: #1a1a1f; border-radius: 12px; border-left: 4px solid ${config.color};"><h2 style="color: ${config.color}; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase;">${config.emoji} ${trimmedLine}</h2>`
      inSection = true
      continue
    }

    if (trimmedLine.match(/^[-=]+$/)) {
      continue
    }

    if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
      html += `<h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 16px 0 8px 0;">${trimmedLine.slice(2, -2)}</h3>`
      continue
    }

    if (trimmedLine.startsWith("Read more:") || trimmedLine.startsWith("Source:") || trimmedLine.startsWith("Source Link:")) {
      const url = trimmedLine.replace(/^(Read more:|Source:|Source Link:)\s*/i, "")
      if (url.startsWith("http")) {
        html += `<p style="margin: 8px 0;"><a href="${url}" style="color: #EF4444; font-size: 12px; text-decoration: none;">Read more →</a></p>`
      }
      continue
    }

    if (trimmedLine && !trimmedLine.startsWith("-")) {
      html += `<p style="color: #d4d4d8; font-size: 14px; margin: 0 0 12px 0; line-height: 1.6;">${trimmedLine}</p>`
    } else if (trimmedLine.startsWith("- ")) {
      html += `<p style="color: #a1a1aa; font-size: 14px; margin: 4px 0 4px 16px;">• ${trimmedLine.slice(2)}</p>`
    }
  }

  if (inSection) {
    html += `</div>`
  }

  html += `
    </div>
    <div style="text-align: center; padding: 32px 0; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="color: #71717a; font-size: 12px; margin: 0 0 16px 0;">You're receiving this because you subscribed to the Estew newsletter.</p>
      <a href="https://estew.xyz/" style="color: #a1a1aa; font-size: 12px; text-decoration: none; margin: 0 8px;">Manage preferences</a>
      <span style="color: #3f3f46;">|</span>
      <a href="https://estew.xyz" style="color: #a1a1aa; font-size: 12px; text-decoration: none; margin: 0 8px;">Visit Estew</a>
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

// POST - Send newsletter to audience (supports re-sending)
export async function POST(request: Request) {
  try {
    const { newsletterId, audienceType: overrideAudience, selectedUsers: overrideSelectedUsers } = await request.json()

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

    // Use override audience if provided, otherwise use saved audience
    const audienceType: AudienceType = overrideAudience || newsletter.audienceType || "SUBSCRIBERS"
    const selectedUserEmails: string[] = overrideSelectedUsers || newsletter.selectedUsers || []

    // Get recipients based on audience type
    const recipients = await getRecipientsByAudience(audienceType, selectedUserEmails)

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: `No recipients found for audience type: ${audienceType}` },
        { status: 400 }
      )
    }

    // Update newsletter status to "sending"
    await updateDoc(newsletterRef, {
      status: "sending",
      audienceType,
      selectedUsers: selectedUserEmails,
      deliveryStats: {
        totalRecipients: recipients.length,
        delivered: 0,
        failed: 0,
        pending: recipients.length,
      },
      updatedAt: serverTimestamp(),
    })

    // Prepare email content
    const subject = newsletter.subject || `Estew Daily Tech Briefing - ${newsletter.date}`
    const textContent = newsletter.content || (newsletter.sections?.map((s: { title: string; content: string }) => `${s.title}\n${s.content}`).join("\n\n") || "")

    // Use section-based HTML if sections are available, otherwise fallback to text conversion
    let htmlContent: string
    if (newsletter.sections && Array.isArray(newsletter.sections) && newsletter.sections.length > 0) {
      htmlContent = convertSectionsToHtml(newsletter.sections, subject, newsletter.aiToolOfTheDay)
    } else {
      htmlContent = convertToHtml(newsletter.content, subject)
    }

    let delivered = 0
    let failed = 0

    // Send emails in batches to respect rate limits
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE)

      const results = await Promise.all(
        batch.map(async (recipient) => {
          const result = await sendEmail(recipient.email, subject, htmlContent, textContent)

          // Log the delivery
          await logDelivery(
            newsletterId,
            recipient.userId,
            recipient.email,
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
          totalRecipients: recipients.length,
          delivered,
          failed,
          pending: recipients.length - delivered - failed,
        },
        updatedAt: serverTimestamp(),
      })

      // Delay before next batch (rate limiting)
      if (i + BATCH_SIZE < recipients.length) {
        await delay(BATCH_DELAY_MS)
      }
    }

    // Build delivery history entry
    const deliveryHistoryEntry = {
      sentAt: new Date().toISOString(),
      audienceType,
      totalRecipients: recipients.length,
      delivered,
      failed,
    }

    // Get existing delivery history
    const existingHistory = newsletter.deliveryHistory || []

    // Update final status - always allow re-sending, track in history
    const finalStatus = delivered > 0 ? "sent" : "failed"

    await updateDoc(newsletterRef, {
      status: finalStatus,
      sentAt: serverTimestamp(),
      deliveryStats: {
        totalRecipients: recipients.length,
        delivered,
        failed,
        pending: 0,
      },
      deliveryHistory: [...existingHistory, deliveryHistoryEntry],
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      newsletterId,
      audienceType,
      stats: {
        totalRecipients: recipients.length,
        delivered,
        failed,
      },
      deliveryHistoryEntry,
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
