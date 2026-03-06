"use client"

import { useAppStore } from "@/lib/store"
import { useMemo, useState } from "react"

// Helper to get favicon from Google's service
function getFaviconUrl(sourceName: string, sourceUrl?: string): string {
  // Try to extract domain from source URL or name
  let domain = sourceUrl || ""
  if (!domain.includes(".")) {
    // Guess domain from source name
    const cleanName = sourceName.toLowerCase().replace(/[^a-z0-9]/g, "")
    domain = `${cleanName}.com`
  } else {
    // Extract domain from URL
    try {
      const url = new URL(domain.startsWith("http") ? domain : `https://${domain}`)
      domain = url.hostname
    } catch {
      domain = `${sourceName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
    }
  }
  // Use Google's favicon service (more reliable)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

// Known sources with reliable logos
const KNOWN_SOURCES: Record<string, string> = {
  "techcrunch": "https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png",
  "the verge": "https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395367/favicon-64x64.0.png",
  "wired": "https://www.wired.com/verso/static/wired/assets/favicon.ico",
  "engadget": "https://s.blogsmithmedia.com/www.engadget.com/assets-hca2e6cdd0/images/favicon-160x160.png",
  "venturebeat": "https://venturebeat.com/wp-content/uploads/2022/03/cropped-VB_Logo_Favicon_2022-1.png",
}

export function SourceRow() {
  const { articles } = useAppStore()
  
  // Extract unique sources from articles
  const sources = useMemo(() => {
    if (articles.length === 0) return []
    
    const seen = new Set<string>()
    const uniqueSources: { name: string; logoUrl: string; domain: string }[] = []
    
    for (const article of articles) {
      const key = article.sourceName.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        
        // Check if we have a known logo
        const knownLogo = KNOWN_SOURCES[key]
        
        uniqueSources.push({
          name: article.sourceName,
          logoUrl: knownLogo || getFaviconUrl(article.sourceName, article.originalUrl),
          domain: article.originalUrl || "",
        })
      }
      if (uniqueSources.length >= 8) break
    }
    
    return uniqueSources
  }, [articles])

  if (sources.length === 0) return null

  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 py-4">
      {sources.map((source) => (
        <SourceItem key={source.name} source={source} />
      ))}
    </div>
  )
}

function SourceItem({ source }: { source: { name: string; logoUrl: string; domain: string } }) {
  const [imgError, setImgError] = useState(false)
  const initial = source.name.charAt(0).toUpperCase()

  return (
    <button className="flex shrink-0 flex-col items-center gap-1.5">
      <div 
        className="rounded-full p-[2px]"
        style={{ background: "linear-gradient(135deg, var(--primary), #D97706)" }}
      >
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-card">
          {imgError ? (
            <span className="font-sans text-lg font-bold text-primary">{initial}</span>
          ) : (
            <img
              src={source.logoUrl}
              alt={source.name}
              className="h-8 w-8 rounded object-contain"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </div>
      <span className="max-w-[64px] truncate text-center font-sans text-[11px] text-muted-foreground">
        {source.name}
      </span>
    </button>
  )
}
