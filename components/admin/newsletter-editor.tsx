"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Sparkles,
  Send,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Wrench,
  FileText,
  TrendingUp,
  Rocket,
  Package,
  BarChart3,
  Zap,
  Code,
  ExternalLink,
} from "lucide-react"

// Newsletter section types
interface NewsletterSection {
  id: string
  title: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  content: string
  articles?: Array<{
    title: string
    summary: string
    source: string
    imageUrl?: string
  }>
  editable: boolean
}

interface AITool {
  id: string
  name: string
  description: string
  category: string
  url: string
  imageUrl?: string
  featured: boolean
  createdAt: string
}

interface Newsletter {
  id: string
  newsletterId: string
  newsletterNumber: number
  subject: string
  date: string
  status: string
  sections: NewsletterSection[]
  aiToolOfDay?: {
    name: string
    description: string
    url: string
    imageUrl?: string
  }
  generatedAt: string
  scheduledTime?: string | null
  sentAt?: string | null
  deliveryStats?: {
    totalRecipients: number
    delivered: number
    failed: number
    pending: number
  }
}

const SECTION_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  top_story: TrendingUp,
  ai_breakthroughs: Sparkles,
  startup_radar: Rocket,
  product_launches: Package,
  market_pulse: BarChart3,
  ai_tool_of_day: Wrench,
  quick_bytes: Zap,
  developer_insight: Code,
}

const SECTION_LABELS: Record<string, string> = {
  top_story: "Top Story",
  ai_breakthroughs: "AI Breakthroughs",
  startup_radar: "Startup Radar",
  product_launches: "Product Launches",
  market_pulse: "Market Pulse",
  ai_tool_of_day: "AI Tool of the Day",
  quick_bytes: "Quick Bytes",
  developer_insight: "Developer Insight",
}

