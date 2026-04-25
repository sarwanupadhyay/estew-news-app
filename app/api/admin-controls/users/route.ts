import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb } from "@/lib/firebase-admin"

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all" // all | pro | free | newsletter | onboarded
    const search = searchParams.get("search")?.toLowerCase() || ""
    const limit = Math.min(parseInt(searchParams.get("limit") || "200", 10), 500)

    const db = getAdminDb()
    let queryRef: FirebaseFirestore.Query = db.collection("users")

    if (filter === "pro") queryRef = queryRef.where("plan", "==", "pro")
    else if (filter === "free") queryRef = queryRef.where("plan", "==", "free")
    else if (filter === "newsletter") queryRef = queryRef.where("newsletterSubscribed", "==", true)
    else if (filter === "onboarded") queryRef = queryRef.where("hasOnboarded", "==", true)

    const snapshot = await queryRef.limit(limit).get()

    let users = snapshot.docs.map((doc) => {
      const d = doc.data()
      return {
        uid: doc.id,
        email: d.email || "",
        displayName: d.displayName || "",
        photoURL: d.photoURL || "",
        plan: d.plan || "free",
        newsletterSubscribed: !!d.newsletterSubscribed,
        hasOnboarded: !!d.hasOnboarded,
        topics: Array.isArray(d.topics) ? d.topics : [],
        companies: Array.isArray(d.companies) ? d.companies : [],
        savedArticlesCount: Array.isArray(d.savedArticles) ? d.savedArticles.length : 0,
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() || null,
        subscriptionStartDate: d.subscriptionStartDate?.toDate?.()?.toISOString?.() || null,
        subscriptionEndDate: d.subscriptionEndDate?.toDate?.()?.toISOString?.() || null,
        renewalDate: d.renewalDate?.toDate?.()?.toISOString?.() || null,
      }
    })

    if (search) {
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(search) ||
          u.displayName.toLowerCase().includes(search)
      )
    }

    // Sort: newest first by createdAt
    users.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))

    return NextResponse.json({ users, total: users.length })
  } catch (err) {
    console.error("Users list error:", err)
    return NextResponse.json(
      { users: [], total: 0, error: (err as Error).message },
      { status: 200 }
    )
  }
}
