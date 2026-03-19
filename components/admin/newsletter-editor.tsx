"use client"

import { useState, useEffect, useCallback } from "react"
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
  Users,
  Mail,
  UserCheck,
  History,
  Eye,
  Search,
} from "lucide-react"

// Types
type AudienceType = "ALL_USERS" | "SUBSCRIBERS" | "SELECTED"
type TabType = "edit" | "send"

interface NewsletterSection {
  id: string
  title: string
  type: string
  content: string
  articles?: Array<{
    title: string
    summary: string
    sourceUrl: string
    sourceName: string
    imageUrl?: string
  }>
  order: number
}

interface DeliveryHistoryEntry {
  sentAt: string
  audienceType: AudienceType
  totalRecipients: number
  delivered: number
  failed: number
}

interface Newsletter {
  id: string
  newsletterId: string
  newsletterNumber: number
  subject: string
  date: string
  status: string
  sections: NewsletterSection[]
  aiToolOfTheDay?: {
    name: string
    description: string
    url: string
    imageUrl?: string
  }
  audienceType: AudienceType
  selectedUsers: string[]
  generatedAt: string
  scheduledTime?: string | null
  sentAt?: string | null
  deliveryStats?: {
    totalRecipients: number
    delivered: number
    failed: number
    pending: number
  }
  deliveryHistory: DeliveryHistoryEntry[]
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

interface User {
  id: string
  email: string
  displayName: string
  newsletterSubscribed: boolean
}

const SECTION_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  top_story: TrendingUp,
  ai_breakthroughs: Sparkles,
  startup_radar: Rocket,
  product_launches: Package,
  market_pulse: BarChart3,
  ai_tool: Wrench,
  quick_bytes: Zap,
  developer_insight: Code,
}

const SECTION_LABELS: Record<string, string> = {
  top_story: "Top Story",
  ai_breakthroughs: "AI Breakthroughs",
  startup_radar: "Startup Radar",
  product_launches: "Product Launches",
  market_pulse: "Market Pulse",
  ai_tool: "AI Tool of the Day",
  quick_bytes: "Quick Bytes",
  developer_insight: "Developer Insight",
}

const AUDIENCE_OPTIONS = [
  { value: "SUBSCRIBERS" as AudienceType, label: "Newsletter Subscribers", icon: Mail, description: "Users who opted in for newsletters" },
  { value: "ALL_USERS" as AudienceType, label: "All Users", icon: Users, description: "Every registered user" },
  { value: "SELECTED" as AudienceType, label: "Selected Users", icon: UserCheck, description: "Manually selected users" },
]

