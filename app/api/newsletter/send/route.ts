import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore"

// This endpoint is designed to be called by a cron job at 11:00 AM IST daily
// Vercel Cron: "0 5 * * *" (5:30 AM UTC = 11:00 AM IST)

export async function GET(request: Request) {
  try {
    // Verify cron secret (optional but recommended for security)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    // Find newsletters that are scheduled and ready to send
    const newslettersRef = collection(db, "newsletters")
    const q = query(
      newslettersRef,
      where("status", "==", "scheduled")
    )

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: "No scheduled newsletters to send",
        timestamp: now.toISOString(),
      })
    }

    // Filter newsletters where scheduledTime <= current time
    const readyNewsletters = snapshot.docs.filter((doc) => {
      const data = doc.data()
      if (!data.scheduledTime) return false

      const scheduledTime = data.scheduledTime instanceof Timestamp
        ? data.scheduledTime.toDate()
        : new Date(data.scheduledTime)

      return scheduledTime <= now
    })

    if (readyNewsletters.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No newsletters ready to send yet",
        timestamp: now.toISOString(),
      })
    }

    // Send each ready newsletter
    const results = []

    for (const doc of readyNewsletters) {
      const newsletterId = doc.id

      try {
        // Call the send endpoint
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"

        const sendResponse = await fetch(`${baseUrl}/api/admin/newsletter/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newsletterId }),
        })

        const sendResult = await sendResponse.json()

        results.push({
          newsletterId,
          success: sendResponse.ok,
          result: sendResult,
        })
      } catch (error) {
        results.push({
          newsletterId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} newsletter(s)`,
      results,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    )
  }
}
