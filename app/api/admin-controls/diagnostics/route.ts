import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAdminDb, getAdminInitError } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"
export const maxDuration = 60

type CheckStatus = "ok" | "warn" | "fail" | "skip"

interface Check {
  id: string
  category: "Firebase" | "Firestore Data" | "AI" | "Email" | "Payments" | "Auth"
  name: string
  status: CheckStatus
  message: string
  detail?: string
  fix?: string
}

function envPresent(key: string): boolean {
  return Boolean(process.env[key] && String(process.env[key]).trim().length > 0)
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const checks: Check[] = []

  // 1. Firebase Admin SDK init
  const initError = getAdminInitError()
  const db = getAdminDb()
  if (db) {
    checks.push({
      id: "firebase-admin-init",
      category: "Firebase",
      name: "Firebase Admin SDK initialized",
      status: "ok",
      message: "Service account loaded and Firestore client created.",
    })
  } else {
    checks.push({
      id: "firebase-admin-init",
      category: "Firebase",
      name: "Firebase Admin SDK initialized",
      status: "fail",
      message: "Firebase Admin failed to initialize.",
      detail: initError ?? "Unknown error.",
      fix:
        "Open Firebase Console > Project Settings > Service accounts > Generate new private key. " +
        "Paste the entire downloaded JSON file (starting with '{' and ending with '}') as the value " +
        "of FIREBASE_SERVICE_ACCOUNT_KEY in your project environment variables.",
    })
  }

  // 2. NEXT_PUBLIC_FIREBASE_* presence (client config)
  const publicKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]
  const missingPublic = publicKeys.filter((k) => !envPresent(k))
  checks.push({
    id: "firebase-public-config",
    category: "Firebase",
    name: "Firebase client configuration",
    status: missingPublic.length === 0 ? "ok" : "fail",
    message:
      missingPublic.length === 0
        ? "All NEXT_PUBLIC_FIREBASE_* variables are set."
        : `Missing variables: ${missingPublic.join(", ")}.`,
    fix:
      missingPublic.length === 0
        ? undefined
        : "Add the missing client-side Firebase configuration variables. These come from Firebase Console > Project Settings > General > Your apps > Web app > SDK setup and configuration.",
  })

  // 3. Firestore connectivity + collection counts
  const collectionsToCheck = [
    { name: "users", critical: true },
    { name: "articles", critical: true },
    { name: "newsletter_sends", critical: false },
  ] as const

  if (db) {
    for (const c of collectionsToCheck) {
      try {
        const snap = await db.collection(c.name).count().get()
        const count = snap.data().count
        checks.push({
          id: `firestore-collection-${c.name}`,
          category: "Firestore Data",
          name: `Collection: ${c.name}`,
          status: count > 0 ? "ok" : c.critical ? "warn" : "ok",
          message:
            count > 0
              ? `${count} document${count === 1 ? "" : "s"} found.`
              : c.critical
                ? "Collection is empty."
                : "Collection is empty (this is fine if you have not sent any newsletters yet).",
          fix:
            count === 0 && c.name === "articles"
              ? "Newsletter generation requires articles in this collection. Trigger your news ingestion workflow or seed articles before generating a newsletter."
              : count === 0 && c.name === "users" && c.critical
                ? "No users have signed up yet. Once users register through the main app, they will appear here."
                : undefined,
        })

        // Check freshness for articles
        if (c.name === "articles" && count > 0) {
          try {
            const recent = await db
              .collection("articles")
              .orderBy("publishedAt", "desc")
              .limit(1)
              .get()
            const top = recent.docs[0]?.data()
            const publishedAt =
              typeof top?.publishedAt === "string"
                ? new Date(top.publishedAt)
                : top?.publishedAt?.toDate?.() ?? null
            if (publishedAt) {
              const ageHours = (Date.now() - publishedAt.getTime()) / 36e5
              checks.push({
                id: "articles-freshness",
                category: "Firestore Data",
                name: "Article freshness",
                status: ageHours <= 24 ? "ok" : ageHours <= 72 ? "warn" : "fail",
                message:
                  ageHours <= 24
                    ? `Most recent article is ${ageHours.toFixed(1)}h old.`
                    : `Most recent article is ${(ageHours / 24).toFixed(1)} days old.`,
                fix:
                  ageHours > 24
                    ? "Newsletter generation prefers articles from the last 24 hours. Trigger your news ingestion workflow to pull fresh stories into Firestore."
                    : undefined,
              })
            }
          } catch (err) {
            checks.push({
              id: "articles-freshness",
              category: "Firestore Data",
              name: "Article freshness",
              status: "warn",
              message: "Could not determine article age.",
              detail: (err as Error).message,
            })
          }
        }
      } catch (err) {
        checks.push({
          id: `firestore-collection-${c.name}`,
          category: "Firestore Data",
          name: `Collection: ${c.name}`,
          status: "fail",
          message: "Failed to query collection.",
          detail: (err as Error).message,
          fix:
            "Make sure the service account has the 'Firebase Admin' or 'Cloud Datastore User' IAM role in the GCP project.",
        })
      }
    }
  } else {
    for (const c of collectionsToCheck) {
      checks.push({
        id: `firestore-collection-${c.name}`,
        category: "Firestore Data",
        name: `Collection: ${c.name}`,
        status: "skip",
        message: "Skipped because Firebase Admin is not initialized.",
      })
    }
  }

  // 4. AI Gateway (used by newsletter generation)
  const hasAiGateway = envPresent("AI_GATEWAY_API_KEY")
  checks.push({
    id: "ai-gateway",
    category: "AI",
    name: "AI Gateway / model provider",
    status: hasAiGateway ? "ok" : "warn",
    message: hasAiGateway
      ? "AI_GATEWAY_API_KEY is set."
      : "AI_GATEWAY_API_KEY is not set. Vercel AI Gateway will work zero-config in Vercel deployments, but local dev may fail to call the model.",
    fix: hasAiGateway
      ? undefined
      : "If newsletter generation fails with auth errors, add AI_GATEWAY_API_KEY from your Vercel AI Gateway dashboard.",
  })

  // 5. Resend (email delivery)
  const hasResendKey = envPresent("RESEND_API_KEY")
  const hasFromEmail = envPresent("RESEND_FROM_EMAIL")
  checks.push({
    id: "resend-key",
    category: "Email",
    name: "Resend API key",
    status: hasResendKey ? "ok" : "fail",
    message: hasResendKey
      ? "RESEND_API_KEY is set."
      : "RESEND_API_KEY is missing. Newsletter sending will not work.",
    fix: hasResendKey
      ? undefined
      : "Create a Resend account at resend.com, generate an API key, and add it as RESEND_API_KEY.",
  })
  checks.push({
    id: "resend-from",
    category: "Email",
    name: "Resend sender address",
    status: hasFromEmail ? "ok" : "warn",
    message: hasFromEmail
      ? `RESEND_FROM_EMAIL = ${process.env.RESEND_FROM_EMAIL}`
      : "RESEND_FROM_EMAIL is not set. Defaulting to 'Estew <newsletter@estew.xyz>'.",
    fix: hasFromEmail
      ? undefined
      : "Set RESEND_FROM_EMAIL to a sender on a domain you have verified in Resend (e.g. 'Estew <newsletter@yourdomain.com>').",
  })

  // 6. Razorpay (payments)
  const hasRazorpayPublic = envPresent("NEXT_PUBLIC_RAZORPAY_KEY_ID")
  const hasRazorpaySecret = envPresent("RAZORPAY_KEY_SECRET")
  checks.push({
    id: "razorpay",
    category: "Payments",
    name: "Razorpay credentials",
    status: hasRazorpayPublic && hasRazorpaySecret ? "ok" : "warn",
    message:
      hasRazorpayPublic && hasRazorpaySecret
        ? "Razorpay key ID and secret are both set."
        : "Razorpay credentials are partially or fully missing. Pro subscription checkout will not work.",
    fix:
      hasRazorpayPublic && hasRazorpaySecret
        ? undefined
        : "Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from your Razorpay dashboard.",
  })

  // 7. Admin auth env
  const hasAdminEmail = envPresent("ADMIN_EMAIL")
  const hasAdminPassword = envPresent("ADMIN_PASSWORD")
  checks.push({
    id: "admin-auth",
    category: "Auth",
    name: "Admin login credentials",
    status: hasAdminEmail && hasAdminPassword ? "ok" : "warn",
    message:
      hasAdminEmail && hasAdminPassword
        ? "ADMIN_EMAIL and ADMIN_PASSWORD are set."
        : "Using fallback admin credentials baked into the code. Acceptable for now but recommended to move to env vars.",
    fix:
      hasAdminEmail && hasAdminPassword
        ? undefined
        : "Optionally add ADMIN_EMAIL and ADMIN_PASSWORD environment variables to override the defaults.",
  })

  const summary = {
    ok: checks.filter((c) => c.status === "ok").length,
    warn: checks.filter((c) => c.status === "warn").length,
    fail: checks.filter((c) => c.status === "fail").length,
    skip: checks.filter((c) => c.status === "skip").length,
  }

  const overall: CheckStatus =
    summary.fail > 0 ? "fail" : summary.warn > 0 ? "warn" : "ok"

  return NextResponse.json({
    overall,
    summary,
    checks,
    runAt: new Date().toISOString(),
  })
}