export function NewsletterEditor() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [aiTools, setAiTools] = useState<AITool[]>([])
  const [selectedNewsletter, setSelectedNewsletter] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [scheduling, setScheduling] = useState<string | null>(null)
  const [scheduleTime, setScheduleTime] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToolManager, setShowToolManager] = useState(false)
  const [selectedToolForNewsletter, setSelectedToolForNewsletter] = useState<string | null>(null)
  
  // New tool form
  const [newTool, setNewTool] = useState({
    name: "",
    description: "",
    category: "",
    url: "",
    imageUrl: "",
  })
  const [addingTool, setAddingTool] = useState(false)

  useEffect(() => {
    loadNewsletters()
    loadAiTools()
  }, [])

  const loadNewsletters = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/newsletter")
      const data = await res.json()
      if (data.newsletters) {
        // Map aiToolOfTheDay to aiToolOfDay for consistency in the UI
        const mappedNewsletters = data.newsletters.map((n: Newsletter & { aiToolOfTheDay?: Newsletter["aiToolOfDay"] }) => ({
          ...n,
          aiToolOfDay: n.aiToolOfTheDay || n.aiToolOfDay,
        }))
        setNewsletters(mappedNewsletters)
      }
    } catch (err) {
      setError("Failed to load newsletters")
    } finally {
      setLoading(false)
    }
  }

  const loadAiTools = async () => {
    try {
      const res = await fetch("/api/admin/ai-tools")
      const data = await res.json()
      if (data.tools) {
        setAiTools(data.tools)
      }
    } catch (err) {
      console.error("Failed to load AI tools:", err)
    }
  }

  const generateNewsletter = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiToolId: selectedToolForNewsletter,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate newsletter")
      }
      await loadNewsletters()
      setSelectedToolForNewsletter(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate newsletter")
    } finally {
      setGenerating(false)
    }
  }

  const sendNewsletter = async (newsletterId: string) => {
    if (!confirm("Send this newsletter to all subscribers now?")) return
    setSending(newsletterId)
    setError(null)
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterId }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to send newsletter")
      }
      await loadNewsletters()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send newsletter")
    } finally {
      setSending(null)
    }
  }

  const scheduleNewsletter = async (newsletterId: string) => {
    if (!scheduleTime) {
      setError("Please select a scheduled time")
      return
    }
    setError(null)
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletterId,
          scheduledTime: new Date(scheduleTime).toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule newsletter")
      }
      await loadNewsletters()
      setScheduling(null)
      setScheduleTime("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule newsletter")
    }
  }

  const updateSection = async (newsletterId: string, sectionId: string, content: string) => {
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletterId,
          sectionId,
          content,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update section")
      }
      await loadNewsletters()
      setEditingSection(null)
      setEditContent("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update section")
    }
  }

  const addAiTool = async () => {
    if (!newTool.name || !newTool.description || !newTool.url) {
      setError("Please fill in all required fields")
      return
    }
    setAddingTool(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTool),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to add AI tool")
      }
      await loadAiTools()
      setNewTool({ name: "", description: "", category: "", url: "", imageUrl: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add AI tool")
    } finally {
      setAddingTool(false)
    }
  }

  const deleteAiTool = async (toolId: string) => {
    if (!confirm("Delete this AI tool?")) return
    try {
      const res = await fetch(`/api/admin/ai-tools?id=${toolId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to delete AI tool")
      }
      await loadAiTools()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete AI tool")
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
            <CheckCircle size={12} />
            Sent
          </span>
        )
      case "sending":
        return (
          <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
            <Loader2 size={12} className="animate-spin" />
            Sending
          </span>
        )
      case "scheduled":
        return (
          <span className="flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
            <Clock size={12} />
            Scheduled
          </span>
        )
      case "failed":
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
            <XCircle size={12} />
            Failed
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 rounded-full bg-gray-500/20 px-2 py-0.5 text-xs font-medium text-gray-400">
            <FileText size={12} />
            Draft
          </span>
        )
    }
  }

  const selectedNewsletterData = newsletters.find(n => n.id === selectedNewsletter)

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="text-sm text-red-300">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header with actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Newsletter Intelligence</h3>
          <p className="text-sm text-gray-400">Generate and manage AI-powered newsletters</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowToolManager(!showToolManager)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10"
          >
            <Wrench size={14} />
            AI Tools
          </button>
          <button
            onClick={loadNewsletters}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* AI Tools Manager */}
      {showToolManager && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-medium text-white">AI Tool Library</h4>
            <button
              onClick={() => setShowToolManager(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Add new tool form */}
          <div className="mb-4 space-y-3 rounded-lg bg-black/30 p-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                type="text"
                placeholder="Tool name *"
                value={newTool.name}
                onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Category"
                value={newTool.category}
                onChange={(e) => setNewTool({ ...newTool, category: e.target.value })}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
              <input
                type="url"
                placeholder="Tool URL *"
                value={newTool.url}
                onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
              <input
                type="url"
                placeholder="Image URL (optional)"
                value={newTool.imageUrl}
                onChange={(e) => setNewTool({ ...newTool, imageUrl: e.target.value })}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Description *"
                value={newTool.description}
                onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
              />
              <button
                onClick={addAiTool}
                disabled={addingTool}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/80 disabled:opacity-50"
              >
                {addingTool ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add Tool
              </button>
            </div>
          </div>

          {/* Tools list */}
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {aiTools.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">No AI tools added yet</p>
            ) : (
              aiTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Wrench size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tool.name}</p>
                      <p className="text-xs text-gray-500">{tool.category || "Uncategorized"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => deleteAiTool(tool.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Generate newsletter section */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 className="mb-3 font-medium text-white">Generate New Newsletter</h4>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs text-gray-400">AI Tool of the Day (Optional)</label>
            <select
              value={selectedToolForNewsletter || ""}
              onChange={(e) => setSelectedToolForNewsletter(e.target.value || null)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none"
            >
              <option value="">Auto-select from articles</option>
              {aiTools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name} ({tool.category || "Uncategorized"})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={generateNewsletter}
            disabled={generating}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/80 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Newsletter
              </>
            )}
          </button>
        </div>
      </div>

      {/* Newsletters list */}
      <div className="space-y-3">
        <h4 className="font-medium text-white">Recent Newsletters</h4>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : newsletters.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 py-12 text-center">
            <FileText size={32} className="mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400">No newsletters generated yet</p>
            <p className="text-sm text-gray-500">Click "Generate Newsletter" to create your first one</p>
          </div>
        ) : (
          newsletters.map((newsletter) => (
            <div
              key={newsletter.id}
              className="rounded-xl border border-white/10 bg-white/5 transition-colors"
            >
              {/* Newsletter header */}
              <button
                onClick={() => setSelectedNewsletter(selectedNewsletter === newsletter.id ? null : newsletter.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{newsletter.newsletterId}</p>
                    <p className="text-xs text-gray-500">{newsletter.date} - {newsletter.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(newsletter.status)}
                  {selectedNewsletter === newsletter.id ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {selectedNewsletter === newsletter.id && (
                <div className="border-t border-white/10 p-4">
                  {/* Delivery stats */}
                  {newsletter.deliveryStats && newsletter.deliveryStats.totalRecipients > 0 && (
                    <div className="mb-4 grid grid-cols-4 gap-2 rounded-lg bg-black/30 p-3">
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

                  {/* AI Tool of the Day display */}
                  {newsletter.aiToolOfDay && (
                    <div className="mb-4 rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-purple-400">
                        <Wrench size={12} />
                        AI Tool of the Day
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        {newsletter.aiToolOfDay.imageUrl && (
                          <img
                            src={newsletter.aiToolOfDay.imageUrl}
                            alt={newsletter.aiToolOfDay.name}
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none" }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">{newsletter.aiToolOfDay.name}</p>
                          <p className="truncate text-sm text-gray-400">{newsletter.aiToolOfDay.description}</p>
                        </div>
                        <a
                          href={newsletter.aiToolOfDay.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-purple-500/20 p-2 text-purple-400 hover:bg-purple-500/30"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {newsletter.status !== "sent" && newsletter.status !== "sending" && (
                      <>
                        <button
                          onClick={() => sendNewsletter(newsletter.id)}
                          disabled={sending === newsletter.id}
                          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/80 disabled:opacity-50"
                        >
                          {sending === newsletter.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send size={14} />
                              Send Now
                            </>
                          )}
                        </button>
                        {scheduling === newsletter.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="datetime-local"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none"
                            />
                            <button
                              onClick={() => scheduleNewsletter(newsletter.id)}
                              className="rounded-lg bg-purple-500 px-3 py-2 text-sm font-medium text-white hover:bg-purple-600"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => {
                                setScheduling(null)
                                setScheduleTime("")
                              }}
                              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:bg-white/10"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setScheduling(newsletter.id)}
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10"
                          >
                            <Calendar size={14} />
                            Schedule
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => {
                        const content = newsletter.sections?.map(s => `${s.title}\n${s.content}`).join("\n\n") || ""
                        navigator.clipboard.writeText(content)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  {/* Scheduled time display */}
                  {newsletter.scheduledTime && newsletter.status === "scheduled" && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2 text-sm text-purple-300">
                      <Clock size={14} />
                      Scheduled for: {new Date(newsletter.scheduledTime).toLocaleString()}
                    </div>
                  )}

                  {/* Sections editor */}
                  <div className="space-y-2">
                    {newsletter.sections?.map((section) => {
                      const Icon = SECTION_ICONS[section.id] || FileText
                      const isExpanded = expandedSections.has(`${newsletter.id}-${section.id}`)
                      const isEditing = editingSection === `${newsletter.id}-${section.id}`

                      return (
                        <div
                          key={section.id}
                          className="rounded-lg border border-white/5 bg-black/20"
                        >
                          <button
                            onClick={() => toggleSection(`${newsletter.id}-${section.id}`)}
                            className="flex w-full items-center justify-between p-3 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <Icon size={14} className="text-primary" />
                              <span className="text-sm font-medium text-white">
                                {SECTION_LABELS[section.id] || section.title}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp size={14} className="text-gray-400" />
                            ) : (
                              <ChevronDown size={14} className="text-gray-400" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="border-t border-white/5 p-3">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="min-h-[120px] w-full rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingSection(null)
                                        setEditContent("")
                                      }}
                                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/10"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => updateSection(newsletter.id, section.id, editContent)}
                                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/80"
                                    >
                                      <Save size={12} />
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <pre className="mb-2 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-gray-400">
                                    {section.content}
                                  </pre>
                                  {newsletter.status !== "sent" && (
                                    <button
                                      onClick={() => {
                                        setEditingSection(`${newsletter.id}-${section.id}`)
                                        setEditContent(section.content)
                                      }}
                                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary"
                                    >
                                      <Edit3 size={12} />
                                      Edit section
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
