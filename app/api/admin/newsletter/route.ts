import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"

// Newsletter section types
export interface NewsletterSection {
  id: string
  title: string
  type: "top_story" | "ai_breakthroughs" | "startup_radar" | "product_launches" | "market_pulse" | "ai_tool" | "quick_bytes" | "developer_insight"
  content: string
  articles: Array<{
    title: string
    summary: string
    sourceUrl: string
    sourceName: string
    imageUrl?: string
  }>
  order: number
}

export interface Newsletter {
  id: string
  newsletterId: string
  newsletterNumber: number
  subject: string
  sections: NewsletterSection[]
  rawContent: string // Legacy plain text format
  aiToolOfTheDay?: {
    name: string
    description: string
    url: string
    imageUrl?: string
  }
  articlesUsed: number
  date: string
  status: "draft" | "generated" | "scheduled" | "sending" | "sent" | "failed"
  scheduledTime?: string | null
  deliveryStats: {
    totalRecipients: number
    delivered: number
    failed: number
    pending: number
  }
  generatedAt: string
  sentAt?: string | null
  createdAt: string
  updatedAt: string
}

const NEWSLETTER_SYSTEM_PROMPT = `SYSTEM PROMPT — ESTEW NEWSLETTER INTELLIGENCE GENERATOR

You are an expert AI editor for the Estew tech news platform responsible for generating a premium daily tech intelligence newsletter from articles stored in the Estew database. Your newsletter targets tech executives, founders, and AI enthusiasts who need concise, actionable intelligence.

Objective:
Create a structured, high-value tech briefing with exactly 8 sections, each providing unique insights.

CRITICAL: You MUST return a valid JSON response with the exact structure specified below. Do not include any text outside the JSON.

Instructions:

1. Analyze All Provided Articles
Review every article and categorize them by relevance to each section.
Prioritize: AI breakthroughs, startup funding, product launches, market shifts, developer tools.

2. Generate 8 Newsletter Sections
Each section MUST follow this exact JSON structure:

{
  "sections": [
    {
      "id": "top_story",
      "title": "TOP STORY",
      "type": "top_story",
      "content": "Brief 1-2 sentence intro to the section",
      "articles": [
        {
          "title": "Headline",
          "summary": "2-3 sentence summary with key insight",
          "sourceUrl": "URL from provided article",
          "sourceName": "Source name",
          "imageUrl": "Image URL if available"
        }
      ],
      "order": 1
    },
    {
      "id": "ai_breakthroughs",
      "title": "AI BREAKTHROUGHS",
      "type": "ai_breakthroughs",
      "content": "Latest advances in artificial intelligence",
      "articles": [...],
      "order": 2
    },
    {
      "id": "startup_radar",
      "title": "STARTUP RADAR",
      "type": "startup_radar",
      "content": "Funding rounds, acquisitions, and emerging players",
      "articles": [...],
      "order": 3
    },
    {
      "id": "product_launches",
      "title": "PRODUCT LAUNCHES",
      "type": "product_launches",
      "content": "New products and major updates",
      "articles": [...],
      "order": 4
    },
    {
      "id": "market_pulse",
      "title": "MARKET PULSE",
      "type": "market_pulse",
      "content": "Market trends and business insights",
      "articles": [...],
      "order": 5
    },
    {
      "id": "ai_tool",
      "title": "AI TOOL OF THE DAY",
      "type": "ai_tool",
      "content": "Featured AI tool recommendation",
      "articles": [],
      "order": 6
    },
    {
      "id": "quick_bytes",
      "title": "QUICK BYTES",
      "type": "quick_bytes",
      "content": "Rapid-fire news highlights",
      "articles": [...],
      "order": 7
    },
    {
      "id": "developer_insight",
      "title": "DEVELOPER INSIGHT",
      "type": "developer_insight",
      "content": "Technical deep-dive or trend analysis",
      "articles": [...],
      "order": 8
    }
  ],
  "subject": "Estew Intelligence: [Main headline from top story] | [Date]"
}

Section Guidelines:

TOP STORY (1 article)
- The single most significant tech development
- Provide comprehensive 3-4 sentence summary
- Include why it matters

AI BREAKTHROUGHS (2-3 articles)
- AI research papers, model releases, breakthrough applications
- Focus on practical implications

STARTUP RADAR (2-3 articles)
- Funding rounds, acquisitions, pivots
- Include funding amounts when available

PRODUCT LAUNCHES (2-3 articles)
- New devices, software, platforms, major updates
- Highlight key features and availability

MARKET PULSE (1-2 articles)
- Industry trends, stock movements, analyst predictions
- Data-driven insights

AI TOOL OF THE DAY (leave empty - admin will fill)
- This section is manually curated by admin
- Leave articles array empty

QUICK BYTES (3-5 articles)
- One-sentence summaries of other notable news
- Fast, scannable format

DEVELOPER INSIGHT (1 article)
- Technical analysis, tutorial highlights, or framework comparisons
- Aimed at developers and technical leaders

Writing Rules:
- Summaries must be original, NOT copied from source
- Keep summaries concise: 2-3 sentences for main sections, 1 sentence for Quick Bytes
- Professional tone suitable for executives
- Include source attribution
- Use the exact URLs provided in the articles
- If an article has an imageUrl, include it

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanatory text.`