export function NewsletterEditor() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [aiTools, setAiTools] = useState<AITool[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("edit")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showToolManager, setShowToolManager] = useState(false)
  const [selectedToolForNewsletter, setSelectedToolForNewsletter] = useState<string | null>(null)
  
  // Edit state
  const [editingSubject, setEditingSubject] = useState(false)
  const [subjectDraft, setSubjectDraft] = useState("")
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [sectionDraft, setSectionDraft] = useState("")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  
  // Audience selection state
  const [audienceType, setAudienceType] = useState<AudienceType>("SUBSCRIBERS")
  const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [showUserSelector, setShowUserSelector] = useState(false)
  
  // Schedule state
  const [scheduling, setScheduling] = useState(false)
  const [scheduleTime, setScheduleTime] = useState("")
  
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
    loadUsers()
  }, [])

  // Sync audience state when newsletter is selected
  useEffect(() => {
    if (selectedNewsletter) {
      setAudienceType(selectedNewsletter.audienceType || "SUBSCRIBERS")
      setSelectedUserEmails(selectedNewsletter.selectedUsers || [])
    }
  }, [selectedNewsletter])

  const loadNewsletters = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/newsletter")
      const data = await res.json()
      if (data.newsletters) {
        const mappedNewsletters = data.newsletters.map((n: any) => ({
          ...n,
          aiToolOfTheDay: n.aiToolOfTheDay || null,
          audienceType: n.audienceType || "SUBSCRIBERS",
          selectedUsers: n.selectedUsers || [],
          deliveryHistory: n.deliveryHistory || [],
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

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/newsletter-subscribers?all=true")
      const data = await res.json()
      if (data.users) {
        setAllUsers(data.users)
      }
    } catch (err) {
      console.error("Failed to load users:", err)
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
      setSuccess("Newsletter generated successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate newsletter")
    } finally {
      setGenerating(false)
    }
  }

  const saveNewsletter = useCallback(async (updates: Partial<Newsletter>) => {
    if (!selectedNewsletter) return
    
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletterId: selectedNewsletter.id,
          ...updates,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to save newsletter")
      }
      await loadNewsletters()
      // Re-select the updated newsletter
      const updated = newsletters.find(n => n.id === selectedNewsletter.id)
      if (updated) {
        setSelectedNewsletter({ ...updated, ...updates } as Newsletter)
      }
      setSuccess("Changes saved!")
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save newsletter")
    } finally {
      setSaving(false)
    }
  }, [selectedNewsletter, newsletters])

  const sendNewsletter = async () => {
    if (!selectedNewsletter) return
    
    const recipientCount = audienceType === "SELECTED" 
      ? selectedUserEmails.length 
      : audienceType === "ALL_USERS"
        ? allUsers.length
        : allUsers.filter(u => u.newsletterSubscribed).length

    if (recipientCount === 0) {
      setError("No recipients found for selected audience")
      return
    }

    if (!confirm(`Send newsletter to ${recipientCount} ${audienceType === "SELECTED" ? "selected" : audienceType === "ALL_USERS" ? "all" : "subscribed"} users?`)) {
      return
    }

    setSending(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletterId: selectedNewsletter.id,
          audienceType,
          selectedUsers: selectedUserEmails,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to send newsletter")
      }
      await loadNewsletters()
      setSuccess(`Newsletter sent to ${data.stats?.delivered || 0} recipients!`)
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send newsletter")
    } finally {
      setSending(false)
    }
  }

  const scheduleNewsletter = async () => {
    if (!selectedNewsletter || !scheduleTime) {
      setError("Please select a scheduled time")
      return
    }
    
    await saveNewsletter({
      scheduledTime: new Date(scheduleTime).toISOString(),
      status: "scheduled",
      audienceType,
      selectedUsers: selectedUserEmails,
    })
    setScheduling(false)
    setScheduleTime("")
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

  const toggleUserSelection = (email: string) => {
    setSelectedUserEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    )
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: React.ReactNode; text: string; className: string }> = {
      sent: { icon: <CheckCircle size={12} />, text: "Delivered", className: "bg-emerald-500/20 text-emerald-400" },
      sending: { icon: <Loader2 size={12} className="animate-spin" />, text: "Sending", className: "bg-blue-500/20 text-blue-400" },
      scheduled: { icon: <Clock size={12} />, text: "Scheduled", className: "bg-purple-500/20 text-purple-400" },
      failed: { icon: <XCircle size={12} />, text: "Failed", className: "bg-red-500/20 text-red-400" },
      draft: { icon: <FileText size={12} />, text: "Draft", className: "bg-gray-500/20 text-gray-400" },
    }
    const config = configs[status] || configs.draft
    return (
      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.text}
      </span>
    )
  }

  const filteredUsers = allUsers.filter(user => 
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(userSearchQuery.toLowerCase())
  )

  const getEstimatedRecipients = () => {
    switch (audienceType) {
      case "ALL_USERS":
        return allUsers.length
      case "SELECTED":
        return selectedUserEmails.length
      case "SUBSCRIBERS":
      default:
        return allUsers.filter(u => u.newsletterSubscribed).length
    }
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
          <p className="flex-1 text-sm text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X size={16} />
          </button>
        </div>
      )}
      
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <CheckCircle size={18} className="mt-0.5 shrink-0 text-emerald-400" />
          <p className="flex-1 text-sm text-emerald-300">{success}</p>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-300">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Newsletter Intelligence</h3>
          <p className="text-sm text-gray-400">Generate, edit, and send AI-powered newsletters</p>
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
            <button onClick={() => setShowToolManager(false)} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
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
                placeholder="Image URL"
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
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {aiTools.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">No AI tools added yet</p>
            ) : (
              aiTools.map((tool) => (
                <div key={tool.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
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
                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
                      <ExternalLink size={14} />
                    </a>
                    <button onClick={() => deleteAiTool(tool.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400">
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

      {/* Main content area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Newsletter list */}
        <div className="lg:col-span-1">
          <h4 className="mb-3 font-medium text-white">Newsletters</h4>
          <div className="max-h-[600px] space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : newsletters.length === 0 ? (
              <div className="py-8 text-center">
                <FileText size={24} className="mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-400">No newsletters yet</p>
              </div>
            ) : (
              newsletters.map((newsletter) => (
                <button
                  key={newsletter.id}
                  onClick={() => {
                    setSelectedNewsletter(newsletter)
                    setActiveTab("edit")
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    selectedNewsletter?.id === newsletter.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{newsletter.newsletterId}</p>
                      <p className="truncate text-xs text-gray-500">{newsletter.date}</p>
                    </div>
                    {getStatusBadge(newsletter.status)}
                  </div>
                  {newsletter.deliveryHistory?.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <History size={10} />
                      {newsletter.deliveryHistory.length} send{newsletter.deliveryHistory.length > 1 ? "s" : ""}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Newsletter detail panel */}
        <div className="lg:col-span-2">
          {selectedNewsletter ? (
            <div className="rounded-xl border border-white/10 bg-white/5">
              {/* Newsletter header */}
              <div className="border-b border-white/10 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{selectedNewsletter.newsletterId}</h4>
                    <p className="text-sm text-gray-400">{selectedNewsletter.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedNewsletter.status)}
                    <button
                      onClick={() => setSelectedNewsletter(null)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "edit"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => setActiveTab("send")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "send"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Send size={14} />
                  Send Control
                </button>
              </div>

              {/* Tab content */}
              <div className="max-h-[500px] overflow-y-auto p-4">
                {activeTab === "edit" ? (
                  <div className="space-y-4">
                    {/* Subject editor */}
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium uppercase tracking-wider text-gray-500">Subject</label>
                        {!editingSubject && (
                          <button
                            onClick={() => {
                              setEditingSubject(true)
                              setSubjectDraft(selectedNewsletter.subject)
                            }}
                            className="text-xs text-gray-500 hover:text-primary"
                          >
                            <Edit3 size={12} />
                          </button>
                        )}
                      </div>
                      {editingSubject ? (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            value={subjectDraft}
                            onChange={(e) => setSubjectDraft(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingSubject(false)}
                              className="rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:bg-white/10"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                saveNewsletter({ subject: subjectDraft })
                                setEditingSubject(false)
                              }}
                              disabled={saving}
                              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/80 disabled:opacity-50"
                            >
                              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-white">{selectedNewsletter.subject}</p>
                      )}
                    </div>

                    {/* AI Tool display */}
                    {selectedNewsletter.aiToolOfTheDay && (
                      <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-purple-400">
                          <Wrench size={12} />
                          AI Tool of the Day
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          {selectedNewsletter.aiToolOfTheDay.imageUrl && (
                            <img
                              src={selectedNewsletter.aiToolOfTheDay.imageUrl}
                              alt={selectedNewsletter.aiToolOfTheDay.name}
                              className="h-10 w-10 rounded-lg object-cover"
                              onError={(e) => { e.currentTarget.style.display = "none" }}
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white">{selectedNewsletter.aiToolOfTheDay.name}</p>
                            <p className="truncate text-xs text-gray-400">{selectedNewsletter.aiToolOfTheDay.description}</p>
                          </div>
                          <a
                            href={selectedNewsletter.aiToolOfTheDay.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-purple-500/20 p-2 text-purple-400 hover:bg-purple-500/30"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Sections editor */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium uppercase tracking-wider text-gray-500">Sections</h5>
                      {selectedNewsletter.sections?.map((section) => {
                        const Icon = SECTION_ICONS[section.id] || SECTION_ICONS[section.type] || FileText
                        const isExpanded = expandedSections.has(section.id)
                        const isEditing = editingSection === section.id

                        return (
                          <div key={section.id} className="rounded-lg border border-white/5 bg-black/20">
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="flex w-full items-center justify-between p-3 text-left"
                            >
                              <div className="flex items-center gap-2">
                                <Icon size={14} className="text-primary" />
                                <span className="text-sm font-medium text-white">
                                  {SECTION_LABELS[section.id] || SECTION_LABELS[section.type] || section.title}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({section.articles?.length || 0} articles)
                                </span>
                              </div>
                              {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                            </button>

                            {isExpanded && (
                              <div className="border-t border-white/5 p-3">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={sectionDraft}
                                      onChange={(e) => setSectionDraft(e.target.value)}
                                      className="min-h-[120px] w-full rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-sm text-white focus:border-primary/50 focus:outline-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setEditingSection(null)}
                                        className="rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:bg-white/10"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          const updatedSections = selectedNewsletter.sections.map(s =>
                                            s.id === section.id ? { ...s, content: sectionDraft } : s
                                          )
                                          saveNewsletter({ sections: updatedSections })
                                          setEditingSection(null)
                                        }}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/80 disabled:opacity-50"
                                      >
                                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <pre className="mb-2 max-h-32 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-gray-400">
                                      {section.content}
                                    </pre>
                                    <button
                                      onClick={() => {
                                        setEditingSection(section.id)
                                        setSectionDraft(section.content)
                                      }}
                                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary"
                                    >
                                      <Edit3 size={12} />
                                      Edit section
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Audience selection */}
                    <div>
                      <h5 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Select Audience</h5>
                      <div className="space-y-2">
                        {AUDIENCE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setAudienceType(option.value)}
                            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                              audienceType === option.value
                                ? "border-primary/50 bg-primary/10"
                                : "border-white/10 bg-black/20 hover:border-white/20"
                            }`}
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              audienceType === option.value ? "bg-primary/20" : "bg-white/10"
                            }`}>
                              <option.icon size={16} className={audienceType === option.value ? "text-primary" : "text-gray-400"} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{option.label}</p>
                              <p className="text-xs text-gray-500">{option.description}</p>
                            </div>
                            <div className={`h-4 w-4 rounded-full border-2 ${
                              audienceType === option.value
                                ? "border-primary bg-primary"
                                : "border-gray-600"
                            }`}>
                              {audienceType === option.value && (
                                <Check size={10} className="text-white" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* User selector for SELECTED audience */}
                    {audienceType === "SELECTED" && (
                      <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                        <div className="mb-3 flex items-center justify-between">
                          <h5 className="text-xs font-medium uppercase tracking-wider text-gray-500">Select Users</h5>
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                            {selectedUserEmails.length} selected
                          </span>
                        </div>
                        <div className="relative mb-3">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                        <div className="max-h-48 space-y-1 overflow-y-auto">
                          {filteredUsers.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => toggleUserSelection(user.email)}
                              className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
                                selectedUserEmails.includes(user.email)
                                  ? "bg-primary/10"
                                  : "hover:bg-white/5"
                              }`}
                            >
                              <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                                selectedUserEmails.includes(user.email)
                                  ? "border-primary bg-primary"
                                  : "border-gray-600"
                              }`}>
                                {selectedUserEmails.includes(user.email) && <Check size={12} className="text-white" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm text-white">{user.displayName || user.email}</p>
                                <p className="truncate text-xs text-gray-500">{user.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Estimated recipients */}
                    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Estimated Recipients</span>
                        <span className="text-2xl font-bold text-white">{getEstimatedRecipients()}</span>
                      </div>
                    </div>

                    {/* Send actions */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={sendNewsletter}
                        disabled={sending || getEstimatedRecipients() === 0}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/80 disabled:opacity-50"
                      >
                        {sending ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Send Newsletter
                          </>
                        )}
                      </button>
                      {!scheduling ? (
                        <button
                          onClick={() => setScheduling(true)}
                          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/10"
                        >
                          <Calendar size={16} />
                          Schedule
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="datetime-local"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none"
                          />
                          <button
                            onClick={scheduleNewsletter}
                            className="rounded-lg bg-purple-500 px-3 py-2 text-sm font-medium text-white hover:bg-purple-600"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setScheduling(false)
                              setScheduleTime("")
                            }}
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Delivery history */}
                    {selectedNewsletter.deliveryHistory?.length > 0 && (
                      <div>
                        <h5 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                          <History size={12} />
                          Delivery History
                        </h5>
                        <div className="space-y-2">
                          {selectedNewsletter.deliveryHistory.map((entry, index) => (
                            <div key={index} className="rounded-lg border border-white/10 bg-black/20 p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CheckCircle size={14} className="text-emerald-400" />
                                  <span className="text-sm text-white">
                                    {entry.audienceType === "ALL_USERS" ? "All Users" : entry.audienceType === "SELECTED" ? "Selected Users" : "Subscribers"}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(entry.sentAt).toLocaleString()}
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                  <p className="font-bold text-white">{entry.totalRecipients}</p>
                                  <p className="text-gray-500">Total</p>
                                </div>
                                <div>
                                  <p className="font-bold text-emerald-400">{entry.delivered}</p>
                                  <p className="text-gray-500">Delivered</p>
                                </div>
                                <div>
                                  <p className="font-bold text-red-400">{entry.failed}</p>
                                  <p className="text-gray-500">Failed</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Current delivery stats */}
                    {selectedNewsletter.deliveryStats && selectedNewsletter.deliveryStats.totalRecipients > 0 && (
                      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                        <h5 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Latest Delivery Stats</h5>
                        <div className="grid grid-cols-4 gap-3 text-center">
                          <div>
                            <p className="text-xl font-bold text-white">{selectedNewsletter.deliveryStats.totalRecipients}</p>
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-emerald-400">{selectedNewsletter.deliveryStats.delivered}</p>
                            <p className="text-xs text-gray-500">Delivered</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-red-400">{selectedNewsletter.deliveryStats.failed}</p>
                            <p className="text-xs text-gray-500">Failed</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-blue-400">{selectedNewsletter.deliveryStats.pending}</p>
                            <p className="text-xs text-gray-500">Pending</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-[500px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <div className="text-center">
                <Eye size={32} className="mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400">Select a newsletter to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
