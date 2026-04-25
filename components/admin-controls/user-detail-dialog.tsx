"use client"

import { X } from "lucide-react"
import type { AdminUser } from "./users-view"

export function UserDetailDialog({
  user,
  onClose,
}: {
  user: AdminUser
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl"
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
