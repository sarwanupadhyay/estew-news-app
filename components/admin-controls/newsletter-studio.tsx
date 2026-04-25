"use client"

import { useState } from "react"
import { Sparkles, Loader2, Send, Check, AlertTriangle, Wand2 } from "lucide-react"
import { NewsletterPreview } from "./newsletter-preview"
import { AiToolDialog } from "./ai-tool-dialog"
import { SendDialog } from "./send-dialog"
import type { Newsletter, AiToolOfDay } from "@/lib/newsletter-html"

type Audience = "all" | "newsletter" | "pro" | "single"

export function NewsletterStudio() {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [aiToolOpen, setAiToolOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [sendResult, setSendResult] = useState<{
    sent: number
    failed: number
    total: number
  } | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setError("")
    setSendResult(null)
    try {
      const res = await fetch("/api/admin-controls/newsletter/generate", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Generation failed")
        return
      }
      setNewsletter(data.newsletter)
    } catch (err) {
      setError("Network error: " + (err as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  const handleSetAiTool = (tool: AiToolOfDay | null) => {
    if (!newsletter) return
    setNewsletter({ ...newsletter, aiToolOfDay: tool })
    setAiToolOpen(false)
  }

  const handleSend = async (audience: Audience, singleEmail?: string) => {
    if (!newsletter) return
    setSendResult(null)
    try {
      const res = await fetch("/api/admin-controls/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletter, audience, singleEmail }),
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
      {/* Action bar */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">Generate today&apos;s newsletter</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Pulls news from the last 24 hours and uses Gemini to craft a curated briefing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {newsletter ? "Regenerate" : "Generate Newsletter"}
                </>
              )}
            </button>
            {newsletter && (
              <>
                <button
                  type="button"
                  onClick={() => setAiToolOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  <Wand2 className="h-4 w-4" />
                  {newsletter.aiToolOfDay ? "Edit AI Tool" : "Add AI Tool"}
                </button>
                <button
                  type="button"
                  onClick={() => setSendOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                  Send Newsletter
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <div className="font-medium text-destructive">Something went wrong</div>
            <div className="mt-1 text-muted-foreground">{error}</div>
          </div>
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

      {/* Preview */}
      {!newsletter && !generating && (
        <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Sparkles className="mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="font-serif text-xl font-semibold text-foreground">
            Your newsletter will appear here
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Click &ldquo;Generate Newsletter&rdquo; to create today&apos;s edition from the last 24 hours of tech news.
          </p>
        </section>
      )}

      {generating && (
        <section className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
          <h3 className="font-serif text-xl font-semibold text-foreground">Curating today&apos;s briefing</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Reading the news and writing a polished newsletter for you...
          </p>
        </section>
      )}

      {newsletter && !generating && (
        <NewsletterPreview newsletter={newsletter} />
      )}

      {aiToolOpen && newsletter && (
        <AiToolDialog
          initial={newsletter.aiToolOfDay ?? null}
          onSave={handleSetAiTool}
          onClose={() => setAiToolOpen(false)}
        />
      )}

      {sendOpen && newsletter && (
        <SendDialog onSend={handleSend} onClose={() => setSendOpen(false)} />
      )}
    </div>
  )
}
