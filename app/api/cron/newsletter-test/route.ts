import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore"
import { sendNewsletterEmail } from "@/lib/email-service"
import { mockArticles } from "@/lib/mock-data"

// Test endpoint for newsletter - no schedule, manual trigger only
// Call via: GET /api/cron/newsletter-test
// This will:
// 1. Curate the newsletter content
// 2. Store it in Firestore (newsletters collection)
// 3. Send to all subscribed users

export const dynamic = "force-dynamic"
export const maxDuration = 300

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

export async function GET() {
  try {
    console.log("[Newsletter Test] Starting newsletter generation...")

    // Step 1: Fetch latest articles
    const articles = await fetchLatestArticles()
    console.log(`[Newsletter Test] Fetched ${articles.length} articles`)

    // Step 2: Generate newsletter content with AI
    const newsletter = await generateNewsletter(articles)
    console.log(`[Newsletter Test] Generated newsletter: ${newsletter.subject}`)

    // Step 3: Store newsletter in Firestore
    const newsletterId = `newsletter-${Date.now()}`
    const newsletterRef = doc(db, "newsletters", newsletterId)
    
    await setDoc(newsletterRef, {
      ...newsletter,
      id: newsletterId,
      status: "pending",
      createdAt: serverTimestamp(),
      sentCount: 0,
      failedCount: 0,
    })
    console.log(`[Newsletter Test] Stored newsletter: ${newsletterId}`)

    // Step 4: Get all subscribed users
    const usersRef = collection(db, "users")
    const subscribedQuery = query(usersRef, where("newsletterSubscribed", "==", true))
    const snapshot = await getDocs(subscribedQuery)

    if (snapshot.empty) {
      // Update newsletter status
      await setDoc(newsletterRef, { status: "completed", sentCount: 0 }, { merge: true })
      
      return NextResponse.json({
        success: true,
        message: "Newsletter created but no subscribers to send to",
        newsletterId,
        newsletter: newsletter.subject,
        subscribers: 0,
      })
    }

    const subscribers = snapshot.docs.map((doc) => ({
      uid: doc.id,
      email: doc.data().email as string,
      displayName: doc.data().displayName as string,
      topics: (doc.data().topics as string[]) || [],
    }))

    console.log(`[Newsletter Test] Found ${subscribers.length} subscribers`)

    // Step 5: Send to all subscribers
    const results = await Promise.allSettled(
      subscribers.map(async (sub) => {
        try {
          const result = await sendNewsletterEmail(sub.email, newsletter, sub.displayName)
          return { email: sub.email, success: result.success }
        } catch (error) {
          console.error(`[Newsletter Test] Failed to send to ${sub.email}:`, error)
          return { email: sub.email, success: false }
        }
      })
    )

    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length
    const failed = results.filter(
      (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
    ).length

    // Step 6: Update newsletter status in database
    await setDoc(newsletterRef, {
      status: "completed",
      sentCount: successful,
      failedCount: failed,
      completedAt: serverTimestamp(),
    }, { merge: true })

    console.log(`[Newsletter Test] Complete: ${successful} sent, ${failed} failed`)

    return NextResponse.json({
      success: true,
      message: "Newsletter test completed",
      newsletterId,
      newsletter: newsletter.subject,
      stats: {
        total: subscribers.length,
        sent: successful,
        failed,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Newsletter Test] Error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process newsletter", 
        details: String(error) 
      },
      { status: 500 }
    )
  }
}

async function fetchLatestArticles() {
  const apiKey = process.env.NEWS_API_KEY

  if (!apiKey) {
    console.log("[Newsletter Test] No NEWS_API_KEY, using mock data")
    return mockArticles.slice(0, 15)
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=technology&pageSize=20&apiKey=${apiKey}`,
      { next: { revalidate: 0 } }
    )

    if (!response.ok) {
      console.log("[Newsletter Test] NewsAPI failed, using mock data")
      return mockArticles.slice(0, 15)
    }

    const data = await response.json()

    return (data.articles || []).map(
      (
        item: {
          title?: string
          description?: string
          url?: string
          source?: { name?: string }
        },
        i: number
      ) => ({
        title: item.title || "Untitled",
        summary: item.description || "",
        originalUrl: item.url || "#",
        sourceName: item.source?.name || "Unknown",
        category: ["AI", "Market", "Launches", "Apps", "Startups"][i % 5],
      })
    )
  } catch {
    console.log("[Newsletter Test] Fetch error, using mock data")
    return mockArticles.slice(0, 15)
  }
}

async function generateNewsletter(
  articles: Array<{
    title: string
    summary: string
    originalUrl: string
    sourceName: string
    category: string
  }>
): Promise<Newsletter> {
  const openaiKey = process.env.OPENAI_API_KEY

  if (!openaiKey) {
    console.log("[Newsletter Test] No OPENAI_API_KEY, using basic format")
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
            content: `You are an AI editor for the Estew tech newsletter.
Create a concise, professional daily briefing.

Output JSON format:
{
  "subject": "Estew Daily: [catchy headline about top story]",
  "sections": [
    { "title": "Top Story", "emoji": "🔥", "articles": [{ "headline": "...", "summary": "2-3 sentence summary", "link": "...", "source": "..." }] },
    { "title": "AI & Machine Learning", "emoji": "🤖", "articles": [...] },
    { "title": "Product Launches", "emoji": "🚀", "articles": [...] },
    { "title": "Market Updates", "emoji": "📊", "articles": [...] }
  ]
}

Rules:
- Each summary should be unique and not copied from the source
- Keep summaries concise (2-3 sentences)
- Top Story section has 1 article
- Other sections have 2-3 articles each`,
          },
          {
            role: "user",
            content: `Generate newsletter from these articles: ${JSON.stringify(
              articles.slice(0, 15).map((a) => ({
                title: a.title,
                summary: a.summary,
                url: a.originalUrl,
                source: a.sourceName,
                category: a.category,
              }))
            )}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    })

    if (!aiResponse.ok) {
      console.log("[Newsletter Test] OpenAI API failed, using basic format")
      return generateBasicNewsletter(articles)
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices?.[0]?.message?.content || ""
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.log("[Newsletter Test] Could not parse AI response, using basic format")
      return generateBasicNewsletter(articles)
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      date: new Date().toISOString().split("T")[0],
      subject: parsed.subject || `Estew Daily: ${new Date().toLocaleDateString()}`,
      sections: parsed.sections || [],
    }
  } catch (error) {
    console.error("[Newsletter Test] AI generation error:", error)
    return generateBasicNewsletter(articles)
  }
}

function generateBasicNewsletter(
  articles: Array<{
    title: string
    summary: string
    originalUrl: string
    sourceName: string
    category: string
  }>
): Newsletter {
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
        articles: topStory
          ? [
              {
                headline: topStory.title,
                summary: topStory.summary,
                link: topStory.originalUrl,
                source: topStory.sourceName,
              },
            ]
          : [],
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
