import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb } from "@/lib/firebase-admin"

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = getAdminDb()

    // Run counts in parallel
    const [usersAgg, articlesAgg, newsletterSubsSnap, proSubsSnap, onboardedSnap] =
      await Promise.all([
        db.collection("users").count().get(),
        db.collection("articles").count().get(),
        db.collection("users").where("newsletterSubscribed", "==", true).count().get(),
        db.collection("users").where("plan", "==", "pro").count().get(),
        db.collection("users").where("hasOnboarded", "==", true).count().get(),
      ])

    return NextResponse.json({
      totalUsers: usersAgg.data().count,
      totalArticles: articlesAgg.data().count,
      newsletterSubscribers: newsletterSubsSnap.data().count,
      proSubscribers: proSubsSnap.data().count,
      onboardedUsers: onboardedSnap.data().count,
    })
  } catch (err) {
    console.error("Stats error:", err)
    return NextResponse.json(
      {
        totalUsers: 0,
        totalArticles: 0,
        newsletterSubscribers: 0,
        proSubscribers: 0,
        onboardedUsers: 0,
        error: (err as Error).message,
      },
      { status: 200 }
    )
  }
}
