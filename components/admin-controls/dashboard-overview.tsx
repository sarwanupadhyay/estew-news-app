"use client"

import useSWR from "swr"
import {
  Users,
  Newspaper,
  Mail,
  Star,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"
import { StatCard } from "./stat-card"

interface Stats {
  totalUsers: number
  totalArticles: number
  newsletterSubscribers: number
  proSubscribers: number
  onboardedUsers: number
  error?: string
  configError?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function DashboardOverview() {
  const { data, isLoading, error } = useSWR<Stats>("/api/admin-controls/stats", fetcher, {
    refreshInterval: 30000,
  })

  const onboardingRate =
    data && data.totalUsers > 0
      ? Math.round((data.onboardedUsers / data.totalUsers) * 100)
      : 0

  return (
    <div className="space-y-6">
      {data?.error && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
          <span className="font-medium text-warning">Database warning:</span> {data.error}
        </div>
      )}

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Platform statistics"
      >
        <StatCard
          label="Total Users"
          value={data?.totalUsers}
          icon={Users}
          loading={isLoading}
          color="text-info"
          description="Registered accounts on Estew"
        />
        <StatCard
          label="Onboarded Users"
          value={data?.onboardedUsers}
          icon={CheckCircle2}
          loading={isLoading}
          color="text-success"
          description={`${onboardingRate}% completion rate`}
        />
        <StatCard
          label="Total Articles"
          value={data?.totalArticles}
          icon={Newspaper}
          loading={isLoading}
          color="text-primary"
          description="Articles in Firestore database"
        />
        <StatCard
          label="Pro Subscribers"
          value={data?.proSubscribers}
          icon={Star}
          loading={isLoading}
          color="text-warning"
          description="Active premium members"
        />
        <StatCard
          label="Newsletter Subscribers"
          value={data?.newsletterSubscribers}
          icon={Mail}
          loading={isLoading}
          color="text-info"
          description="Opted in to email newsletter"
        />
        <StatCard
          label="Engagement"
          value={onboardingRate}
          icon={TrendingUp}
          loading={isLoading}
          color="text-success"
          description="% users completing onboarding"
          suffix="%"
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">Quick actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            href="/admin-controls/newsletter"
            title="Generate Newsletter"
            description="Create a new newsletter from the latest 24 hours of news."
            icon={Mail}
          />
          <QuickLink
            href="/admin-controls/articles"
            title="View Articles"
            description="Browse and inspect articles in the database."
            icon={Newspaper}
          />
          <QuickLink
            href="/admin-controls/users"
            title="Manage Users"
            description="Review user profiles, plans, and activity."
            icon={Users}
          />
        </div>
      </section>
    </div>
  )
}

function QuickLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string
  title: string
  description: string
  icon: typeof Mail
}) {
  return (
    <a
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-secondary"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </a>
  )
}
