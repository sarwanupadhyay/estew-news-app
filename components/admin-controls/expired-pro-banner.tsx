"use client"

import useSWR from "swr"
import Link from "next/link"
import { AlertTriangle, ChevronRight } from "lucide-react"

interface ExpiredUserSummary {
  uid: string
  email: string
  displayName: string
  renewalDate: string | null
  daysExpired: number
}

interface ExpiredResponse {
  expiredNow: ExpiredUserSummary[]
  alreadyExpired: ExpiredUserSummary[]
  error?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

export function ExpiredProBanner() {
  // Refresh every 5 minutes so the banner stays accurate while admins work
  const { data } = useSWR<ExpiredResponse>(
    "/api/admin-controls/subscriptions/expired",
    fetcher,
    { refreshInterval: 5 * 60 * 1000, revalidateOnFocus: true },
  )

  if (!data) return null
  if (data.error) return null

  const all = [...(data.expiredNow ?? []), ...(data.alreadyExpired ?? [])]
  if (all.length === 0) return null

  // Show up to 3 in the banner; the rest are reachable via Users page
  const preview = all.slice(0, 3)
  const remaining = all.length - preview.length

  return (
    <section
      role="alert"
      className="rounded-2xl border border-warning/30 bg-warning/5 p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-serif text-base font-semibold text-foreground">
              Pro subscription expired
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {all.length === 1
                ? "1 user's Pro plan has reached its renewal date and was downgraded to Free."
                : `${all.length} users' Pro plans have reached their renewal date and were downgraded to Free.`}
            </p>
          </div>
        </div>
        <Link
          href="/admin-controls/users?filter=expired"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Review users
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <ul className="mt-4 divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-background">
        {preview.map((u) => (
          <li
            key={u.uid}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {u.displayName || u.email || u.uid.slice(0, 8)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {u.email || "no email on file"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-warning">
                Expired {formatDate(u.renewalDate)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {u.daysExpired === 0 ? "Today" : `${u.daysExpired}d ago`}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {remaining > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          + {remaining} more {remaining === 1 ? "user" : "users"} —{" "}
          <Link
            href="/admin-controls/users?filter=expired"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            view all
          </Link>
        </p>
      )}
    </section>
  )
}
