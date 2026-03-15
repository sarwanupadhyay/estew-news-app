import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { title, summary, url } = await request.json()
  const apiKey = process.env.OPENAI_API_KEY

  // If no OpenAI key, return the original summary
  if (!apiKey) {
    return NextResponse.json({
      aiSummary: summary || "No summary available.",
      source: "original",
    })
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a concise tech news editor. Summarize articles in 2-3 crisp sentences. Be factual, neutral, and highlight the key takeaway. No filler words.",
          },
          {
            role: "user",
            content: `Summarize this tech article:\n\nTitle: ${title}\nExcerpt: ${summary}\nSource: ${url}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      // Handle rate limiting gracefully - return original summary instead of failing
      if (res.status === 429) {
        console.warn("OpenAI rate limit reached, using original summary")
        return NextResponse.json({
          aiSummary: summary || "No summary available.",
          source: "rate_limited",
        })
      }
      // For other errors, log and fallback
      console.error(`OpenAI API error: ${res.status}`)
      return NextResponse.json({
        aiSummary: summary || "No summary available.",
        source: "api_error",
      })
    }

    const data = await res.json()
    const aiSummary = data.choices?.[0]?.message?.content?.trim() || summary

    return NextResponse.json({ aiSummary, source: "openai" })
  } catch (error) {
    console.error("OpenAI summarization error:", error)
    return NextResponse.json({
      aiSummary: summary || "No summary available.",
      source: "fallback",
    })
  }
}
