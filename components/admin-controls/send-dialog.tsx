"use client"

import { useState } from "react"
import { X, Send, Loader2, Users, Mail, Star, User } from "lucide-react"

type Audience = "all" | "newsletter" | "pro" | "single"

interface Props {
  onSend: (audience: Audience, singleEmail?: string) => Promise<{ error?: string } | undefined | { sent: number; failed: number; total: number }>
  onClose: () => void
}

const AUDIENCES: { value: Audience; label: string; description: string; icon: typeof Users }[] = [
  {
    value: "all",
    label: "All users",
    description: "Send to every registered user on Estew",
    icon: Users,
  },
  {
    value: "newsletter",
    label: "Newsletter subscribers",
    description: "Only users who opted in to the daily newsletter",
    icon: Mail,
  },
  {
    value: "pro",
    label: "Pro subscribers",
    description: "Premium members on the Pro plan",
    icon: Star,
  },
  {
    value: "single",
    label: "Single recipient",
    description: "Send to one email address (great for testing)",
    icon: User,
  },
]

export function SendDialog({ onSend, onClose }: Props) {
  const [audience, setAudience] = useState<Audience>("newsletter")
  const [singleEmail, setSingleEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setError("")
    if (audience === "single" && !singleEmail.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    setSending(true)
    const result = await onSend(audience, audience === "single" ? singleEmail : undefined)
    setSending(false)
    if (result && "error" in result && result.error) {
      setError(result.error)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={!sending ? onClose : undefined}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">Send newsletter</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Choose who receives this edition.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          {AUDIENCES.map((opt) => {
            const Icon = opt.icon
            const active = audience === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAudience(opt.value)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:bg-secondary"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium ${active ? "text-foreground" : "text-foreground"}`}>
                    {opt.label}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{opt.description}</div>
                </div>
                <span
                  className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
                    active ? "border-primary bg-primary" : "border-border"
                  }`}
                  aria-hidden="true"
                />
              </button>
            )
          })}

          {audience === "single" && (
            <div className="pt-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email address
              </label>
              <input
                type="email"
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
