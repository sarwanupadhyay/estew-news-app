"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { AdminStats } from "@/app/api/admin/stats/route"
import { NewsletterEditor } from "@/components/admin/newsletter-editor"
import {
  Users,
  Newspaper,
  CreditCard,
  Mail,
  LogOut,
  RefreshCw,
  ChevronRight,
  Calendar,
  User,
  Loader2,
  Home,
  TrendingUp,
  Eye,
  BarChart3,
  Menu,
  X,
  Sparkles,
  FileText,
} from "lucide-react"

type TabType = "home" | "users" | "articles" | "subscribers" | "newsletter" | "newsletter_subscribers"

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("home")
  const [refreshing, setRefreshing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem("estew_admin_auth")
    if (auth !== "true") {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
      loadStats()
    }
  }, [router])

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("estew_admin_auth")
    sessionStorage.removeItem("estew_admin_email")
    router.push("/admin")
  }

  const formatDate = (dateInput: Date | string) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const navItems = [
    { id: "home" as TabType, label: "Overview", icon: Home },
    { id: "users" as TabType, label: "Users", icon: Users },
    { id: "articles" as TabType, label: "Articles", icon: Newspaper },
    { id: "subscribers" as TabType, label: "Pro Subs", icon: CreditCard },
    { id: "newsletter" as TabType, label: "Newsletter", icon: Mail },
    { id: "newsletter_subscribers" as TabType, label: "Email List", icon: Users },
  ]

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5">
            <div className="relative h-7 w-7">
              <Image
                src="/images/logo.svg"
                alt="Estew"
                fill
                className="object-contain dark:invert"
              />
            </div>
            <div>
              <span className="text-base font-semibold text-foreground">estew</span>
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground">ADMIN</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base font-semibold text-foreground">
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Home Tab */}
              {activeTab === "home" && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} color="text-info" bgColor="bg-info/10" />
                    <StatCard icon={Newspaper} label="Total Articles" value={stats?.totalArticles || 0} color="text-success" bgColor="bg-success/10" />
                    <StatCard icon={CreditCard} label="Pro Subs" value={stats?.totalSubscribers || 0} color="text-primary" bgColor="bg-primary/10" />
                    <StatCard icon={Mail} label="Email List" value={stats?.totalNewsletterSubscribers || 0} color="text-warning" bgColor="bg-warning/10" />
                  </div>

                  {/* Quick Actions */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Actions</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <QuickAction icon={Sparkles} label="Generate Newsletter" description="AI briefing" onClick={() => setActiveTab("newsletter")} />
                      <QuickAction icon={Eye} label="View Users" description={`${stats?.totalUsers || 0} users`} onClick={() => setActiveTab("users")} />
                      <QuickAction icon={BarChart3} label="Browse Articles" description={`${stats?.totalArticles || 0} articles`} onClick={() => setActiveTab("articles")} />
                      <QuickAction icon={TrendingUp} label="Pro Members" description={`${stats?.totalSubscribers || 0} active`} onClick={() => setActiveTab("subscribers")} />
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Users */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Recent Users</h3>
                        <button onClick={() => setActiveTab("users")} className="text-xs text-primary hover:underline">
                          View all
                        </button>
                      </div>
                      <div className="space-y-3">
                        {stats?.recentUsers.slice(0, 5).map((user) => (
                          <div key={user.id} className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-info/10 text-xs font-semibold text-info">
                              {user.displayName?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 truncate">
                              <p className="truncate text-sm font-medium text-foreground">{user.displayName || "Unknown"}</p>
                              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                              user.plan === "pro" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}>
                              {user.plan.toUpperCase()}
                            </span>
                          </div>
                        ))}
                        {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                          <p className="py-4 text-center text-sm text-muted-foreground">No users yet</p>
                        )}
                      </div>
                    </div>

                    {/* Recent Articles */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Recent Articles</h3>
                        <button onClick={() => setActiveTab("articles")} className="text-xs text-primary hover:underline">
                          View all
                        </button>
                      </div>
                      <div className="space-y-3">
                        {stats?.recentArticles.slice(0, 5).map((article) => (
                          <div key={article.id} className="flex items-start gap-3">
                            {article.imageUrl && (
                              <img
                                src={article.imageUrl}
                                alt=""
                                className="h-10 w-14 shrink-0 rounded-lg object-cover"
                                onError={(e) => { e.currentTarget.style.display = "none" }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="line-clamp-1 text-sm font-medium text-foreground">{article.title}</p>
                              <p className="text-xs text-muted-foreground">{article.sourceName}</p>
                            </div>
                          </div>
                        ))}
                        {(!stats?.recentArticles || stats.recentArticles.length === 0) && (
                          <p className="py-4 text-center text-sm text-muted-foreground">No articles yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="rounded-2xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">All Users</h3>
                    <p className="text-xs text-muted-foreground">{stats?.totalUsers || 0} total</p>
                  </div>
                  <div className="p-5">
                    {stats?.recentUsers.length === 0 ? (
                      <EmptyState icon={User} message="No users found" />
                    ) : (
                      <div className="space-y-3">
                        {stats?.recentUsers.map((user) => (
                          <div key={user.id} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10 font-semibold text-info">
                              {user.displayName?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-medium text-foreground">{user.displayName || "Unknown"}</p>
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                                  user.plan === "pro" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                }`}>
                                  {user.plan.toUpperCase()}
                                </span>
                              </div>
                              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">Joined</p>
                              <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Articles Tab */}
              {activeTab === "articles" && (
                <div className="rounded-2xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Stored Articles</h3>
                    <p className="text-xs text-muted-foreground">{stats?.totalArticles || 0} total</p>
                  </div>
                  <div className="p-5">
                    {stats?.recentArticles.length === 0 ? (
                      <EmptyState icon={FileText} message="No articles found" />
                    ) : (
                      <div className="space-y-3">
                        {stats?.recentArticles.map((article) => (
                          <div key={article.id} className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                            {article.imageUrl && (
                              <img src={article.imageUrl} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 font-medium text-foreground">{article.title}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{article.sourceName}</span>
                                <span className="text-muted-foreground/50">·</span>
                                <span className="rounded-md bg-success/10 px-2 py-0.5 text-[10px] text-success">{article.category}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">Published</p>
                              <p className="text-sm text-muted-foreground">{formatDate(article.publishedAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subscribers Tab */}
              {activeTab === "subscribers" && (
                <div className="rounded-2xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Pro Subscribers</h3>
                    <p className="text-xs text-muted-foreground">{stats?.totalSubscribers || 0} active</p>
                  </div>
                  <div className="p-5">
                    {stats?.subscribers.length === 0 ? (
                      <EmptyState icon={CreditCard} message="No subscribers yet" />
                    ) : (
                      <div className="space-y-3">
                        {stats?.subscribers.map((subscriber) => (
                          <div key={subscriber.id} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                              {subscriber.displayName?.charAt(0).toUpperCase() || "S"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-medium text-foreground">{subscriber.displayName || subscriber.id}</p>
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                                  subscriber.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                }`}>
                                  {subscriber.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="truncate text-sm text-muted-foreground">{subscriber.email}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Calendar size={10} />
                                Renewal
                              </div>
                              <p className="text-sm text-muted-foreground">{formatDate(subscriber.renewalDate)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Newsletter Tab */}
              {activeTab === "newsletter" && <NewsletterEditor />}

              {/* Newsletter Subscribers Tab */}
              {activeTab === "newsletter_subscribers" && <NewsletterSubscribersTab />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// Helper Components
function StatCard({ icon: Icon, label, value, color, bgColor }: { icon: any; label: string; value: number; color: string; bgColor: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}>
        <Icon size={20} className={color} />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function QuickAction({ icon: Icon, label, description, onClick }: { icon: any; label: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        <Icon size={18} className="text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="py-12 text-center">
      <Icon size={32} className="mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

// Newsletter Subscribers Tab
function NewsletterSubscribersTab() {
  const [subscribers, setSubscribers] = useState<Array<{
    id: string
    email: string
    displayName: string
    subscribedAt: string
    status: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadSubscribers()
  }, [])

  const loadSubscribers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/newsletter-subscribers")
      const data = await res.json()
      if (data.subscribers) {
        setSubscribers(data.subscribers)
      }
    } catch (error) {
      console.error("Failed to load subscribers:", error)
    }
    setLoading(false)
  }

  const exportToCSV = () => {
    setExporting(true)
    try {
      const headers = ["Email", "Name", "Subscribed At", "Status"]
      const rows = subscribers.map(sub => [
        sub.email,
        sub.displayName,
        new Date(sub.subscribedAt).toLocaleDateString(),
        sub.status
      ])
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n")
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`
      link.click()
    } catch (error) {
      console.error("Export failed:", error)
    }
    setExporting(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Newsletter Subscribers</h3>
          <p className="text-sm text-muted-foreground">{subscribers.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSubscribers}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            disabled={exporting || subscribers.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className="col-span-5">Subscriber</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-3">Subscribed</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : subscribers.length === 0 ? (
            <EmptyState icon={Mail} message="No newsletter subscribers yet" />
          ) : (
            subscribers.map((subscriber) => (
              <div key={subscriber.id} className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                <div className="col-span-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/10 text-sm font-medium text-warning">
                    {subscriber.displayName?.charAt(0).toUpperCase() || subscriber.email?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="truncate font-medium text-foreground">
                    {subscriber.displayName || "Anonymous"}
                  </span>
                </div>
                <div className="col-span-4 truncate text-sm text-muted-foreground">
                  {subscriber.email}
                </div>
                <div className="col-span-3 text-sm text-muted-foreground">
                  {formatDate(subscriber.subscribedAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
