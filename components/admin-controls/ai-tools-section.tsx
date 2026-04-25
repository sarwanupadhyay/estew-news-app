"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Trash2, Wand2, Check, ExternalLink, AlertCircle } from "lucide-react"
import { AiToolFormDialog } from "./ai-tool-form-dialog"
import type { AiTool } from "@/app/api/admin-controls/ai-tools/route"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Props {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function AiToolsSection({ selectedId, onSelect }: Props) {
  const { data, isLoading, mutate } = useSWR<{
    tools: AiTool[]
    error?: string
    configError?: string
  }>("/api/admin-controls/ai-tools", fetcher)

  const [addOpen, setAddOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const tools = data?.tools ?? []
  const configError = data?.configError || data?.error

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this AI tool? This cannot be undone.")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin-controls/ai-tools/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        alert(j.error || "Failed to delete tool")
        return
      }
      if (selectedId === id) onSelect(null)
      await mutate()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wand2 className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              AI Tool of the Day
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pick one tool to feature in today&apos;s newsletter, or add a new one to your library.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add AI tool
        </button>
      </div>

      <div className="p-5">
        {configError ? (
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span>{configError}</span>
          </div>
        ) : isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-secondary/60" />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Wand2 className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No AI tools yet. Add your first one above.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {selectedId ? "Selected — will be included in the next newsletter." : "Click a tool to select it."}
              </p>
              {selectedId && (
                <button
                  type="button"
                  onClick={() => onSelect(null)}
                  className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Clear selection
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => {
                const isSelected = tool.id === selectedId
                return (
                  <article
                    key={tool.id}
                    className={`group relative flex flex-col rounded-xl border bg-background p-4 transition ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(isSelected ? null : tool.id)}
                      aria-pressed={isSelected}
                      className="flex flex-col items-start gap-2 text-left"
                    >
                      <div className="flex w-full items-start gap-3">
                        {tool.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tool.imageUrl || "/placeholder.svg"}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Wand2 className="h-4 w-4" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-foreground">
                            {tool.name}
                          </h3>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {tool.description}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </button>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(tool.id)
                        }}
                        disabled={deletingId === tool.id}
                        aria-label={`Delete ${tool.name}`}
                        className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>

      {addOpen && (
        <AiToolFormDialog
          onClose={() => setAddOpen(false)}
          onCreated={async (tool) => {
            setAddOpen(false)
            await mutate()
            onSelect(tool.id)
          }}
        />
      )}
    </section>
  )
}
