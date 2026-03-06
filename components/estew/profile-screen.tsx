"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  User,
  Heart,
  Bell,
  CreditCard,
  Mail,
  Clock,
  LogOut,
  ChevronRight,
  BookOpen,
  Bookmark,
  Hash,
  Camera,
  Check,
  X,
  Sparkles,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  handler: (response: { razorpay_payment_id: string }) => void
  prefill: { email: string }
  theme: { color: string }
}

interface RazorpayInstance {
  open: () => void
}

const accountSettings = [
  { icon: User, label: "Your Profile" },
  { icon: Heart, label: "Followed Topics" },
]

const appSettings = [
  { icon: Bell, label: "Notifications" },
  { icon: CreditCard, label: "Plan & Billing" },
  { icon: Mail, label: "Newsletter" },
  { icon: Clock, label: "Activity History" },
]

export function ProfileScreen() {
  const { user, profile, signOut, updateDisplayName, updatePhotoURL, saveProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [saving, setSaving] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayName = profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Guest"
  const email = user?.email || "Not signed in"
  const initial = displayName.charAt(0).toUpperCase()
  const photoURL = profile?.photoURL || user?.photoURL
  const isPro = profile?.plan === "pro"

  const handleLogout = async () => {
    await signOut()
  }

  const handleEditStart = () => {
    setEditName(displayName)
    setIsEditing(true)
  }

  const handleEditSave = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      await updateDisplayName(editName.trim())
      setIsEditing(false)
    } catch (err) {
      console.error("[v0] Error updating name:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditName("")
  }

  const handlePhotoUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Convert to base64 data URL (for demo - in production use Firebase Storage)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string
      try {
        await updatePhotoURL(dataUrl)
      } catch (err) {
        console.error("[v0] Error uploading photo:", err)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUpgradeToPro = async () => {
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!razorpayKey) {
      alert("Payment not configured. Please add Razorpay API keys.")
      return
    }

    setProcessingPayment(true)

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      document.body.appendChild(script)
      await new Promise((resolve) => {
        script.onload = resolve
      })
    }

    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: 59900, // Rs 599 in paise
      currency: "INR",
      name: "Estew Pro",
      description: "Unlimited articles, AI summaries, priority alerts",
      handler: async function (response) {
        if (response.razorpay_payment_id) {
          await saveProfile({ plan: "pro" })
        }
        setProcessingPayment(false)
      },
      prefill: {
        email: user?.email || "",
      },
      theme: {
        color: "#0066FF",
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
    setProcessingPayment(false)
  }

  return (
    <div className="flex flex-col pb-20">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 pb-3 pt-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <Image src="/images/logo.png" alt="Estew" width={24} height={24} className="dark:invert" />
        <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">Profile</h1>
      </div>

      {/* Avatar + info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center px-5 py-8"
      >
        <div className="relative mb-3">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="h-20 w-20 rounded-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
              <span className="font-serif text-2xl font-bold text-primary-foreground">
                {initial}
              </span>
            </div>
          )}
          <button
            onClick={handlePhotoUpload}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary transition-transform active:scale-90"
          >
            <Camera size={14} strokeWidth={1.5} className="text-primary-foreground" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-40 rounded-lg border border-border bg-input px-3 py-1.5 text-center font-serif text-xl font-bold text-foreground focus:border-primary focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary transition-transform active:scale-90 disabled:opacity-50"
              >
                <Check size={14} strokeWidth={2} className="text-primary-foreground" />
              </button>
              <button
                onClick={handleEditCancel}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-transform active:scale-90"
              >
                <X size={14} strokeWidth={2} className="text-muted-foreground" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="display"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={handleEditStart}
              className="font-serif text-xl font-bold text-foreground transition-colors hover:text-primary"
            >
              {displayName}
            </motion.button>
          )}
        </AnimatePresence>

        <p className="mt-0.5 font-sans text-[13px] text-muted-foreground">
          {email}
        </p>
        <div className="mt-2">
          <span className={`rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${
            isPro 
              ? "bg-primary/10 text-primary" 
              : "bg-muted text-muted-foreground"
          }`}>
            {isPro ? "Pro" : "Free"}
          </span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="mx-5 mb-6 flex items-center justify-around rounded-xl border border-border bg-card py-4"
      >
        {[
          { icon: BookOpen, value: 0, label: "Read" },
          { icon: Bookmark, value: profile?.savedArticles?.length || 0, label: "Saved" },
          { icon: Hash, value: profile?.topics?.length || 0, label: "Topics" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-0.5">
            <stat.icon size={16} strokeWidth={1.5} className="text-primary" />
            <span className="font-sans text-lg font-bold text-foreground">{stat.value}</span>
            <span className="font-sans text-[10px] text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Upgrade CTA - only show for free users */}
      {!isPro && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-5 mb-6 rounded-xl p-5"
          style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <h3 className="font-serif text-lg font-bold text-foreground">Unlock Pro</h3>
          </div>
          <p className="mt-1 font-sans text-[13px] leading-relaxed text-muted-foreground">
            Unlimited articles, extended newsletters, advanced search. Rs 599/month.
          </p>
          <button 
            onClick={handleUpgradeToPro}
            disabled={processingPayment}
            className="mt-4 rounded-full bg-primary px-6 py-2.5 font-sans text-[14px] font-semibold text-primary-foreground transition-transform active:scale-[0.97] disabled:opacity-50"
          >
            {processingPayment ? "Processing..." : "Upgrade to Pro"}
          </button>
        </motion.div>
      )}

      {/* Pro badge for pro users */}
      {isPro && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-5 mb-6 rounded-xl border border-primary/20 bg-primary/5 p-5"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">Pro Member</h3>
          </div>
          <p className="mt-1 font-sans text-[13px] leading-relaxed text-muted-foreground">
            Enjoying unlimited articles, AI summaries, and priority alerts.
          </p>
        </motion.div>
      )}

      {/* Account Settings */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="px-5">
        <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </p>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {accountSettings.map((item) => (
            <button key={item.label} className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 transition-colors last:border-0 active:bg-muted/40">
              <item.icon size={16} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="flex-1 text-left font-sans text-[14px] text-foreground">{item.label}</span>
              <ChevronRight size={14} strokeWidth={1.5} className="text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* App Settings */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-6 px-5">
        <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Settings
        </p>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {appSettings.map((item) => (
            <button key={item.label} className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 transition-colors last:border-0 active:bg-muted/40">
              <item.icon size={16} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="flex-1 text-left font-sans text-[14px] text-foreground">{item.label}</span>
              <ChevronRight size={14} strokeWidth={1.5} className="text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Logout */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mt-6 px-5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 py-3.5 font-sans text-[14px] font-semibold text-destructive transition-colors active:bg-destructive/10"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign Out
          </button>
        </motion.div>
      )}

      <p className="mt-6 text-center font-sans text-[11px] text-muted-foreground/60">
        {user ? `Signed in as ${email}` : "Guest mode"}
      </p>
    </div>
  )
}
