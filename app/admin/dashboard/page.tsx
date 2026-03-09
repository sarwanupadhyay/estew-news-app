"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  getAdminStats,
  type AdminStats,
  type AdminUser,
  type AdminArticle,
  type AdminSubscriber,
  type NewsletterSubscriber,
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
  Shield,
  Sparkles,
  Copy,
  Check,
  Clock,
  User,
  FileText,
  Loader2,
  Download,
  AlertCircle,
} from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activeTab, setActiveTab] = useState<"newsletter" | "users" | "articles" | "subscribers">("newsletter")
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatingNewsletter, setGeneratingNewsletter] = useState(false)
  const [generatedNewsletter, setGeneratedNewsletter] = useState<string | null>(null)
  const [newsletterError, setNewsletterError] = useState<string | null>(null)
  const [savedNewsletters, setSavedNewsletters] = useState<Array<{
    id: string
    date: string
    content: string
    articlesUsed: number
    generatedAt: string
    status: string
  }>>([])
  const [selectedSavedNewsletter, setSelectedSavedNewsletter] = useState<string | null>(null)
  const [loadingNewsletters, setLoadingNewsletters] = useState(false)
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

  // Load saved newsletters when newsletter tab is active
  useEffect(() => {
    if (activeTab === "newsletter" && savedNewsletters.length === 0) {
      loadSavedNewsletters()
    }
  }, [activeTab])

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
      // Reload saved newsletters to show the new one
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0b0f]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-white">Estew Admin</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Newsletter Card */}
          <button
            onClick={() => setActiveTab("newsletter")}
            className={`group rounded-2xl border p-5 text-left transition-all ${
              activeTab === "newsletter"
                ? "border-primary/30 bg-primary/10"
                : "border-white/10 bg-[#12131a] hover:border-white/20"
            }`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5">
              <Sparkles size={22} className="text-amber-500" />
            </div>
            <h3 className="font-semibold text-white">Newsletter</h3>
            <p className="mt-1 text-sm text-gray-500">Generate AI briefings</p>
          </button>

          {/* Users Card */}
          <button
            onClick={() => setActiveTab("users")}
            className={`group rounded-2xl border p-5 text-left transition-all ${
              activeTab === "users"
                ? "border-primary/30 bg-primary/10"
                : "border-white/10 bg-[#12131a] hover:border-white/20"
            }`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
              <Users size={22} className="text-blue-500" />
            </div>
            <h3 className="font-semibold text-white">Onboarded Users</h3>
            <p className="mt-1 text-2xl font-bold text-white">
              {loading ? "..." : stats?.totalUsers || 0}
            </p>
          </button>

          {/* Articles Card */}
          <button
            onClick={() => setActiveTab("articles")}
            className={`group rounded-2xl border p-5 text-left transition-all ${
              activeTab === "articles"
                ? "border-primary/30 bg-primary/10"
                : "border-white/10 bg-[#12131a] hover:border-white/20"
            }`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
              <Newspaper size={22} className="text-emerald-500" />
            </div>
            <h3 className="font-semibold text-white">Articles</h3>
            <p className="mt-1 text-2xl font-bold text-white">
              {loading ? "..." : stats?.totalArticles || 0}
            </p>
          </button>

          {/* Subscribers Card */}
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`group rounded-2xl border p-5 text-left transition-all ${
              activeTab === "subscribers"
                ? "border-primary/30 bg-primary/10"
                : "border-white/10 bg-[#12131a] hover:border-white/20"
            }`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5">
              <CreditCard size={22} className="text-purple-500" />
            </div>
            <h3 className="font-semibold text-white">Pro Subscribers</h3>
            <p className="mt-1 text-2xl font-bold text-white">
              {loading ? "..." : stats?.totalSubscribers || 0}
            </p>
          </button>
        </div>

        {/* Content Panel */}
        <div className="rounded-2xl border border-white/10 bg-[#12131a]">
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 className="font-semibold text-white">
              {activeTab === "newsletter" && "Newsletter Generator"}
              {activeTab === "users" && "Onboarded Users"}
              {activeTab === "articles" && "Stored Articles"}
              {activeTab === "subscribers" && "Pro Subscribers"}
            </h2>
            {activeTab !== "newsletter" && (
              <span className="text-sm text-gray-500">
                {activeTab === "users" && `${stats?.recentUsers.length || 0} recent`}
                {activeTab === "articles" && `${stats?.recentArticles.length || 0} recent`}
                {activeTab === "subscribers" && `${stats?.subscribers.length || 0} total`}
              </span>
            )}
          </div>

          {/* Panel Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Newsletter Tab */}
                {activeTab === "newsletter" && (
                  <div className="space-y-6">
                    {/* Generate Button */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleGenerateNewsletter}
                        disabled={generatingNewsletter}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-medium text-white transition-all hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                      >
                        {generatingNewsletter ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Generating Newsletter...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Generate Newsletter with AI
                          </>
                        )}
                      </button>
                      <p className="text-sm text-gray-500">
                        Uses Gemini AI to create a daily tech briefing from recent articles
                      </p>
                    </div>

                    {/* Error Message */}
                    {newsletterError && (
                      <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                        <AlertCircle size={20} className="shrink-0 text-red-400" />
                        <div>
                          <p className="font-medium text-red-400">Error generating newsletter</p>
                          <p className="mt-1 text-sm text-red-300/70">{newsletterError}</p>
                          {newsletterError.includes("GEMINI_API_KEY") && (
                            <p className="mt-2 text-sm text-gray-400">
                              Please add your GEMINI_API_KEY in the environment variables.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Generated Newsletter */}
                    {generatedNewsletter && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center justify-between border-b border-emerald-500/20 px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-emerald-400" />
                            <span className="font-medium text-emerald-400">Newsletter Generated</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleCopyNewsletter}
                              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/20"
                            >
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                              {copied ? "Copied!" : "Copy"}
                            </button>
                            <button
                              onClick={handleDownloadNewsletter}
                              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/20"
                            >
                              <Download size={14} />
                              Download
                            </button>
                          </div>
                        </div>
                        <pre
                          ref={newsletterRef}
                          className="max-h-[500px] overflow-y-auto whitespace-pre-wrap p-5 font-mono text-sm text-gray-300"
                        >
                          {generatedNewsletter}
                        </pre>
                      </div>
                    )}

                    {/* Newsletter Subscribers */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">Newsletter Subscribers</h3>
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                            {stats?.totalNewsletterSubscribers || 0}
                          </span>
                        </div>
                      </div>

                      {!stats?.newsletterSubscribers || stats.newsletterSubscribers.length === 0 ? (
                        <div className="py-8 text-center">
                          <Mail size={24} className="mx-auto mb-2 text-gray-600" />
                          <p className="text-sm text-gray-500">No newsletter subscribers yet</p>
                          <p className="mt-1 text-xs text-gray-600">
                            Users can subscribe to the newsletter from the app
                          </p>
                        </div>
                      ) : (
                        <div className="max-h-64 space-y-2 overflow-y-auto">
                          {stats.newsletterSubscribers.map((subscriber) => (
                            <div
                              key={subscriber.id}
                              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                                  <Mail size={14} className="text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {subscriber.displayName || subscriber.email.split("@")[0]}
                                  </p>
                                  <p className="text-xs text-gray-500">{subscriber.email}</p>
                                  <p className="text-[10px] text-gray-600">
                                    Subscribed {formatDate(subscriber.subscribedAt)}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  subscriber.status === "active"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-gray-500/20 text-gray-400"
                                }`}
                              >
                                {subscriber.status.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Saved Newsletters */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-medium text-white">Saved Newsletters</h3>
                        <button
                          onClick={loadSavedNewsletters}
                          disabled={loadingNewsletters}
                          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/20"
                        >
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
                          {savedNewsletters.map((newsletter) => (
                            <div
                              key={newsletter.id}
                              className="rounded-lg border border-white/5 bg-white/5 transition-colors hover:bg-white/10"
                            >
                              <button
                                onClick={() => setSelectedSavedNewsletter(
                                  selectedSavedNewsletter === newsletter.id ? null : newsletter.id
                                )}
                                className="flex w-full items-center justify-between p-3 text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                    <FileText size={14} className="text-amber-500" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">{newsletter.date}</p>
                                    <p className="text-xs text-gray-500">
                                      {newsletter.articlesUsed} articles used
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight
                                  size={16}
                                  className={`text-gray-500 transition-transform ${
                                    selectedSavedNewsletter === newsletter.id ? "rotate-90" : ""
                                  }`}
                                />
                              </button>

                              {selectedSavedNewsletter === newsletter.id && (
                                <div className="border-t border-white/5 p-3">
                                  <div className="mb-2 flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(newsletter.content)
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 2000)
                                      }}
                                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/20"
                                    >
                                      <Copy size={12} />
                                      Copy
                                    </button>
                                    <button
                                      onClick={() => {
                                        const blob = new Blob([newsletter.content], { type: "text/plain" })
                                        const url = URL.createObjectURL(blob)
                                        const a = document.createElement("a")
                                        a.href = url
                                        a.download = `estew-newsletter-${newsletter.date}.txt`
                                        document.body.appendChild(a)
                                        a.click()
                                        document.body.removeChild(a)
                                        URL.revokeObjectURL(url)
                                      }}
                                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/20"
                                    >
                                      <Download size={12} />
                                      Download
                                    </button>
                                  </div>
                                  <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/50 p-3 font-mono text-xs text-gray-400">
                                    {newsletter.content}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                  <div className="space-y-3">
                    {stats?.recentUsers.length === 0 ? (
                      <div className="py-12 text-center">
                        <User size={32} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-500">No users found</p>
                      </div>
                    ) : (
                      stats?.recentUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 font-semibold text-blue-500">
                            {user.displayName.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white truncate">
                                {user.displayName || "Unknown"}
                              </p>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  user.plan === "pro"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-gray-500/20 text-gray-400"
                                }`}
                              >
                                {user.plan.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Joined</p>
                            <p className="text-sm text-gray-400">{formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Articles Tab */}
                {activeTab === "articles" && (
                  <div className="space-y-3">
                    {stats?.recentArticles.length === 0 ? (
                      <div className="py-12 text-center">
                        <FileText size={32} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-500">No articles found</p>
                      </div>
                    ) : (
                      stats?.recentArticles.map((article) => (
                        <div
                          key={article.id}
                          className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10"
                        >
                          {article.imageUrl && (
                            <img
                              src={article.imageUrl}
                              alt=""
                              className="h-16 w-24 shrink-0 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white line-clamp-2">{article.title}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-sm text-gray-500">{article.sourceName}</span>
                              <span className="text-gray-600">•</span>
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                                {article.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Published</p>
                            <p className="text-sm text-gray-400">{formatDate(article.publishedAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Subscribers Tab */}
                {activeTab === "subscribers" && (
                  <div className="space-y-3">
                    {stats?.subscribers.length === 0 ? (
                      <div className="py-12 text-center">
                        <CreditCard size={32} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-500">No subscribers yet</p>
                      </div>
                    ) : (
                      stats?.subscribers.map((subscriber) => (
                        <div
                          key={subscriber.id}
                          className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 font-semibold text-purple-500">
                            {subscriber.displayName.charAt(0).toUpperCase() || "S"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white truncate">
                                {subscriber.displayName || subscriber.id}
                              </p>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  subscriber.status === "active"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {subscriber.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{subscriber.email}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar size={12} />
                              Renewal
                            </div>
                            <p className="text-sm text-gray-400">{formatDate(subscriber.renewalDate)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
