"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  getAdminStats,
  type AdminStats,
} from "@/lib/admin-service"
import {
  Users,
  Newspaper,
  CreditCard,
  Mail,
  LogOut,
  RefreshCw,
  ChevronRight,
  Calendar,
  Sparkles,
  Copy,
  Check,
  Clock,
  User,
  FileText,
  Loader2,
  Download,
  AlertCircle,
  Send,
  CheckCircle,
  XCircle,
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
  
  // Newsletter states
  const [generatingNewsletter, setGeneratingNewsletter] = useState(false)
  const [generatedNewsletter, setGeneratedNewsletter] = useState<string | null>(null)
  const [newsletterError, setNewsletterError] = useState<string | null>(null)
  const [savedNewsletters, setSavedNewsletters] = useState<Array<{
    id: string
    newsletterId?: string
    newsletterNumber?: number
    subject?: string
    date: string
    content: string
    articlesUsed: number
    generatedAt: string
    status: string
    deliveryStats?: {
      totalRecipients: number
      delivered: number
      failed: number
      pending: number
    }
    sentAt?: string | null
  }>>([])
  const [selectedSavedNewsletter, setSelectedSavedNewsletter] = useState<string | null>(null)
  const [loadingNewsletters, setLoadingNewsletters] = useState(false)
  const [sendingNewsletter, setSendingNewsletter] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const newsletterRef = useRef<HTMLPreElement>(null)

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

  const loadSavedNewsletters = async () => {
    setLoadingNewsletters(true)
    try {
      const response = await fetch("/api/admin/newsletter")
      const data = await response.json()
      if (data.newsletters) {
        setSavedNewsletters(data.newsletters)
      }
    } catch (error) {
      console.error("Failed to load newsletters:", error)
    }
    setLoadingNewsletters(false)
  }

  useEffect(() => {
    if (activeTab === "newsletter" && savedNewsletters.length === 0) {
      loadSavedNewsletters()
    }
  }, [activeTab])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    if (activeTab === "newsletter") {
      await loadSavedNewsletters()
    }
    setRefreshing(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("estew_admin_auth")
    sessionStorage.removeItem("estew_admin_email")
    router.push("/admin")
  }

  const handleGenerateNewsletter = async () => {
    setGeneratingNewsletter(true)
    setNewsletterError(null)
    setGeneratedNewsletter(null)
    
    try {
      const response = await fetch("/api/admin/newsletter", {
        method: "POST",
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate newsletter")
      }
      
      setGeneratedNewsletter(data.newsletter)
      loadSavedNewsletters()
    } catch (error) {
      setNewsletterError(error instanceof Error ? error.message : "Failed to generate newsletter")
    } finally {
      setGeneratingNewsletter(false)
    }
  }

  const handleCopyNewsletter = () => {
    if (generatedNewsletter) {
      navigator.clipboard.writeText(generatedNewsletter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadNewsletter = () => {
    if (generatedNewsletter) {
      const blob = new Blob([generatedNewsletter], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `estew-newsletter-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleSendNewsletter = async (newsletterId: string) => {
    if (!confirm("Are you sure you want to send this newsletter to all subscribers?")) {
      return
    }

    setSendingNewsletter(newsletterId)
    setSendError(null)

    try {
      const response = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send newsletter")
      }

      loadSavedNewsletters()
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Failed to send newsletter")
    } finally {
      setSendingNewsletter(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: React.ReactNode; text: string; className: string }> = {
      sent: { icon: <CheckCircle size={10} />, text: "SENT", className: "bg-emerald-500/20 text-emerald-400" },
      sending: { icon: <Loader2 size={10} className="animate-spin" />, text: "SENDING", className: "bg-blue-500/20 text-blue-400" },
      failed: { icon: <XCircle size={10} />, text: "FAILED", className: "bg-red-500/20 text-red-400" },
      partially_sent: { icon: <AlertCircle size={10} />, text: "PARTIAL", className: "bg-amber-500/20 text-amber-400" },
      scheduled: { icon: <Clock size={10} />, text: "SCHEDULED", className: "bg-purple-500/20 text-purple-400" },
    }
    const badge = badges[status] || { icon: null, text: "GENERATED", className: "bg-gray-500/20 text-gray-400" }
    return (
      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
        {badge.icon}
        {badge.text}
      </span>
    )
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
        {/* Logo */}
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
          {!sidebarCollapsed && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 lg:hidden"
            >
              <X size={18} />
            </button>
          )}
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {/* Sidebar collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white lg:flex"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>
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
              {activeTab === "newsletter" && (
                <div className="space-y-6">
                  {/* Generate Button */}
                  <div className="rounded-2xl border border-white/10 bg-[#12131a] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Generate Newsletter</h3>
                        <p className="text-sm text-gray-500">Uses Gemini AI to create a daily tech briefing</p>
                      </div>
                      <button
                        onClick={handleGenerateNewsletter}
                        disabled={generatingNewsletter}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-medium text-white transition-all hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                      >
                        {generatingNewsletter ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Generate with AI
                          </>
                        )}
                      </button>
                    </div>

                    {newsletterError && (
                      <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                        <AlertCircle size={20} className="shrink-0 text-red-400" />
                        <div>
                          <p className="font-medium text-red-400">Error generating newsletter</p>
                          <p className="mt-1 text-sm text-red-300/70">{newsletterError}</p>
                        </div>
                      </div>
                    )}

                    {generatedNewsletter && (
                      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center justify-between border-b border-emerald-500/20 px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-emerald-400" />
                            <span className="font-medium text-emerald-400">Newsletter Generated</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={handleCopyNewsletter} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/20">
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                              {copied ? "Copied!" : "Copy"}
                            </button>
                            <button onClick={handleDownloadNewsletter} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/20">
                              <Download size={14} />
                              Download
                            </button>
                          </div>
                        </div>
                        <pre ref={newsletterRef} className="max-h-[400px] overflow-y-auto whitespace-pre-wrap p-5 font-mono text-sm text-gray-300">
                          {generatedNewsletter}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Newsletter Subscribers */}
                  <div className="rounded-2xl border border-white/10 bg-[#12131a] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">Newsletter Subscribers</h3>
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                          {stats?.totalNewsletterSubscribers || 0}
                        </span>
                      </div>
                    </div>
                    {!stats?.newsletterSubscribers || stats.newsletterSubscribers.length === 0 ? (
                      <div className="py-8 text-center">
                        <Mail size={24} className="mx-auto mb-2 text-gray-600" />
                        <p className="text-sm text-gray-500">No newsletter subscribers yet</p>
                      </div>
                    ) : (
                      <div className="max-h-64 space-y-2 overflow-y-auto">
                        {stats.newsletterSubscribers.map((subscriber) => (
                          <div key={subscriber.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                                <Mail size={14} className="text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{subscriber.displayName || subscriber.email.split("@")[0]}</p>
                                <p className="text-xs text-gray-500">{subscriber.email}</p>
                              </div>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${subscriber.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}>
                              {subscriber.status.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Saved Newsletters */}
                  <div className="rounded-2xl border border-white/10 bg-[#12131a] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-white">Saved Newsletters</h3>
                      <button onClick={loadSavedNewsletters} disabled={loadingNewsletters} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/20">
                        <RefreshCw size={14} className={loadingNewsletters ? "animate-spin" : ""} />
                        Refresh
                      </button>
                    </div>
                    {loadingNewsletters ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={20} className="animate-spin text-gray-500" />
                      </div>
                    ) : savedNewsletters.length === 0 ? (
                      <div className="py-8 text-center">
                        <Mail size={24} className="mx-auto mb-2 text-gray-600" />
                        <p className="text-sm text-gray-500">No newsletters generated yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sendError && (
                          <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                            <p className="text-sm text-red-300">{sendError}</p>
                          </div>
                        )}
                        {savedNewsletters.map((newsletter) => (
                          <div key={newsletter.id} className="rounded-lg border border-white/5 bg-white/5 transition-colors hover:bg-white/10">
                            <button onClick={() => setSelectedSavedNewsletter(selectedSavedNewsletter === newsletter.id ? null : newsletter.id)} className="flex w-full items-center justify-between p-3 text-left">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                  <FileText size={14} className="text-amber-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">{newsletter.newsletterId || newsletter.id}</p>
                                  <p className="text-xs text-gray-500">{newsletter.date} - {newsletter.articlesUsed} articles</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(newsletter.status)}
                                <ChevronRight size={16} className={`text-gray-500 transition-transform ${selectedSavedNewsletter === newsletter.id ? "rotate-90" : ""}`} />
                              </div>
                            </button>
                            {selectedSavedNewsletter === newsletter.id && (
                              <div className="border-t border-white/5 p-3">
                                {newsletter.deliveryStats && newsletter.deliveryStats.totalRecipients > 0 && (
                                  <div className="mb-3 grid grid-cols-4 gap-2 rounded-lg bg-black/30 p-2">
                                    <div className="text-center">
                                      <p className="text-lg font-bold text-white">{newsletter.deliveryStats.totalRecipients}</p>
                                      <p className="text-[10px] text-gray-500">Total</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg font-bold text-emerald-400">{newsletter.deliveryStats.delivered}</p>
                                      <p className="text-[10px] text-gray-500">Delivered</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg font-bold text-red-400">{newsletter.deliveryStats.failed}</p>
                                      <p className="text-[10px] text-gray-500">Failed</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg font-bold text-blue-400">{newsletter.deliveryStats.pending}</p>
                                      <p className="text-[10px] text-gray-500">Pending</p>
                                    </div>
                                  </div>
                                )}
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                  {newsletter.status !== "sent" && newsletter.status !== "sending" && (
                                    <button onClick={() => handleSendNewsletter(newsletter.id)} disabled={sendingNewsletter === newsletter.id} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/80 disabled:opacity-50">
                                      {sendingNewsletter === newsletter.id ? (<><Loader2 size={12} className="animate-spin" />Sending...</>) : (<><Send size={12} />Send to Subscribers</>)}
                                    </button>
                                  )}
                                  <button onClick={() => { navigator.clipboard.writeText(newsletter.content); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/20">
                                    <Copy size={12} />Copy
                                  </button>
                                  <button onClick={() => { const blob = new Blob([newsletter.content], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${newsletter.newsletterId || newsletter.id}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url) }} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/20">
                                    <Download size={12} />Download
                                  </button>
                                </div>
                                {newsletter.sentAt && <p className="mb-2 text-xs text-gray-500">Sent on {new Date(newsletter.sentAt).toLocaleString()}</p>}
                                <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/50 p-3 font-mono text-xs text-gray-400">{newsletter.content}</pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
