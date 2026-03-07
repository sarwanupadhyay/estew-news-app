import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { sendNewsletterEmail } from "@/lib/email-service"
import { mockArticles } from "@/lib/mock-data"

// This endpoint is called by Vercel Cron at 2pm IST daily
// Configure in vercel.json: "crons": [{ "path": "/api/cron/newsletter", "schedule": "30 8 * * *" }]
// 8:30 UTC = 2:00 PM IST

export const dynamic = "force-dynamic"
export const maxDuration = 300 // 5 minutes max for sending emails

interface NewsletterArticle {
  headline: string
  summary: string
  link: string
  source: string
}

interface NewsletterSection {
  title: string
  emoji: string
  articles: NewsletterArticle[]
}

interface Newsletter {
  date: string
  subject: string
  sections: NewsletterSection[]
}

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development, allow without auth
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    // 1. Get all subscribed users from Firestore
    const usersRef = collection(db, "users")
    const subscribedQuery = query(usersRef, where("newsletterSubscribed", "==", true))
    const snapshot = await getDocs(subscribedQuery)

    if (snapshot.empty) {
      return NextResponse.json({ 
        success: true, 
        message: "No subscribed users", 
        sent: 0 
      })
    }

    const subscribers = snapshot.docs.map((doc) => ({
      email: doc.data().email as string,
      displayName: doc.data().displayName as string,
      topics: doc.data().topics as string[] || [],
    }))

    // 2. Fetch latest articles
    const articles = await fetchLatestArticles()

    // 3. Generate newsletter content
    const newsletter = await generateNewsletter(articles)

    // 4. Send to all subscribers
    const results = await Promise.allSettled(
      subscribers.map((sub) => 
        sendNewsletterEmail(sub.email, newsletter, sub.displayName)
      )
    )

    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length
    const failed = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)).length

    console.log(`Newsletter sent: ${successful} successful, ${failed} failed`)

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: subscribers.length,
      date: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron newsletter error:", error)
    return NextResponse.json(
      { error: "Failed to send newsletters", details: String(error) },
      { status: 500 }
    )
  }
}

async function fetchLatestArticles() {
  // Try to fetch from NewsAPI
  const apiKey = process.env.NEWS_API_KEY
  
  if (!apiKey) {
    return mockArticles.slice(0, 15)
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=technology&pageSize=20&apiKey=${apiKey}`,
      { next: { revalidate: 0 } }
    )

    if (!response.ok) {
      return mockArticles.slice(0, 15)
    }

    const data = await response.json()
    
    return (data.articles || []).map((item: {
      title?: string
      description?: string
      url?: string
      source?: { name?: string }
    }, i: number) => ({
      title: item.title || "Untitled",
      summary: item.description || "",
      originalUrl: item.url || "#",
      sourceName: item.source?.name || "Unknown",
      category: ["AI", "Market", "Launches", "Apps", "Startups"][i % 5],
    }))
  } catch {
    return mockArticles.slice(0, 15)
  }
}

async function generateNewsletter(articles: Array<{
  title: string
  summary: string
  originalUrl: string
  sourceName: string
  category: string
}>): Promise<Newsletter> {
  const openaiKey = process.env.OPENAI_API_KEY

  if (!openaiKey) {
    return generateBasicNewsletter(articles)
  }

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI editor generating the daily Estew newsletter.
Generate a concise, high-quality tech briefing email.

Output format: JSON with structure:
{
  "subject": "Estew Daily: [catchy headline]",
  "sections": [
    { "title": "Top Story", "emoji": "🔥", "articles": [{ "headline": "...", "summary": "...", "link": "...", "source": "..." }] },
    { "title": "AI & Machine Learning", "emoji": "🤖", "articles": [...] },
    { "title": "Product Launches", "emoji": "🚀", "articles": [...] },
    { "title": "Market Updates", "emoji": "📊", "articles": [...] }
  ]
}`
          },
          {
            role: "user",
            content: `Generate a newsletter from: ${JSON.stringify(articles.slice(0, 15).map(a => ({
              title: a.title,
              summary: a.summary,
              url: a.originalUrl,
              source: a.sourceName,
              category: a.category,
            })))}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!aiResponse.ok) {
      return generateBasicNewsletter(articles)
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices?.[0]?.message?.content || ""
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      return generateBasicNewsletter(articles)
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    return {
      date: new Date().toISOString().split("T")[0],
      subject: parsed.subject || `Estew Daily: ${new Date().toLocaleDateString()}`,
      sections: parsed.sections || [],
    }
  } catch {
    return generateBasicNewsletter(articles)
  }
}

function generateBasicNewsletter(articles: Array<{
  title: string
  summary: string
  originalUrl: string
  sourceName: string
  category: string
}>): Newsletter {
  const categorized: Record<string, typeof articles> = {
    AI: [],
    Market: [],
    Launches: [],
    other: [],
  }

  articles.forEach((article) => {
    if (article.category === "AI") categorized.AI.push(article)
    else if (article.category === "Market") categorized.Market.push(article)
    else if (article.category === "Launches") categorized.Launches.push(article)
    else categorized.other.push(article)
  })

  const topStory = articles[0]

  return {
    date: new Date().toISOString().split("T")[0],
    subject: `Estew Daily: ${topStory?.title || "Today's Tech Briefing"}`,
    sections: [
      {
        title: "Top Story",
        emoji: "🔥",
        articles: topStory ? [{
          headline: topStory.title,
          summary: topStory.summary,
          link: topStory.originalUrl,
          source: topStory.sourceName,
        }] : [],
      },
      {
        title: "AI & Machine Learning",
        emoji: "🤖",
        articles: categorized.AI.slice(0, 3).map((a) => ({
          headline: a.title,
          summary: a.summary,
          link: a.originalUrl,
          source: a.sourceName,
        })),
      },
      {
        title: "Product Launches",
        emoji: "🚀",
        articles: categorized.Launches.slice(0, 3).map((a) => ({
          headline: a.title,
          summary: a.summary,
          link: a.originalUrl,
          source: a.sourceName,
        })),
      },
      {
        title: "Market Updates",
        emoji: "📊",
        articles: categorized.Market.slice(0, 3).map((a) => ({
          headline: a.title,
          summary: a.summary,
          link: a.originalUrl,
          source: a.sourceName,
        })),
      },
    ],
  }
}
