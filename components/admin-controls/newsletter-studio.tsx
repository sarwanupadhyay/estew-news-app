"use client"

import { useState } from "react"
import {
  Sparkles,
  Loader2,
  Send,
  Check,
  AlertTriangle,
  X,
} from "lucide-react"
import { NewsletterPreview } from "./newsletter-preview"
import { AiToolsSection } from "./ai-tools-section"
import { SavedNewslettersList } from "./saved-newsletters-list"
import { SendDialog } from "./send-dialog"
import type { Newsletter } from "@/lib/newsletter-html"

type Audience = "all" | "newsletter" | "pro" | "single"

export function NewsletterStudio() {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [selectedAiToolId, setSelectedAiToolId] = useState<string | null>(null)
  const [sendOpen, setSendOpen] = useState(false)
  const [sendResult, setSendResult] = useState<{
    sent: number
    failed: number
    total: number
  } | null>(null)
  const [savedRefreshKey, setSavedRefreshKey] = useState(0)

  const handleGenerate = async () => {
    setGenerating(true)
    setError("")
    setSendResult(null)
    try {
      const res = await fetch("/api/admin-controls/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiToolId: selectedAiToolId || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Generation failed")
        return
      }
      setNewsletter(data.newsletter)
      setActiveId(data.id ?? null)
      // Trigger saved-newsletters list refresh
      setSavedRefreshKey((k) => k + 1)
    } catch (err) {
      setError("Network error: " + (err as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  const handleOpenSaved = (n: Newsletter, id: string) => {
    setNewsletter(n)
    setActiveId(id)
    setSendResult(null)
    setError("")
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSend = async (audience: Audience, singleEmail?: string) => {
    if (!newsletter) return
    setSendResult(null)
    try {
      const res = await fetch("/api/admin-controls/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletter,
          audience,
          singleEmail,
          // Pass the saved id (when present) so the email's "View online" link
          // and the unsubscribe URL can point at the right resource.
          newsletterId: activeId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Send failed")
        return { error: data.error || "Send failed" }
      }
      setSendResult(data)
      setSendOpen(false)
      return data
    } catch (err) {
      const msg = "Network error: " + (err as Error).message
      setError(msg)
      return { error: msg }
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Tool selector + library */}
      <AiToolsSection selectedId={selectedAiToolId} onSelect={setSelectedAiToolId} />

      {/* Generate action */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Generate today&apos;s newsletter
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Pulls articles from the last 24 hours in your Firestore database and uses
              Gemini to craft a curated briefing.
              {selectedAiToolId
                ? " The selected AI tool will be featured."
                : " No AI tool selected — the newsletter will be generated without one."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 lg:self-auto"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Newsletter
              </>
            )}
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <div className="font-medium text-destructive">Something went wrong</div>
            <div className="mt-1 text-muted-foreground">{error}</div>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss"
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {sendResult && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <div>
            <div className="font-medium text-success">Newsletter sent</div>
            <div className="mt-1 text-muted-foreground">
              Delivered to {sendResult.sent} of {sendResult.total} recipients
              {sendResult.failed > 0 && ` (${sendResult.failed} failed)`}.
            </div>
          </div>
        </div>
      )}

      {/* Active preview / loading / placeholder */}
      {generating && (
        <section className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
          <h3 className="font-serif text-xl font-semibold text-foreground">
            Curating today&apos;s briefing
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Reading the news and writing a polished newsletter for you...
          </p>
        </section>
      )}

      {newsletter && !generating && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-serif text-base font-semibold text-foreground">
                Active draft
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activeId ? "Loaded from your saved newsletters." : "Just generated."} Review it
                below, then send when ready.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewsletter(null)
                  setActiveId(null)
                  setSendResult(null)
                }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
              >
                Close draft
              </button>
              <button
                type="button"
                onClick={() => setSendOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                <Send className="h-4 w-4" />
                Send Newsletter
              </button>
            </div>
          </div>
          <NewsletterPreview newsletter={newsletter} />
        </section>
      )}

      {/* Saved newsletters from Firestore */}
      <SavedNewslettersList onOpen={handleOpenSaved} refreshKey={savedRefreshKey} />

      {sendOpen && newsletter && (
        <SendDialog onSend={handleSend} onClose={() => setSendOpen(false)} />
      )}
    </div>
  )
}
