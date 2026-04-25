"use client"

import { useState } from "react"
import { X, AlertCircle, CheckCircle2 } from "lucide-react"
import type { AdminUser } from "./users-view"

export function UserDetailDialog({
  user,
  onClose,
  onChanged,
}: {
  user: AdminUser
  onClose: () => void
  onChanged?: () => void
}) {
  const [busy, setBusy] = useState<null | "extend" | "cancel" | "activate">(null)
  const [extendDays, setExtendDays] = useState(30)
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const callApi = async (
    action: "extend" | "cancel" | "activate",
    body: Record<string, unknown> = {},
  ) => {
    setBusy(action)
    setFeedback(null)
    try {
      const res = await fetch(`/api/admin-controls/users/${user.uid}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Request failed")
      setFeedback({ type: "ok", text: json.message || "Updated successfully" })
      onChanged?.()
    } catch (e) {
      setFeedback({ type: "err", text: (e as Error).message })
    } finally {
      setBusy(null)
      setConfirmCancel(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-base font-medium text-primary">
                {(user.displayName || user.email).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-serif text-lg font-semibold text-foreground">
                {user.displayName || user.email.split("@")[0]}
              </h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <Row label="User ID" value={<code className="text-xs">{user.uid}</code>} />
          <Row
            label="Plan"
            value={
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.plan === "pro" ? "bg-warning/15 text-warning" : "bg-secondary text-muted-foreground"
                }`}
              >
                {user.plan === "pro" ? "Pro" : "Free"}
              </span>
            }
          />
          <Row label="Onboarded" value={user.hasOnboarded ? "Yes" : "No"} />
          <Row label="Newsletter subscribed" value={user.newsletterSubscribed ? "Yes" : "No"} />
          <Row label="Topics followed" value={user.topics.length.toString()} />
          <Row label="Companies followed" value={user.companies.length.toString()} />
          <Row label="Saved articles" value={user.savedArticlesCount.toString()} />
          <Row
            label="Joined"
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"
            }
          />
          {user.plan === "pro" && (
            <>
              <Row
                label="Subscription started"
                value={
                  user.subscriptionStartDate
                    ? new Date(user.subscriptionStartDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"
                }
              />
              <Row
                label="Renewal date"
                value={
                  user.renewalDate
                    ? new Date(user.renewalDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"
                }
              />
            </>
          )}
          {user.topics.length > 0 && (
            <div>
              <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                Topics
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-background px-2 py-0.5 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subscription management */}
        <div className="border-t border-border bg-secondary/30 p-5">
          <h3 className="mb-3 font-serif text-sm font-semibold text-foreground">
            Subscription management
          </h3>

          {feedback && (
            <div
              className={`mb-3 flex items-start gap-2 rounded-lg border p-3 text-xs ${
                feedback.type === "ok"
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {feedback.type === "ok" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {user.plan === "pro" ? (
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label
                    htmlFor="extend-days"
                    className="mb-1 block text-xs font-medium text-muted-foreground"
                  >
                    Extend by (days)
                  </label>
                  <input
                    id="extend-days"
                    type="number"
                    min={1}
                    max={365}
                    value={extendDays}
                    onChange={(e) => setExtendDays(Number(e.target.value) || 30)}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => callApi("extend", { days: extendDays })}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {busy === "extend" ? "Extending..." : "Extend"}
                </button>
              </div>

              {!confirmCancel ? (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => setConfirmCancel(true)}
                  className="w-full rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                >
                  Cancel Pro plan
                </button>
              ) : (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="mb-3 text-xs text-foreground">
                    This will immediately downgrade {user.email} to the Free plan and clear their
                    renewal date. They will lose Pro access right away.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => callApi("cancel")}
                      className="flex-1 rounded-lg bg-destructive px-3 py-2 text-xs font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {busy === "cancel" ? "Cancelling..." : "Yes, cancel now"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCancel(false)}
                      disabled={busy !== null}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50"
                    >
                      Keep Pro
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label
                  htmlFor="activate-days"
                  className="mb-1 block text-xs font-medium text-muted-foreground"
                >
                  Activate Pro for (days)
                </label>
                <input
                  id="activate-days"
                  type="number"
                  min={1}
                  max={365}
                  value={extendDays}
                  onChange={(e) => setExtendDays(Number(e.target.value) || 30)}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => callApi("activate", { days: extendDays })}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {busy === "activate" ? "Activating..." : "Activate Pro"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right text-sm text-foreground">{value}</span>
    </div>
  )
}