// Get articles for newsletter - uses createdAt (Firestore Timestamp) for reliable ordering
async function getArticlesForNewsletter() {
  const articlesRef = collection(db, "articles")
  const twentyFourHoursAgo = new Date()
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

  // Helper to map docs to articles
  const mapDocsToArticles = (docs: any[]) => {
    return docs.map((docSnap) => {
      const data = docSnap.data()
      const createdAt = data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date()

      return {
        id: docSnap.id,
        title: data.title || "",
        description: data.description || "",
        sourceName: data.sourceName || "",
        category: data.category || "",
        url: data.url || data.originalUrl || "",
        imageUrl: data.imageUrl || data.urlToImage || "",
        publishedAt: data.publishedAt || createdAt.toISOString(),
        createdAt: createdAt,
      }
    })
  }

  // Primary strategy: Use createdAt
  try {
    const recentQuery = query(
      articlesRef,
      orderBy("createdAt", "desc"),
      limit(50)
    )
    const snapshot = await getDocs(recentQuery)

    if (!snapshot.empty) {
      const allArticles = mapDocsToArticles(snapshot.docs)
      const recentArticles = allArticles.filter((article) => {
        return article.createdAt >= twentyFourHoursAgo
      })

      if (recentArticles.length >= 5) {
        return recentArticles
      }
      return allArticles.slice(0, 30)
    }
  } catch (error) {
    console.error("Primary query failed:", error)
  }

  // Fallback
  try {
    const simpleQuery = query(articlesRef, limit(30))
    const snapshot = await getDocs(simpleQuery)
    if (!snapshot.empty) {
      return mapDocsToArticles(snapshot.docs)
    }
  } catch (error) {
    console.error("Fallback query failed:", error)
  }

  return []
}

// Get next newsletter number
async function getNextNewsletterNumber(): Promise<number> {
  try {
    const counterRef = doc(db, "system", "newsletter_counter")
    const counterSnap = await getDoc(counterRef)
    
    if (counterSnap.exists()) {
      const currentCount = counterSnap.data().count || 0
      const newCount = currentCount + 1
      await setDoc(counterRef, { count: newCount })
      return newCount
    } else {
      await setDoc(counterRef, { count: 1 })
      return 1
    }
  } catch (error) {
    console.error("Error getting newsletter number:", error)
    return Date.now()
  }
}

function formatNewsletterId(num: number): string {
  return `newsletter_${num.toString().padStart(5, "0")}`
}

// Convert sections to plain text for backward compatibility
function sectionsToPlainText(sections: NewsletterSection[], date: string): string {
  let text = `ESTEW DAILY TECH BRIEFING\nDate: ${date}\n\n`
  
  for (const section of sections) {
    text += `${section.title}\n${"─".repeat(section.title.length)}\n`
    if (section.content) {
      text += `${section.content}\n\n`
    }
    for (const article of section.articles) {
      text += `**${article.title}**\n`
      text += `${article.summary}\n`
      text += `Source: ${article.sourceName} | ${article.sourceUrl}\n\n`
    }
    text += "\n"
  }
  
  return text
}

