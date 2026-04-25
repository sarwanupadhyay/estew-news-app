"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  FileText,
  Eye,
  Send,
  Trash2,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react"
import type { SavedNewsletterSummary } from "@/app/api/admin-controls/newsletter/list/route"
import type { Newsletter } from "@/lib/newsletter-html"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Props {
  onOpen: (newsletter: Newsletter, id: string) => void
  refreshKey: number
}

export function SavedNewslettersList({ onOpen, refreshKey }: Props) {
  const { data, isLoading, mutate } = useSWR<{
    newsletters: SavedNewsletterSummary[]
    error?: string
    configError?: string
  }>(`/api/admin-controls/newsletter/list?r=${refreshKey}`, fetcher)

  const [busyId, setBusyId] = useState<string | null>(null)

  const items = data?.newsletters ?? []
  const configError = data?.configError || data?.error

  const handleOpen = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin-controls/newsletter/${id}`)
      const j = await res.json()
      if (!res.ok || !j.newsletter) {
        alert(j.error || "Failed to load newsletter")
        return
      }
      onOpen(j.newsletter as Newsletter, id)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved newsletter? This cannot be undone.")) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin-controls/newsletter/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        alert(j.error || "Failed to delete")
        return
      }
      await mutate()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Saved newsletters
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Every newsletter you generate is saved here. Open one to preview or send.
            </p>
          </div>
        </div>
      </div>

      {configError ? (
        <div className="flex items-start gap-2 p-5 text-sm text-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span>{configError}</span>
        </div>
      ) : isLoading ? (
        <div className="space-y-2 p-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary/60" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No saved newsletters yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click &ldquo;Generate Newsletter&rdquo; above to create your first one.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((n) => {
            const date = new Date(n.createdAt || n.date)
            return (
              <li
                key={n.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {n.subject}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {date.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{n.sectionCount} sections</span>
                    <span aria-hidden>·</span>
                    <span>{n.articleCount} articles</span>
                    {n.hasAiTool && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                          AI tool
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpen(n.id)}
                    disabled={busyId === n.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-60"
                  >
                    {busyId === n.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpen(n.id)}
                    disabled={busyId === n.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 disabled:opacity-60"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    disabled={busyId === n.id}
                    aria-label="Delete newsletter"
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
