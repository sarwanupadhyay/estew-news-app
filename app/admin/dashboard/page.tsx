"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  getAdminStats,
  type AdminStats,
} from "@/lib/admin-service"
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
  Clock,
  User,
  Loader2,
  Home,
  TrendingUp,
  Eye,
  BarChart3,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

type TabType = "home" | "users" | "articles" | "subscribers" | "newsletter"

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("home")
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Check authentication
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
      const data = await getAdminStats()
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const navItems = [
    { id: "home" as TabType, label: "Home", icon: Home, description: "Overview & insights" },
    { id: "users" as TabType, label: "Users", icon: Users, description: "Onboarded users" },
    { id: "articles" as TabType, label: "Articles", icon: Newspaper, description: "Stored articles" },
    { id: "subscribers" as TabType, label: "Pro Subscribers", icon: CreditCard, description: "Premium members" },
    { id: "newsletter" as TabType, label: "Newsletter", icon: Mail, description: "AI briefings" },
  ]

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0b0f]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed position */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#0a0b0f] transition-all duration-200 ${
        sidebarCollapsed ? "w-[72px]" : "w-64"
      } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        {/* Logo and collapse toggle */}
        <div className={`flex h-16 items-center border-b border-white/10 ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"}`}>
          <div className={`flex items-center ${sidebarCollapsed ? "" : "gap-3"}`}>
            <div className={`relative ${sidebarCollapsed ? "h-10 w-10" : "h-8 w-8"}`}>
              <Image
                src="/images/logo.svg"
                alt="Estew"
                fill
                className="object-contain dark:invert"
              />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-serif text-lg font-bold text-white">Estew</h1>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Mobile close button */}
            {!sidebarCollapsed && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 lg:hidden"
              >
                <X size={18} />
              </button>
            )}
            {/* Desktop collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white lg:flex ${sidebarCollapsed ? "mx-auto" : ""}`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto ${sidebarCollapsed ? "p-2" : "p-3"}`}>
          <div className={`${sidebarCollapsed ? "space-y-2" : "space-y-1"}`}>
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
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`flex w-full items-center rounded-xl transition-all ${
                    sidebarCollapsed 
                      ? `justify-center p-3 ${isActive ? "bg-primary/10 text-primary" : "text-gray-400 hover:bg-white/5 hover:text-white"}`
                      : `gap-3 px-3 py-2.5 text-left ${isActive ? "bg-primary/10 text-primary" : "text-gray-400 hover:bg-white/5 hover:text-white"}`
                  }`}
                >
                  <Icon size={sidebarCollapsed ? 22 : 18} />
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isActive ? "text-primary" : ""}`}>{item.label}</p>
                        <p className="text-[10px] text-gray-500">{item.description}</p>
                      </div>
                      {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* User section */}
        <div className={`border-t border-white/10 ${sidebarCollapsed ? "p-2" : "p-3"}`}>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? "Logout" : undefined}
            className={`flex w-full items-center rounded-xl text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400 ${
              sidebarCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
            }`}
          >
            <LogOut size={sidebarCollapsed ? 22 : 18} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content area - scrollable */}
      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-200 ${
        sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
      }`}>
        {/* Top bar - Fixed */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#0a0b0f] px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-400 hover:bg-white/10 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="font-semibold text-white">
                {navItems.find(n => n.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-gray-500">
                {navItems.find(n => n.id === activeTab)?.description}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Home Tab - Insights Overview */}
              {activeTab === "home" && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-[#12131a] p-5">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                        <Users size={20} className="text-blue-500" />
                      </div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#12131a] p-5">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                        <Newspaper size={20} className="text-emerald-500" />
                      </div>
                      <p className="text-sm text-gray-500">Total Articles</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalArticles || 0}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#12131a] p-5">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                        <CreditCard size={20} className="text-purple-500" />
                      </div>
                      <p className="text-sm text-gray-500">Pro Subscribers</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalSubscribers || 0}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#12131a] p-5">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                        <Mail size={20} className="text-amber-500" />
                      </div>
                      <p className="text-sm text-gray-500">Newsletter Subs</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalNewsletterSubscribers || 0}</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="rounded-2xl border border-white/10 bg-[#12131a] p-5">
                    <h3 className="mb-4 font-semibold text-white">Quick Actions</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <button
                        onClick={() => setActiveTab("newsletter")}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                          <Sparkles size={18} className="text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Generate Newsletter</p>
                          <p className="text-xs text-gray-500">AI-powered briefing</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("users")}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                          <Eye size={18} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">View Users</p>
                          <p className="text-xs text-gray-500">{stats?.totalUsers || 0} onboarded</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("articles")}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                          <BarChart3 size={18} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Browse Articles</p>
                          <p className="text-xs text-gray-500">{stats?.totalArticles || 0} stored</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("subscribers")}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                          <TrendingUp size={18} className="text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Pro Members</p>
                          <p className="text-xs text-gray-500">{stats?.totalSubscribers || 0} active</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Users */}
                    <div className="rounded-2xl border border-white/10 bg-[#12131a] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Recent Users</h3>
                        <button
                          onClick={() => setActiveTab("users")}
                          className="text-xs text-primary hover:underline"
                        >
                          View all
                        </button>
                      </div>
                      <div className="space-y-3">
                        {stats?.recentUsers.slice(0, 5).map((user) => (
                          <div key={user.id} className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-medium text-blue-500">
                              {user.displayName?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 truncate">
                              <p className="truncate text-sm font-medium text-white">{user.displayName || "Unknown"}</p>
                              <p className="truncate text-xs text-gray-500">{user.email}</p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${user.plan === "pro" ? "bg-purple-500/20 text-purple-400" : "bg-gray-500/20 text-gray-400"}`}>
                              {user.plan.toUpperCase()}
                            </span>
                          </div>
                        ))}
                        {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                          <p className="py-4 text-center text-sm text-gray-500">No users yet</p>
                        )}
                      </div>
                    </div>

                    {/* Recent Articles */}
                    <div className="rounded-2xl border border-white/10 bg-[#12131a] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Recent Articles</h3>
                        <button
                          onClick={() => setActiveTab("articles")}
                          className="text-xs text-primary hover:underline"
                        >
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
                              <p className="line-clamp-1 text-sm font-medium text-white">{article.title}</p>
                              <p className="text-xs text-gray-500">{article.sourceName}</p>
                            </div>
                          </div>
                        ))}
                        {(!stats?.recentArticles || stats.recentArticles.length === 0) && (
                          <p className="py-4 text-center text-sm text-gray-500">No articles yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="rounded-2xl border border-white/10 bg-[#12131a]">
                  <div className="border-b border-white/10 px-5 py-4">
                    <h3 className="font-semibold text-white">Onboarded Users</h3>
                    <p className="text-sm text-gray-500">{stats?.totalUsers || 0} total users</p>
                  </div>
                  <div className="p-5">
                    {stats?.recentUsers.length === 0 ? (
                      <div className="py-12 text-center">
                        <User size={32} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-500">No users found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats?.recentUsers.map((user) => (
                          <div key={user.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 font-semibold text-blue-500">
                              {user.displayName?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-medium text-white">{user.displayName || "Unknown"}</p>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${user.plan === "pro" ? "bg-purple-500/20 text-purple-400" : "bg-gray-500/20 text-gray-400"}`}>
                                  {user.plan.toUpperCase()}
                                </span>
                              </div>
                              <p className="truncate text-sm text-gray-500">{user.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Joined</p>
                              <p className="text-sm text-gray-400">{formatDate(user.createdAt)}</p>
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
                <div className="rounded-2xl border border-white/10 bg-[#12131a]">
                  <div className="border-b border-white/10 px-5 py-4">
                    <h3 className="font-semibold text-white">Stored Articles</h3>
                    <p className="text-sm text-gray-500">{stats?.totalArticles || 0} total articles</p>
                  </div>
                  <div className="p-5">
                    {stats?.recentArticles.length === 0 ? (
                      <div className="py-12 text-center">
                        <FileText size={32} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-500">No articles found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats?.recentArticles.map((article) => (
                          <div key={article.id} className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                            {article.imageUrl && (
                              <img src={article.imageUrl} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 font-medium text-white">{article.title}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm text-gray-500">{article.sourceName}</span>
                                <span className="text-gray-600">·</span>
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">{article.category}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Published</p>
                              <p className="text-sm text-gray-400">{formatDate(article.publishedAt)}</p>
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
                <div className="rounded-2xl border border-white/10 bg-[#12131a]">
                  <div className="border-b border-white/10 px-5 py-4">
                    <h3 className="font-semibold text-white">Pro Subscribers</h3>
                    <p className="text-sm text-gray-500">{stats?.totalSubscribers || 0} active subscriptions</p>
                  </div>
                  <div className="p-5">
                    {stats?.subscribers.length === 0 ? (
                      <div className="py-12 text-center">
                        <CreditCard size={32} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-500">No subscribers yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats?.subscribers.map((subscriber) => (
                          <div key={subscriber.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 font-semibold text-purple-500">
                              {subscriber.displayName?.charAt(0).toUpperCase() || "S"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-medium text-white">{subscriber.displayName || subscriber.id}</p>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${subscriber.status === "active" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                                  {subscriber.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="truncate text-sm text-gray-500">{subscriber.email}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar size={12} />
                                Renewal
                              </div>
                              <p className="text-sm text-gray-400">{formatDate(subscriber.renewalDate)}</p>
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
            </>
          )}
        </main>
      </div>
    </div>
  )
}
