"use client"

import { useAppStore } from "@/lib/store"
import { useMemo } from "react"

// Fallback sources when no articles are loaded
const FALLBACK_SOURCES = [
  { name: "TechCrunch", logoUrl: "https://logo.clearbit.com/techcrunch.com" },
  { name: "The Verge", logoUrl: "https://logo.clearbit.com/theverge.com" },
  { name: "Wired", logoUrl: "https://logo.clearbit.com/wired.com" },
  { name: "Ars Technica", logoUrl: "https://logo.clearbit.com/arstechnica.com" },
  { name: "VentureBeat", logoUrl: "https://logo.clearbit.com/venturebeat.com" },
  { name: "MIT Tech", logoUrl: "https://logo.clearbit.com/technologyreview.com" },
  { name: "Product Hunt", logoUrl: "https://logo.clearbit.com/producthunt.com" },
  { name: "Engadget", logoUrl: "https://logo.clearbit.com/engadget.com" },
]

export function SourceRow() {
  const { articles } = useAppStore()
  
  // Extract unique sources from articles
  const sources = useMemo(() => {
    if (articles.length === 0) return FALLBACK_SOURCES
    
    const seen = new Set<string>()
    const uniqueSources: { name: string; logoUrl: string }[] = []
    
    for (const article of articles) {
      if (!seen.has(article.sourceName)) {
        seen.add(article.sourceName)
        uniqueSources.push({
          name: article.sourceName,
          logoUrl: article.sourceLogoUrl || `https://logo.clearbit.com/${article.sourceName.toLowerCase().replace(/\s+/g, "")}.com`,
        })
      }
      if (uniqueSources.length >= 8) break
    }
    
    return uniqueSources.length > 0 ? uniqueSources : FALLBACK_SOURCES
  }, [articles])

  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 py-4">
      {sources.map((source) => (
        <button key={source.name} className="flex shrink-0 flex-col items-center gap-1.5">
          <div className="rounded-full p-[2px]"
            style={{ background: "linear-gradient(135deg, var(--primary), #D97706)" }}
          >
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-card">
              <img
                src={source.logoUrl}
                alt={source.name}
                className="h-8 w-8 object-contain"
                crossOrigin="anonymous"
                onError={(e) => {
                  // Fallback to initial letter if logo fails
                  e.currentTarget.style.display = "none"
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    parent.innerHTML = `<span class="font-sans text-lg font-bold text-muted-foreground">${source.name.charAt(0)}</span>`
                  }
                }}
              />
            </div>
          </div>
          <span className="max-w-[64px] truncate text-center font-sans text-[11px] text-muted-foreground">
            {source.name}
          </span>
        </button>
      ))}
    </div>
  )
}
