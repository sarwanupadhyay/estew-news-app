import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore"

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

// Get recent articles for newsletter
async function getArticlesForNewsletter() {
  try {
    const articlesRef = collection(db, "articles")
    const q = query(articlesRef, orderBy("publishedAt", "desc"), limit(30))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        sourceName: data.sourceName || "",
        category: data.category || "",
        url: data.url || data.originalUrl || "",
        publishedAt: data.publishedAt instanceof Timestamp 
          ? data.publishedAt.toDate().toISOString()
          : data.publishedAt || new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("Error fetching articles for newsletter:", error)
    return []
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
        { error: "No articles found to generate newsletter" },
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

    return NextResponse.json({
      success: true,
      newsletter: newsletterContent,
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
