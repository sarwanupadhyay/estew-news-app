"use client"

import useSWR from "swr"
import { Mail, Users, Star, User, Clock, AlertCircle } from "lucide-react"

interface SendRecord {
  id: string
  sentAt: string
  audience: "all" | "newsletter" | "pro" | "single" | string
  subject: string
  total: number
  sent: number
  failed: number
  sectionCount: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const AUDIENCE_META: Record<string, { label: string; icon: typeof Mail }> = {
  all: { label: "All users", icon: Users },
  newsletter: { label: "Newsletter", icon: Mail },
  pro: { label: "Pro", icon: Star },
  single: { label: "Single", icon: User },
}

export function NewsletterHistory() {
  const { data, isLoading } = useSWR<{ sends: SendRecord[]; error?: string }>(
    "/api/admin-controls/newsletter/history",
    fetcher,
    { refreshInterval: 30000 }
  )

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="font-serif text-lg font-semibold text-foreground">Recent sends</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            History of newsletters delivered through Estew.
          </p>
        </div>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>

      {isLoading ? (
        <div className="space-y-2 p-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary/60" />
          ))}
        </div>
      ) : data?.error ? (
        <div className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-warning" />
          {data.error}
        </div>
      ) : !data?.sends?.length ? (
        <div className="p-8 text-center">
          <Mail className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No newsletters sent yet. Generate and send your first one above.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {data.sends.map((send) => {
            const meta = AUDIENCE_META[send.audience] || AUDIENCE_META.all
            const Icon = meta.icon
            const successRate =
              send.total > 0 ? Math.round((send.sent / send.total) * 100) : 0
            const date = new Date(send.sentAt)
            return (
              <li key={send.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{send.subject}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{date.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}</span>
                      <span aria-hidden>·</span>
                      <span>{meta.label}</span>
                      <span aria-hidden>·</span>
                      <span>{send.sectionCount} sections</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 sm:gap-5">
                  <Stat label="Recipients" value={send.total} />
                  <Stat label="Delivered" value={send.sent} accent="text-success" />
                  {send.failed > 0 && (
                    <Stat label="Failed" value={send.failed} accent="text-destructive" />
                  )}
                  <div className="hidden text-right sm:block">
                    <div className={`text-sm font-semibold ${
                      successRate === 100
                        ? "text-success"
                        : successRate >= 80
                        ? "text-foreground"
                        : "text-warning"
                    }`}>
                      {successRate}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      success
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Stat({
  label,
  value,
  accent = "text-foreground",
}: {
  label: string
  value: number
  accent?: string
}) {
  return (
    <div className="text-center">
      <div className={`text-sm font-semibold ${accent}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  )
}