// Save newsletter to database
async function saveNewsletter(
  sections: NewsletterSection[],
  articlesCount: number,
  subject: string,
  aiToolOfTheDay?: Newsletter["aiToolOfTheDay"]
) {
  try {
    const today = new Date()
    const dateStr = today.toISOString().split("T")[0]
    
    const newsletterNum = await getNextNewsletterNumber()
    const newsletterId = formatNewsletterId(newsletterNum)
    const rawContent = sectionsToPlainText(sections, dateStr)

    const newsletterRef = doc(db, "newsletters", newsletterId)
    await setDoc(newsletterRef, {
      newsletterId,
      newsletterNumber: newsletterNum,
      subject,
      sections,
      rawContent,
      aiToolOfTheDay: aiToolOfTheDay || null,
      articlesUsed: articlesCount,
      date: dateStr,
      status: "generated",
      scheduledTime: null,
      deliveryStats: {
        totalRecipients: 0,
        delivered: 0,
        failed: 0,
        pending: 0,
      },
      generatedAt: serverTimestamp(),
      sentAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return newsletterId
  } catch (error) {
    console.error("Error saving newsletter:", error)
    throw error
  }
}

// Get all saved newsletters
async function getSavedNewsletters() {
  try {
    const newslettersRef = collection(db, "newsletters")
    const q = query(newslettersRef, orderBy("createdAt", "desc"), limit(30))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        newsletterId: data.newsletterId || docSnap.id,
        newsletterNumber: data.newsletterNumber || 0,
        subject: data.subject || `Newsletter - ${data.date || docSnap.id}`,
        date: data.date || docSnap.id,
        sections: data.sections || [],
        rawContent: data.rawContent || data.content || "",
        aiToolOfTheDay: data.aiToolOfTheDay || null,
        articlesUsed: data.articlesUsed || 0,
        generatedAt: data.generatedAt instanceof Timestamp
          ? data.generatedAt.toDate().toISOString()
          : data.generatedAt || new Date().toISOString(),
        status: data.status || "generated",
        scheduledTime: data.scheduledTime instanceof Timestamp
          ? data.scheduledTime.toDate().toISOString()
          : data.scheduledTime || null,
        deliveryStats: data.deliveryStats || {
          totalRecipients: 0,
          delivered: 0,
          failed: 0,
          pending: 0,
        },
        sentAt: data.sentAt instanceof Timestamp
          ? data.sentAt.toDate().toISOString()
          : data.sentAt || null,
      }
    })
  } catch (error) {
    console.error("Error fetching newsletters:", error)
    return []
  }
}

// GET - Fetch saved newsletters
export async function GET() {
  try {
    const newsletters = await getSavedNewsletters()
    return NextResponse.json({ newsletters })
  } catch (error) {
    console.error("Error fetching newsletters:", error)
    return NextResponse.json(
      { error: "Failed to fetch newsletters" },
      { status: 500 }
    )
  }
}

