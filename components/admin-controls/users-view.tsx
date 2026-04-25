"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search } from "lucide-react"
import { UserDetailDialog } from "./user-detail-dialog"

export interface AdminUser {
  uid: string
  email: string
  displayName: string
  photoURL: string
  plan: "free" | "pro"
  newsletterSubscribed: boolean
  hasOnboarded: boolean
  topics: string[]
  companies: string[]
  savedArticlesCount: number
  createdAt: string | null
  subscriptionStartDate: string | null
  subscriptionEndDate: string | null
  renewalDate: string | null
}

interface UsersResponse {
  users: AdminUser[]
  total: number
  error?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All users" },
  { value: "onboarded", label: "Onboarded" },
  { value: "pro", label: "Pro" },
  { value: "free", label: "Free" },
  { value: "expired", label: "Expired Pro" },
  { value: "newsletter", label: "Newsletter" },
]

interface Props {
  defaultFilter?: string
  hideFilters?: boolean
  title?: string
}

export function UsersView({ defaultFilter = "all", hideFilters = false }: Props) {
  const [filter, setFilter] = useState(defaultFilter)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const params = new URLSearchParams()
  params.set("filter", filter)
  if (search) params.set("search", search)

  const { data, isLoading, mutate } = useSWR<UsersResponse>(
    `/api/admin-controls/users?${params.toString()}`,
    fetcher
  )

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-input py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          {!hideFilters && (
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter === f.value
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
          {isLoading ? "Loading..." : `${data?.total ?? 0} users`}
        </div>

        {data?.error && (
          <div className="border-b border-border bg-warning/10 px-4 py-3 text-sm">
            <span className="font-medium text-warning">Database notice:</span> {data.error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Plan</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Onboarded</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Newsletter</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Joined</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && (data?.users?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
              {data?.users?.map((u) => (
                <tr key={u.uid} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">
                          {u.displayName || u.email.split("@")[0]}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.plan === "pro"
                          ? "bg-warning/15 text-warning"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {u.plan === "pro" ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <Dot ok={u.hasOnboarded} />
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <Dot ok={u.newsletterSubscribed} />
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-muted-foreground md:table-cell">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedUser && (
        <UserDetailDialog
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onChanged={() => {
            mutate()
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

function Avatar({ user }: { user: AdminUser }) {
  if (user.photoURL) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full object-cover" />
  }
  const initial = (user.displayName || user.email || "?").charAt(0).toUpperCase()
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
      {initial}
    </div>
  )
}

function Dot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex h-2 w-2 rounded-full ${
        ok ? "bg-success" : "bg-muted-foreground/40"
      }`}
      aria-label={ok ? "Yes" : "No"}
    />
  )
}
