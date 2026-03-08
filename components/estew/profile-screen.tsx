"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getActivitiesByDate, getActivityDates, type Activity, type ActivityPage } from "@/lib/activity-service"
import { createSubscription, getUserSubscription, type UserSubscription } from "@/lib/subscription-service"
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore"
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
  Zap,
  Shield,
  Search,
  Newspaper,
  Calendar,
  ChevronLeft,
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
  { icon: User, label: "Your Profile", action: "profile" },
  { icon: Heart, label: "Followed Topics", action: "topics" },
]

const appSettings = [
  { icon: Bell, label: "Notifications", action: "notifications" },
  { icon: CreditCard, label: "Plan & Billing", action: "billing" },
  { icon: Mail, label: "Newsletter", action: "newsletter" },
  { icon: Clock, label: "Activity History", action: "history" },
]

// Plan features
const FREE_FEATURES = [
  { icon: Newspaper, text: "20 articles per day" },
  { icon: Search, text: "Basic search" },
  { icon: Bookmark, text: "Save up to 10 articles" },
]

const PRO_FEATURES = [
  { icon: Newspaper, text: "Unlimited articles" },
  { icon: Sparkles, text: "AI-powered summaries" },
  { icon: Search, text: "Advanced search & filters" },
  { icon: Bookmark, text: "Unlimited saved articles" },
  { icon: Zap, text: "Priority breaking alerts" },
  { icon: Shield, text: "Ad-free experience" },
  { icon: Mail, text: "Extended newsletters" },
]

