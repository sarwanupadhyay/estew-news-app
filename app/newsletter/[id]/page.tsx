import { notFound } from "next/navigation"
import Link from "next/link"
import { getAdminDb } from "@/lib/firebase-admin"
import { NewsletterReader } from "@/components/newsletter/newsletter-reader"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

interface NewsletterArticle {
  headline?: string
  summary?: string
  link?: string
  source?: string
  imageUrl?: string
}

interface NewsletterSection {
  title?: string
  description?: string
  articles?: NewsletterArticle[]
}

interface NewsletterDoc {
  date?: string
  subject?: string
  intro?: string
  sections?: NewsletterSection[]
  aiToolOfDay?: {
    name?: string
    url?: string
    description?: string
    imageUrl?: string
  } | null
  createdAt?: string | { toDate?: () => Date; _seconds?: number } | Date
}

/**
 * Convert any Firestore-shaped value into a plain ISO string we can safely
 * pass into a Client Component. Without this step, raw Firestore Timestamp
 * objects would be passed through and cause a serialization error at render.
 */
function normalizeIso(
  v: string | { toDate?: () => Date; _seconds?: number } | Date | undefined,
): string | undefined {
  if (!v) return undefined
  if (typeof v === "string") return v
  if (v instanceof Date) return v.toISOString()
  if (typeof v === "object") {
    if (typeof v.toDate === "function") {
      try {
        return v.toDate().toISOString()
      } catch {
        return undefined
      }
    }
    if (typeof v._seconds === "number") {
      try {
        return new Date(v._seconds * 1000).toISOString()
      } catch {
        return undefined
      }
    }
  }
  return undefined
}

async function fetchNewsletter(id: string): Promise<NewsletterDoc | null> {
  const db = getAdminDb()
  if (!db) {
    console.error("[v0] Newsletter detail: Firestore Admin is not configured")
    return null
  }
  try {
    const doc = await db.collection("newsletters").doc(id).get()
    if (!doc.exists) return null
    return doc.data() as NewsletterDoc
  } catch (err) {
    console.error("[v0] Newsletter fetch error:", err)
    return null
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const data = await fetchNewsletter(id)
  if (!data) return { title: "Newsletter — Estew" }
  return {
    title: `${data.subject || "Estew Daily"} — Estew`,
    description: data.intro || "Your daily AI & technology briefing from Estew.",
  }
}

export default async function NewsletterDetailPage({ params }: Props) {
  const { id } = await params
  const data = await fetchNewsletter(id)
  if (!data) notFound()

  // Sanitize every field before passing to the Client Component. Firestore
  // can return Timestamp objects (with toDate/_seconds), undefined fields, or
  // unexpected types — none of which serialize cleanly across the RSC boundary.
  const sections = Array.isArray(data.sections) ? data.sections : []
  const safeSections = sections
    .map((s) => ({
      title: typeof s?.title === "string" ? s.title : "",
      description: typeof s?.description === "string" ? s.description : "",
      articles: Array.isArray(s?.articles)
        ? s!.articles!
            .filter((a): a is NewsletterArticle => !!a && typeof a === "object")
            .map((a) => ({
              headline: typeof a.headline === "string" ? a.headline : "",
              summary: typeof a.summary === "string" ? a.summary : "",
              link: typeof a.link === "string" ? a.link : "",
              source: typeof a.source === "string" ? a.source : "",
              imageUrl: typeof a.imageUrl === "string" ? a.imageUrl : "",
            }))
            .filter((a) => a.headline)
        : [],
    }))
    .filter((s) => s.articles.length > 0)

  const tool = data.aiToolOfDay
  const safeTool =
    tool && typeof tool === "object"
      ? {
          name: typeof tool.name === "string" ? tool.name : "",
          url: typeof tool.url === "string" ? tool.url : "",
          description: typeof tool.description === "string" ? tool.description : "",
          imageUrl: typeof tool.imageUrl === "string" ? tool.imageUrl : "",
        }
      : null

  const safe = {
    id,
    date:
      normalizeIso(data.date) ||
      normalizeIso(data.createdAt) ||
      new Date().toISOString(),
    subject: data.subject || "Estew Daily",
    intro: data.intro || "",
    sections: safeSections,
    aiToolOfDay: safeTool,
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 py-3 sm:px-8">
        <Link
          href="/newsletter"
          className="inline-flex items-center gap-1 font-sans text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to archive
        </Link>
      </div>
      <NewsletterReader newsletter={safe} />
    </main>
  )
}