// POST - Generate new newsletter
export async function POST(request: Request) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      )
    }

    // Check for optional AI tool selection from request body
    let selectedAiTool = null
    try {
      const body = await request.json()
      selectedAiTool = body.aiToolOfTheDay || null
    } catch {
      // No body or invalid JSON, continue without AI tool
    }

    const articles = await getArticlesForNewsletter()

    if (articles.length === 0) {
      return NextResponse.json(
        { error: "No articles found in database. Please ensure articles are being fetched and stored." },
        { status: 400 }
      )
    }

    const articlesText = articles.map((article, index) =>
      `${index + 1}. ${article.title}
   Source: ${article.sourceName}
   Category: ${article.category}
   Description: ${article.description}
   URL: ${article.url}
   Image URL: ${article.imageUrl || "N/A"}
   Published: ${article.publishedAt}`
    ).join("\n\n")

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const userPrompt = `Today's date is ${today}.

Here are the ${articles.length} recent articles from Estew database:

${articlesText}

Generate the newsletter JSON following the system instructions. Remember to:
1. Return ONLY valid JSON
2. Use the exact URLs from the articles provided
3. Include imageUrl when available
4. Leave ai_tool section articles empty (admin will fill)
5. Make the subject line compelling and include today's date`

    // Retry logic for Gemini API with exponential backoff
    const MAX_RETRIES = 3
    const RETRY_DELAYS = [1000, 2000, 4000] // ms
    
    let geminiResponse: Response | null = null
    let lastError: string = ""
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: `${NEWSLETTER_SYSTEM_PROMPT}\n\n${userPrompt}` },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
              },
            }),
          }
        )

        if (geminiResponse.ok) {
          break // Success, exit retry loop
        }
        
        // Check for retryable errors (503, 429, 500)
        if ([503, 429, 500].includes(geminiResponse.status)) {
          lastError = await geminiResponse.text()
          console.log(`Gemini API attempt ${attempt + 1} failed with ${geminiResponse.status}, retrying...`)
          
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]))
            continue
          }
        } else {
          // Non-retryable error
          lastError = await geminiResponse.text()
          break
        }
      } catch (fetchError) {
        lastError = fetchError instanceof Error ? fetchError.message : "Network error"
        console.error(`Gemini API fetch error on attempt ${attempt + 1}:`, lastError)
        
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]))
        }
      }
    }

    if (!geminiResponse || !geminiResponse.ok) {
      console.error("Gemini API error after retries:", lastError)
      return NextResponse.json(
        { error: "AI service is temporarily unavailable. Please try again in a few moments." },
        { status: 503 }
      )
    }

    const data = await geminiResponse.json()
    let newsletterJson = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!newsletterJson) {
      return NextResponse.json(
        { error: "Newsletter generation failed. Please try again." },
        { status: 400 }
      )
    }

    // Parse the JSON response
    let parsedNewsletter
    try {
      // Clean potential markdown code blocks
      newsletterJson = newsletterJson.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      parsedNewsletter = JSON.parse(newsletterJson)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json(
        { error: "Failed to parse newsletter structure. Please try again." },
        { status: 400 }
      )
    }

    const sections: NewsletterSection[] = parsedNewsletter.sections || []
    const subject = parsedNewsletter.subject || `Estew Intelligence: Daily Briefing | ${today}`

    // Add AI tool if provided
    if (selectedAiTool) {
      const aiToolSection = sections.find(s => s.type === "ai_tool")
      if (aiToolSection) {
        aiToolSection.articles = [{
          title: selectedAiTool.name,
          summary: selectedAiTool.description,
          sourceUrl: selectedAiTool.url,
          sourceName: "Featured Tool",
          imageUrl: selectedAiTool.imageUrl,
        }]
      }
    }

    // Save newsletter
    const savedId = await saveNewsletter(sections, articles.length, subject, selectedAiTool)

    return NextResponse.json({
      success: true,
      newsletterId: savedId,
      subject,
      sections,
      articlesUsed: articles.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Newsletter generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate newsletter" },
      { status: 500 }
    )
  }
}

// PATCH - Update newsletter (sections, schedule, AI tool, etc.)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { newsletterId, sections, subject, aiToolOfTheDay, scheduledTime, status } = body

    if (!newsletterId) {
      return NextResponse.json(
        { error: "Newsletter ID required" },
        { status: 400 }
      )
    }

    const newsletterRef = doc(db, "newsletters", newsletterId)
    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp(),
    }

    if (sections) {
      updateData.sections = sections
      updateData.rawContent = sectionsToPlainText(sections, new Date().toISOString().split("T")[0])
    }
    if (subject) updateData.subject = subject
    if (aiToolOfTheDay !== undefined) updateData.aiToolOfTheDay = aiToolOfTheDay
    if (scheduledTime !== undefined) {
      updateData.scheduledTime = scheduledTime ? new Date(scheduledTime) : null
      if (scheduledTime) updateData.status = "scheduled"
    }
    if (status) updateData.status = status

    await updateDoc(newsletterRef, updateData)

    return NextResponse.json({ success: true, newsletterId })
  } catch (error) {
    console.error("Newsletter update error:", error)
    return NextResponse.json(
      { error: "Failed to update newsletter" },
      { status: 500 }
    )
  }
}
