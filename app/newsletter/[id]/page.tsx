import { notFound } from "next/navigation"
import Link from "next/link"
import { getAdminDb } from "@/lib/firebase-admin"
import { NewsletterReader } from "@/components/newsletter/newsletter-reader"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

interface NewsletterArticle {
  headline: string
  summary: string
  link: string
  source: string
  imageUrl?: string
}

interface NewsletterSection {
  title: string
  description?: string
  articles: NewsletterArticle[]
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
  createdAt?: string | { toDate?: () => Date } | Date
}

async function fetchNewsletter(id: string): Promise<NewsletterDoc | null> {
  const db = getAdminDb()
  if (!db) return null
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

  const sections = Array.isArray(data.sections) ? data.sections : []
  const safe = {
    id,
    date: data.date || new Date().toISOString(),
    subject: data.subject || "Estew Daily",
    intro: data.intro || "",
    sections: sections.filter((s) => s?.articles?.length),
    aiToolOfDay: data.aiToolOfDay || null,
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
