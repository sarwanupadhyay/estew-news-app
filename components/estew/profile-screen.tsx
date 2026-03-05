"use client"

import { mockUser } from "@/lib/mock-data"
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
  Settings,
  Monitor,
} from "lucide-react"
import { motion } from "framer-motion"

const accountSettings = [
  { icon: User, label: "Your Profile", color: "#0066FF" },
  { icon: Heart, label: "Followed Topics", color: "#EC4899" },
]

const appSettings = [
  { icon: Monitor, label: "Display Preference", color: "#8B5CF6" },
  { icon: Bell, label: "Notifications", color: "#F59E0B" },
  { icon: CreditCard, label: "Plan & Billing", color: "#10B981" },
  { icon: Mail, label: "Newsletter", color: "#3B82F6" },
  { icon: Clock, label: "Activity History", color: "#6B7280" },
  { icon: LogOut, label: "Logout", color: "#EF4444" },
]

export function ProfileScreen() {
  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Profile
        </h1>
        <button className="glass flex h-8 items-center gap-1.5 rounded-full px-3">
          <Settings size={14} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
          <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>Edit</span>
        </button>
      </div>

      {/* Avatar + info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center px-5 py-6"
      >
        <div
          className="mb-3 flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #0066FF, #4F46E5)",
            boxShadow: "0 4px 20px rgba(0, 102, 255, 0.3)",
          }}
        >
          <span className="font-serif text-2xl font-bold text-white">
            {mockUser.displayName.charAt(0)}
          </span>
        </div>
        <h2 className="font-serif text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          {mockUser.displayName}
        </h2>
        <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-muted)" }}>
          {mockUser.email}
        </p>
        {/* Plan badge */}
        <div className="mt-2">
          {mockUser.plan === "pro" ? (
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ background: "linear-gradient(135deg, #0066FF, #4F46E5)" }}
            >
              PRO
            </span>
          ) : (
            <span
              className="glass rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              FREE
            </span>
          )}
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass mx-5 mb-6 flex items-center justify-around py-4"
      >
        <div className="flex flex-col items-center gap-0.5">
          <BookOpen size={18} strokeWidth={1.5} style={{ color: "#0066FF" }} />
          <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{mockUser.articlesRead}</span>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Read</span>
        </div>
        <div className="h-8 w-px" style={{ background: "var(--glass-border)" }} />
        <div className="flex flex-col items-center gap-0.5">
          <Bookmark size={18} strokeWidth={1.5} style={{ color: "#0066FF" }} />
          <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{mockUser.articlesSaved}</span>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Saved</span>
        </div>
        <div className="h-8 w-px" style={{ background: "var(--glass-border)" }} />
        <div className="flex flex-col items-center gap-0.5">
          <Hash size={18} strokeWidth={1.5} style={{ color: "#0066FF" }} />
          <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{mockUser.topicsFollowed}</span>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Topics</span>
        </div>
      </motion.div>

      {/* Upgrade card (for free users) */}
      {mockUser.plan === "free" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mx-5 mb-6 overflow-hidden p-5"
          style={{
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.1))",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <h3 className="font-serif text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Unlock Pro Features
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Unlimited articles, extended newsletters, and advanced search for just $5.99/month.
          </p>
          <button
            className="spring-bounce mt-4 rounded-full px-6 py-2.5 text-[14px] font-semibold text-white active:scale-[0.97]"
            style={{ background: "#0066FF", boxShadow: "0 4px 20px rgba(0, 102, 255, 0.35)" }}
          >
            Upgrade to Pro
          </button>
        </motion.div>
      )}

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5"
      >
        <p className="mb-2 text-[12px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Account
        </p>
        <div className="glass overflow-hidden" style={{ borderRadius: 16 }}>
          {accountSettings.map((item, i) => (
            <button key={item.label} className="spring-smooth flex w-full items-center gap-3 px-4 py-3.5 active:bg-black/5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: `${item.color}20` }}
              >
                <item.icon size={16} strokeWidth={1.5} style={{ color: item.color }} />
              </div>
              <span className="flex-1 text-left text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>
                {item.label}
              </span>
              <ChevronRight size={16} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
            </button>
          ))}
        </div>
      </motion.div>

      {/* App Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 px-5"
      >
        <p className="mb-2 text-[12px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          App Settings
        </p>
        <div className="glass overflow-hidden" style={{ borderRadius: 16 }}>
          {appSettings.map((item) => (
            <button key={item.label} className="spring-smooth flex w-full items-center gap-3 px-4 py-3.5 active:bg-black/5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: `${item.color}20` }}
              >
                <item.icon size={16} strokeWidth={1.5} style={{ color: item.color }} />
              </div>
              <span
                className="flex-1 text-left text-[14px] font-medium"
                style={{ color: item.label === "Logout" ? "#EF4444" : "var(--text-primary)" }}
              >
                {item.label}
              </span>
              {item.label !== "Logout" && (
                <ChevronRight size={16} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Member since */}
      <p className="mt-6 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
        Member since September 2025
      </p>
    </div>
  )
}
