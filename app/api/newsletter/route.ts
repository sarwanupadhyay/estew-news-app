import { NextResponse } from "next/server"

// Newsletter Generator API
// Generates daily Estew newsletter with AI-curated content

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

export async function POST(request: Request) {
  try {
    const { articles } = await request.json()

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json(
        { error: "No articles provided" },
        { status: 400 }
      )
    }

    const openaiKey = process.env.OPENAI_API_KEY

    // If no OpenAI key, generate a basic newsletter
    if (!openaiKey) {
      const newsletter = generateBasicNewsletter(articles)
      return NextResponse.json({ newsletter, source: "basic" })
    }

    // Use AI to curate and categorize articles
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
Your job is to convert a list of technology news articles into a concise, high-quality briefing email.

Rules:
1. Select the most important articles based on relevance to: artificial intelligence, startup ecosystem, product launches, market movements
2. For each article produce: headline, 1–2 line summary, link to the original source
3. The tone must feel like a premium intelligence briefing
4. Never copy full article text
5. Keep summaries factual and concise

Output format: JSON with this structure:
{
  "subject": "Estew Daily: [catchy headline about top story]",
  "sections": [
    {
      "title": "Top Story",
      "emoji": "🔥",
      "articles": [{ "headline": "...", "summary": "...", "link": "...", "source": "..." }]
    },
    {
      "title": "AI & Machine Learning",
      "emoji": "🤖",
      "articles": [...]
    },
    {
      "title": "Product Launches",
      "emoji": "🚀",
      "articles": [...]
    },
    {
      "title": "Market Updates",
      "emoji": "📊",
      "articles": [...]
    }
  ]
}`
          },
          {
            role: "user",
            content: `Generate a newsletter from these articles:\n\n${JSON.stringify(
              articles.slice(0, 15).map((a: { title: string; summary: string; originalUrl: string; sourceName: string; category: string }) => ({
                title: a.title,
                summary: a.summary,
                url: a.originalUrl,
                source: a.sourceName,
                category: a.category,
              }))
            )}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!aiResponse.ok) {
      console.error("OpenAI API error:", await aiResponse.text())
      const newsletter = generateBasicNewsletter(articles)
      return NextResponse.json({ newsletter, source: "basic-fallback" })
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices?.[0]?.message?.content || ""

    // Parse JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      const newsletter = generateBasicNewsletter(articles)
      return NextResponse.json({ newsletter, source: "basic-fallback" })
    }

    const aiNewsletter = JSON.parse(jsonMatch[0])

    const newsletter: Newsletter = {
      date: new Date().toISOString().split("T")[0],
      subject: aiNewsletter.subject || `Estew Daily: ${new Date().toLocaleDateString()}`,
      sections: aiNewsletter.sections || [],
    }

    return NextResponse.json({ newsletter, source: "ai" })
  } catch (error) {
    console.error("Newsletter generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate newsletter" },
      { status: 500 }
    )
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