export function ProfileScreen() {
  const { user, profile, signOut, updateDisplayName, updatePhotoURL, saveProfile, usage } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [saving, setSaving] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [showNewsletterModal, setShowNewsletterModal] = useState(false)
  const [savingNewsletter, setSavingNewsletter] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activityDates, setActivityDates] = useState<Set<string>>(new Set())
  const [lastActivityDoc, setLastActivityDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMoreActivities, setHasMoreActivities] = useState(false)
  const [subscriptionDetails, setSubscriptionDetails] = useState<UserSubscription | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Derived state - must be declared before useEffects that depend on it
  const displayName = profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Guest"
  const email = user?.email || "Not signed in"
  const initial = displayName.charAt(0).toUpperCase()
  const photoURL = profile?.photoURL || user?.photoURL
  const isPro = profile?.plan === "pro"

  // Load activity dates when modal opens
  useEffect(() => {
    if (showActivityModal && user) {
      getActivityDates(user.uid)
        .then(setActivityDates)
        .catch((err) => console.error("Failed to load activity dates:", err))
    }
  }, [showActivityModal, user])

  // Load activities for selected date
  useEffect(() => {
    if (showActivityModal && user && selectedDate) {
      setLoadingActivities(true)
      setActivities([])
      setLastActivityDoc(null)
      
      getActivitiesByDate(user.uid, selectedDate, 10)
        .then((result: ActivityPage) => {
          setActivities(result.activities)
          setLastActivityDoc(result.lastDoc)
          setHasMoreActivities(result.hasMore)
        })
        .catch((err) => console.error("Failed to load activities:", err))
        .finally(() => setLoadingActivities(false))
    }
  }, [showActivityModal, user, selectedDate])

  // Load more activities
  const loadMoreActivities = async () => {
    if (!user || !lastActivityDoc || loadingMore) return
    
    setLoadingMore(true)
    try {
      const result = await getActivitiesByDate(user.uid, selectedDate, 10, lastActivityDoc)
      setActivities((prev) => [...prev, ...result.activities])
      setLastActivityDoc(result.lastDoc)
      setHasMoreActivities(result.hasMore)
    } catch (err) {
      console.error("Failed to load more activities:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  // Load subscription details when billing modal opens
  useEffect(() => {
    if (showBillingModal && user && isPro) {
      getUserSubscription(user.uid)
        .then(setSubscriptionDetails)
        .catch((err) => console.error("Failed to load subscription:", err))
    }
  }, [showBillingModal, user, isPro])

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
      console.error("Error updating name:", err)
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

    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string
      try {
        await updatePhotoURL(dataUrl)
      } catch (err) {
        console.error("Error uploading photo:", err)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSettingClick = (action: string) => {
    if (action === "billing") {
      setShowBillingModal(true)
    } else if (action === "newsletter") {
      setShowNewsletterModal(true)
    } else if (action === "history") {
      setShowActivityModal(true)
    }
    // Other actions can be implemented later
  }

  const handleToggleNewsletter = async () => {
    setSavingNewsletter(true)
    try {
      await saveProfile({ newsletterSubscribed: !profile?.newsletterSubscribed })
    } catch (err) {
      console.error("Error toggling newsletter:", err)
    } finally {
      setSavingNewsletter(false)
    }
  }

  const handleUpgradeToPro = async () => {
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!razorpayKey) {
      alert("Payment not configured. Please add Razorpay API keys.")
      return
    }

    setProcessingPayment(true)

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
      amount: 59900,
      currency: "INR",
      name: "Estew Pro",
      description: "Unlimited articles, AI summaries, priority alerts",
      handler: async function (response) {
        if (response.razorpay_payment_id && user) {
          // Create subscription record in database (with user info for subscribed_users table)
          await createSubscription(
            user.uid,
            response.razorpay_payment_id,
            undefined,
            user.email || undefined,
            displayName
          )
          // Update local profile
          await saveProfile({ plan: "pro" })
          setShowBillingModal(false)
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
        <div className="relative h-6 w-6">
          <Image src="/images/logo.png" alt="Estew" fill className="object-contain dark:invert" />
        </div>
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
        <button 
          onClick={() => setShowBillingModal(true)}
          className="mt-2"
        >
          <span className={`rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider transition-colors ${
            isPro 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}>
            {isPro ? "Pro" : "Free"} Plan
          </span>
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="mx-5 mb-6 flex items-center justify-around rounded-xl border border-border bg-card py-4"
      >
        {[
          { icon: BookOpen, value: usage.isUnlimited ? "∞" : `${usage.articlesUsed}/${usage.articlesLimit}`, label: "Today" },
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

      {/* Usage Progress - only for free users */}
      {!isPro && !usage.isUnlimited && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="mx-5 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[12px] font-medium text-foreground">Daily Article Limit</span>
            <span className="font-sans text-[12px] text-muted-foreground">
              {usage.articlesUsed} of {usage.articlesLimit} used
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min((usage.articlesUsed / usage.articlesLimit) * 100, 100)}%` }}
            />
          </div>
          {usage.articlesUsed >= usage.articlesLimit * 0.8 && (
            <p className="mt-2 font-sans text-[11px] text-amber-500">
              You are running low on daily reads. Upgrade for unlimited access.
            </p>
          )}
        </motion.div>
      )}

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
            Unlimited articles, AI summaries, advanced search. Rs 599/month.
          </p>
          <button 
            onClick={() => setShowBillingModal(true)}
            className="mt-4 rounded-full bg-primary px-6 py-2.5 font-sans text-[14px] font-semibold text-primary-foreground transition-transform active:scale-[0.97]"
          >
            View Plans
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
            <button 
              key={item.label} 
              onClick={() => handleSettingClick(item.action)}
              className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 transition-colors last:border-0 active:bg-muted/40"
            >
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
            <button 
              key={item.label} 
              onClick={() => handleSettingClick(item.action)}
              className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 transition-colors last:border-0 active:bg-muted/40"
            >
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

      {/* Plan & Billing Modal */}
      <AnimatePresence>
        {showBillingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowBillingModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[428px] rounded-t-3xl bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              </div>

              <div className="max-h-[80vh] overflow-y-auto px-5 pb-8">
                <h2 className="mb-1 font-serif text-2xl font-bold text-foreground">Plan & Billing</h2>
                <p className="mb-6 font-sans text-[14px] text-muted-foreground">
                  {isPro ? "You're currently on the Pro plan" : "Choose the plan that's right for you"}
                </p>

                {/* Pro Subscription Details */}
                {isPro && subscriptionDetails && (
                  <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <h3 className="mb-3 font-sans text-[14px] font-semibold text-foreground">Subscription Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[13px] text-muted-foreground">Status</span>
                        <span className={`rounded-full px-2 py-0.5 font-sans text-[11px] font-medium ${
                          subscriptionDetails.subscriptionStatus === "active" 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {subscriptionDetails.subscriptionStatus || "Active"}
                        </span>
                      </div>
                      {subscriptionDetails.renewalDate && (
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[13px] text-muted-foreground">Next Renewal</span>
                          <span className="font-sans text-[13px] text-foreground">
                            {new Date(subscriptionDetails.renewalDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      {subscriptionDetails.daysRemaining !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[13px] text-muted-foreground">Days Remaining</span>
                          <span className="font-sans text-[13px] font-medium text-primary">
                            {subscriptionDetails.daysRemaining} days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Free Plan */}
                <div className={`mb-4 rounded-xl border p-5 ${!isPro ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-foreground">Free</h3>
                      <p className="font-sans text-[24px] font-bold text-foreground">
                        Rs 0<span className="text-[14px] font-normal text-muted-foreground">/month</span>
                      </p>
                    </div>
                    {!isPro && (
                      <span className="rounded-full bg-primary px-3 py-1 font-sans text-[10px] font-bold uppercase text-primary-foreground">
                        Current
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {FREE_FEATURES.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <feature.icon size={14} strokeWidth={1.5} className="text-muted-foreground" />
                        <span className="font-sans text-[13px] text-muted-foreground">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro Plan */}
                <div className={`rounded-xl border p-5 ${isPro ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-foreground">Pro</h3>
                        <Sparkles size={14} className="text-amber-500" />
                      </div>
                      <p className="font-sans text-[24px] font-bold text-foreground">
                        Rs 599<span className="text-[14px] font-normal text-muted-foreground">/month</span>
                      </p>
                    </div>
                    {isPro && (
                      <span className="rounded-full bg-primary px-3 py-1 font-sans text-[10px] font-bold uppercase text-primary-foreground">
                        Current
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {PRO_FEATURES.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <feature.icon size={14} strokeWidth={1.5} className="text-primary" />
                        <span className="font-sans text-[13px] text-foreground">{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  {!isPro && (
                    <button
                      onClick={handleUpgradeToPro}
                      disabled={processingPayment}
                      className="mt-4 w-full rounded-full bg-primary py-3 font-sans text-[14px] font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
                    >
                      {processingPayment ? "Processing..." : "Upgrade to Pro"}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowBillingModal(false)}
                  className="mt-6 w-full rounded-xl border border-border py-3 font-sans text-[14px] font-medium text-muted-foreground transition-colors active:bg-muted/40"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Newsletter Modal */}
      <AnimatePresence>
        {showNewsletterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewsletterModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[428px] rounded-t-3xl bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              </div>

              <div className="px-5 pb-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto">
                  <Mail size={24} className="text-primary" />
                </div>
                <h2 className="text-center font-serif text-2xl font-bold text-foreground mb-2">
                  Newsletter
                </h2>
                <p className="text-center font-sans text-[14px] text-muted-foreground mb-6">
                  Get a daily digest of the top tech news, curated by AI and delivered to your inbox.
                </p>

                {/* Current status */}
                <div className="rounded-xl border border-border bg-card p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-sans text-[14px] font-semibold text-foreground">Daily Newsletter</p>
                      <p className="font-sans text-[12px] text-muted-foreground">
                        {profile?.newsletterSubscribed ? "You're subscribed" : "You're not subscribed"}
                      </p>
                    </div>
                    <div 
                      className={`h-6 w-11 rounded-full p-0.5 cursor-pointer transition-colors ${
                        profile?.newsletterSubscribed ? "bg-primary" : "bg-muted"
                      }`}
                      onClick={handleToggleNewsletter}
                    >
                      <div 
                        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          profile?.newsletterSubscribed ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Newsletter benefits */}
                <div className="rounded-xl border border-border bg-card p-4 mb-6">
                  <h3 className="font-sans text-[13px] font-semibold text-foreground mb-3">What you'll get:</h3>
                  <ul className="space-y-2">
                    {[
                      "Top 5 stories of the day",
                      "AI-generated summaries",
                      "Personalized based on your interests",
                      "Delivered every morning at 8 AM",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check size={14} strokeWidth={2} className="text-primary" />
                        <span className="font-sans text-[13px] text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleToggleNewsletter}
                  disabled={savingNewsletter}
                  className={`w-full rounded-full py-3 font-sans text-[14px] font-semibold transition-transform active:scale-[0.98] disabled:opacity-50 ${
                    profile?.newsletterSubscribed
                      ? "border border-border bg-card text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {savingNewsletter 
                    ? "Saving..." 
                    : profile?.newsletterSubscribed 
                      ? "Unsubscribe" 
                      : "Subscribe to Newsletter"
                  }
                </button>

                <button
                  onClick={() => setShowNewsletterModal(false)}
                  className="mt-3 w-full rounded-xl border border-border py-3 font-sans text-[14px] font-medium text-muted-foreground transition-colors active:bg-muted/40"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity History Modal with Calendar */}
      <AnimatePresence>
        {showActivityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowActivityModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[428px] rounded-t-3xl bg-background"
              style={{ maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              </div>

              <div className="px-5 pb-8 overflow-y-auto" style={{ maxHeight: "calc(90vh - 40px)" }}>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto">
                  <Calendar size={24} className="text-primary" />
                </div>
                <h2 className="text-center font-serif text-2xl font-bold text-foreground mb-2">
                  Activity History
                </h2>
                <p className="text-center font-sans text-[14px] text-muted-foreground mb-4">
                  Select a date to view your reading history
                </p>

                {/* Calendar Date Picker */}
                <div className="mb-4 rounded-xl border border-border bg-card p-4">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate)
                        newDate.setMonth(newDate.getMonth() - 1)
                        setSelectedDate(newDate)
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
                    >
                      <ChevronLeft size={16} className="text-muted-foreground" />
                    </button>
                    <span className="font-sans text-[14px] font-semibold text-foreground">
                      {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate)
                        newDate.setMonth(newDate.getMonth() + 1)
                        if (newDate <= new Date()) {
                          setSelectedDate(newDate)
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
                    >
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </button>
                  </div>

                  {/* Day Labels */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div key={i} className="text-center font-sans text-[11px] text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const year = selectedDate.getFullYear()
                      const month = selectedDate.getMonth()
                      const firstDay = new Date(year, month, 1).getDay()
                      const daysInMonth = new Date(year, month + 1, 0).getDate()
                      const today = new Date()
                      const days = []

                      // Empty cells for days before first day
                      for (let i = 0; i < firstDay; i++) {
                        days.push(<div key={`empty-${i}`} className="h-8" />)
                      }

                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day)
                        const dateStr = date.toISOString().split("T")[0]
                        const hasActivity = activityDates.has(dateStr)
                        const isSelected = selectedDate.toDateString() === date.toDateString()
                        const isToday = today.toDateString() === date.toDateString()
                        const isFuture = date > today

                        days.push(
                          <button
                            key={day}
                            onClick={() => !isFuture && setSelectedDate(date)}
                            disabled={isFuture}
                            className={`h-8 w-8 rounded-full font-sans text-[12px] transition-colors relative ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : isToday
                                ? "bg-primary/20 text-primary"
                                : isFuture
                                ? "text-muted-foreground/30 cursor-not-allowed"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            {day}
                            {hasActivity && !isSelected && (
                              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                            )}
                          </button>
                        )
                      }

                      return days
                    })()}
                  </div>
                </div>

                {/* Selected Date Label */}
                <p className="mb-3 font-sans text-[13px] font-medium text-foreground">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                {/* Activity List */}
                <div className="max-h-[35vh] overflow-y-auto rounded-xl border border-border bg-card">
                  {loadingActivities ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="py-12 text-center">
                      <BookOpen size={32} className="mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-sans text-[14px] text-muted-foreground">
                        No articles read on this day
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {activities.map((activity) => (
                        <div key={activity.id} className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <BookOpen size={14} className="text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-sans text-[13px] font-medium text-foreground line-clamp-2">
                                {activity.articleTitle || "Unknown article"}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="font-sans text-[11px] text-muted-foreground">
                                  {activity.articleSource}
                                </span>
                                {activity.articleCategory && (
                                  <>
                                    <span className="text-[11px] text-muted-foreground/50">•</span>
                                    <span className="font-sans text-[11px] text-primary">
                                      {activity.articleCategory}
                                    </span>
                                  </>
                                )}
                              </div>
                              <p className="mt-1 font-sans text-[10px] text-muted-foreground/70">
                                {new Date(activity.timestamp).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Show More Button */}
                {hasMoreActivities && activities.length > 0 && (
                  <button
                    onClick={loadMoreActivities}
                    disabled={loadingMore}
                    className="mt-3 w-full rounded-xl bg-primary/10 py-2.5 font-sans text-[13px] font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Show More"}
                  </button>
                )}

                <button
                  onClick={() => setShowActivityModal(false)}
                  className="mt-4 w-full rounded-xl border border-border py-3 font-sans text-[14px] font-medium text-muted-foreground transition-colors active:bg-muted/40"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
