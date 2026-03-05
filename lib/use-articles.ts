"use client"

import useSWR from "swr"
import type { Article, Category } from "./types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useArticles(category: Category | "All" = "All") {
  const { data, error, isLoading, mutate } = useSWR<{
    articles: Article[]
    source: string
  }>(`/api/news?category=${category}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    articles: data?.articles || [],
    source: data?.source || "loading",
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useAiSummary(
  title: string,
  summary: string,
  url: string,
  enabled: boolean
) {
  const { data, isLoading } = useSWR(
    enabled ? `/api/summarize:${url}` : null,
    () =>
      fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, url }),
      }).then((r) => r.json()),
    { revalidateOnFocus: false }
  )

  return {
    aiSummary: data?.aiSummary || null,
    isLoading,
  }
}
