"use client"

import useSWR from "swr"
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, RefreshCw } from "lucide-react"

type CheckStatus = "ok" | "warn" | "fail" | "skip"

interface Check {
  id: string
  category: string
  name: string
  status: CheckStatus
  message: string
  detail?: string
  fix?: string
}

interface DiagnosticsResponse {
  overall: CheckStatus
  summary: { ok: number; warn: number; fail: number; skip: number }
  checks: Check[]
  runAt: string
}

const fetcher = async (url: string): Promise<DiagnosticsResponse> => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load diagnostics")
  return res.json()
}

const STATUS_STYLES: Record<
  CheckStatus,
  { icon: typeof CheckCircle2; color: string; bg: string; border: string; label: string }
> = {
  ok: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Healthy",
  },
  warn: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Warning",
  },
  fail: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Failed",
  },
  skip: {
    icon: MinusCircle,
    color: "text-muted-foreground",
    bg: "bg-muted/40",
    border: "border-border",
    label: "Skipped",
  },
}

export function DiagnosticsView() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<DiagnosticsResponse>(
    "/api/admin-controls/diagnostics",
    fetcher,
    { revalidateOnFocus: false },
  )

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin" />
        Running diagnostics...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Failed to load diagnostics. Try refreshing the page.
      </div>
    )
  }

  const overallStyle = STATUS_STYLES[data.overall]
  const OverallIcon = overallStyle.icon

  // Group by category
  const grouped = data.checks.reduce<Record<string, Check[]>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div
        className={`flex flex-col gap-4 rounded-2xl border p-5 lg:flex-row lg:items-center lg:justify-between ${overallStyle.border} ${overallStyle.bg}`}
      >
        <div className="flex items-start gap-4">
          <OverallIcon className={`mt-0.5 h-6 w-6 shrink-0 ${overallStyle.color}`} />
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Overall status: {overallStyle.label}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.summary.ok} healthy &middot; {data.summary.warn} warning
              {data.summary.warn === 1 ? "" : "s"} &middot; {data.summary.fail} failure
              {data.summary.fail === 1 ? "" : "s"} &middot; {data.summary.skip} skipped
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Last run {new Date(data.runAt).toLocaleString()}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => mutate()}
          disabled={isValidating}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50 lg:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
          {isValidating ? "Running..." : "Re-run checks"}
        </button>
      </div>

      {/* Grouped checks */}
      {Object.entries(grouped).map(([category, checks]) => (
        <section key={category} className="rounded-2xl border border-border bg-card">
          <header className="border-b border-border px-5 py-3">
            <h3 className="font-serif text-base font-semibold text-foreground">{category}</h3>
          </header>
          <ul className="divide-y divide-border">
            {checks.map((c) => {
              const style = STATUS_STYLES[c.status]
              const Icon = style.icon
              return (
                <li key={c.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.color}`} />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style.color} ${style.bg}`}
                      >
                        {style.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.message}</p>
                    {c.detail ? (
                      <pre className="mt-1 overflow-x-auto rounded-md bg-muted/50 p-2 text-xs text-foreground">
                        {c.detail}
                      </pre>
                    ) : null}
                    {c.fix ? (
                      <p className="mt-1 text-xs text-foreground">
                        <span className="font-semibold">How to fix: </span>
                        {c.fix}
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
