import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  Timestamp, 
  where,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"

const NEWSLETTER_SYSTEM_PROMPT = `SYSTEM PROMPT — ESTEW ADMIN NEWSLETTER GENERATOR

You are an AI editor for the Estew tech news platform responsible for generating a daily tech intelligence newsletter from articles stored in the Estew database.

Objective:
Create a concise, high-value tech briefing highlighting the most important technology developments of the day.

Instructions:

1. Select Articles
From the provided article list, choose the most relevant and impactful stories.
Prioritize:
- global technology impact
- AI breakthroughs
- major company announcements
- important market shifts

2. Organize the Newsletter Into Sections
Structure the newsletter using the following sections:

TOP STORY
The most significant tech development of the day.

AI & MACHINE LEARNING
Breakthroughs, research, major AI releases, or policy developments.

PRODUCT LAUNCHES
New devices, platforms, software releases, or major updates.

MARKET UPDATES
Funding rounds, acquisitions, stock movements, industry trends.

3. Article Format
For each selected article include:

Headline: Clear and engaging title.
Summary: 1–2 concise sentences explaining the key insight or impact.
Source Link: URL pointing to the original article.

Writing Rules:
- Never copy or reproduce full article text.
- Summaries must be original, concise, and informative.
- Maintain a professional tone suitable for tech executives and founders.
- Avoid hype or speculation unless stated in the source article.
- Keep summaries under 40 words when possible.

Output Format:
The final newsletter must be email-friendly and structured like this:

ESTEW DAILY TECH BRIEFING
Date: {today}

TOP STORY
---------
{article}

AI & MACHINE LEARNING
---------------------
{article list}

PRODUCT LAUNCHES
----------------
{article list}

MARKET UPDATES
--------------
{article list}`

// Get articles for newsletter - uses createdAt (Firestore Timestamp) for reliable ordering
async function getArticlesForNewsletter() {
  const articlesRef = collection(db, "articles")
  const twentyFourHoursAgo = new Date()
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
  
  // Helper to map docs to articles
  const mapDocsToArticles = (docs: any[]) => {
    return docs.map((docSnap) => {
      const data = docSnap.data()
      // Get createdAt as the reliable date (it's always a Firestore Timestamp)
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
        publishedAt: data.publishedAt || createdAt.toISOString(),
        createdAt: createdAt,
      }
    })
  }

  // Primary strategy: Use createdAt (always available as Firestore Timestamp)
  try {
    const recentQuery = query(
      articlesRef, 
      orderBy("createdAt", "desc"), 
      limit(50)
    )
    const snapshot = await getDocs(recentQuery)
    
    if (!snapshot.empty) {
      const allArticles = mapDocsToArticles(snapshot.docs)
      
      // Filter for last 24 hours based on createdAt
      const recentArticles = allArticles.filter((article) => {
        return article.createdAt >= twentyFourHoursAgo
      })
      
      if (recentArticles.length >= 5) {
        return recentArticles
      }
      
      // If not enough recent articles, use all available (up to 30)
      return allArticles.slice(0, 30)
    }
  } catch (error) {
    console.error("Primary query failed:", error)
  }
  
  // Fallback: Simple query without ordering
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

// Save newsletter to database
async function saveNewsletter(content: string, articlesCount: number) {
  try {
    const today = new Date()
    const dateStr = today.toISOString().split("T")[0] // YYYY-MM-DD format
    
    const newsletterRef = doc(db, "newsletters", dateStr)
    await setDoc(newsletterRef, {
      content,
      articlesUsed: articlesCount,
      generatedAt: serverTimestamp(),
      date: dateStr,
      status: "generated",
    })
    
    return dateStr
  } catch (error) {
    console.error("Error saving newsletter:", error)
    throw error
  }
}

// Get all saved newsletters
async function getSavedNewsletters() {
  try {
    const newslettersRef = collection(db, "newsletters")
    const q = query(newslettersRef, orderBy("generatedAt", "desc"), limit(30))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        date: data.date || docSnap.id,
        content: data.content || "",
        articlesUsed: data.articlesUsed || 0,
        generatedAt: data.generatedAt instanceof Timestamp 
          ? data.generatedAt.toDate().toISOString()
          : data.generatedAt || new Date().toISOString(),
        status: data.status || "generated",
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

export async function POST(request: Request) {
  try {
    // Check for Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      )
    }

    // Get recent articles
    const articles = await getArticlesForNewsletter()
    
    if (articles.length === 0) {
      return NextResponse.json(
        { error: "No articles found in database. Please ensure articles are being fetched and stored." },
        { status: 400 }
      )
    }

    // Format articles for the prompt
    const articlesText = articles.map((article, index) => 
      `${index + 1}. ${article.title}
   Source: ${article.sourceName}
   Category: ${article.category}
   Description: ${article.description}
   URL: ${article.url}
   Published: ${article.publishedAt}`
    ).join("\n\n")

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const userPrompt = `Today's date is ${today}.

Here are the recent articles from Estew database:

${articlesText}

Please generate a newsletter following the system instructions.`

    // Call Gemini API (using gemini-1.5-flash - best free model for this use case)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: NEWSLETTER_SYSTEM_PROMPT },
                { text: userPrompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API error:", errorData)
      return NextResponse.json(
        { error: "Failed to generate newsletter", details: errorData },
        { status: 500 }
      )
    }

    const data = await response.json()
    const newsletterContent = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    if (!newsletterContent) {
      return NextResponse.json(
        { error: "No content generated" },
        { status: 500 }
      )
    }

    // Save newsletter to database
    const savedDate = await saveNewsletter(newsletterContent, articles.length)

    return NextResponse.json({
      success: true,
      newsletter: newsletterContent,
      articlesUsed: articles.length,
      generatedAt: new Date().toISOString(),
      savedAs: savedDate,
    })
  } catch (error) {
    console.error("Newsletter generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate newsletter" },
      { status: 500 }
    )
  }
}
