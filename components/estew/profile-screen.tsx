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
      <div
        className="flex items-center justify-between px-5 pb-2 pt-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 8px) + 16px)" }}
      >
        <h1
          className="font-serif text-2xl font-bold"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
        >
          Profile
        </h1>
        <button
          className="glass flex items-center gap-1.5 rounded-full px-3"
          style={{ height: 32 }}
        >
          <Settings size={14} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
          <span className="font-sans text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>Edit</span>
        </button>
      </div>

      {/* Avatar + info - centered, generous whitespace */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center px-5 py-6"
      >
        <div
          className="mb-3 flex items-center justify-center rounded-full"
          style={{
            width: 80,
            height: 80,
            background: "linear-gradient(135deg, #0066FF, #4F46E5)",
            boxShadow: "0 4px 20px rgba(0, 102, 255, 0.3)",
          }}
        >
          <span className="font-serif text-2xl font-bold" style={{ color: "#FFFFFF" }}>
            {mockUser.displayName.charAt(0)}
          </span>
        </div>
        {/* Name - Fraunces 700, 22px */}
        <h2
          className="font-serif font-bold"
          style={{ color: "var(--text-primary)", fontSize: 22, lineHeight: 1.15 }}
        >
          {mockUser.displayName}
        </h2>
        {/* Handle - DM Sans 400, muted, small */}
        <p className="mt-0.5 font-sans text-[13px]" style={{ color: "var(--text-muted)" }}>
          {mockUser.email}
        </p>
        {/* Plan badge */}
        <div className="mt-2">
          {mockUser.plan === "pro" ? (
            <span
              className="rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase"
              style={{
                background: "linear-gradient(135deg, #0066FF, #4F46E5)",
                color: "#FFFFFF",
                letterSpacing: "0.08em",
              }}
            >
              PRO
            </span>
          ) : (
            <span
              className="glass rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase"
              style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
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
        style={{ borderRadius: 20 }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <BookOpen size={18} strokeWidth={1.5} style={{ color: "#0066FF" }} />
          <span className="font-sans text-lg font-bold" style={{ color: "var(--text-primary)" }}>{mockUser.articlesRead}</span>
          <span className="font-sans text-[10px]" style={{ color: "var(--text-muted)" }}>Read</span>
        </div>
        <div style={{ width: 1, height: 32, background: "var(--glass-border)" }} />
        <div className="flex flex-col items-center gap-0.5">
          <Bookmark size={18} strokeWidth={1.5} style={{ color: "#0066FF" }} />
          <span className="font-sans text-lg font-bold" style={{ color: "var(--text-primary)" }}>{mockUser.articlesSaved}</span>
          <span className="font-sans text-[10px]" style={{ color: "var(--text-muted)" }}>Saved</span>
        </div>
        <div style={{ width: 1, height: 32, background: "var(--glass-border)" }} />
        <div className="flex flex-col items-center gap-0.5">
          <Hash size={18} strokeWidth={1.5} style={{ color: "#0066FF" }} />
          <span className="font-sans text-lg font-bold" style={{ color: "var(--text-primary)" }}>{mockUser.topicsFollowed}</span>
          <span className="font-sans text-[10px]" style={{ color: "var(--text-muted)" }}>Topics</span>
        </div>
      </motion.div>

      {/* Upgrade card (warm amber/tan glass) for free users */}
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
            backdropFilter: "blur(20px)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
        >
          <h3 className="font-serif text-lg font-bold" style={{ color: "var(--text-primary)", lineHeight: 1.15 }}>
            Unlock Pro Features
          </h3>
          <p className="mt-1 font-sans text-[13px]" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Unlimited articles, extended newsletters, and advanced search for just $5.99/month.
          </p>
          <button
            className="spring-bounce mt-4 rounded-full px-6 font-sans text-[14px] font-semibold active:scale-[0.97]"
            style={{
              height: 44,
              background: "#0066FF",
              color: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(0, 102, 255, 0.35)",
            }}
          >
            Upgrade to Pro
          </button>
        </motion.div>
      )}

      {/* Account Settings - glass card group */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5"
      >
        <p
          className="mb-2 font-sans text-[12px] font-medium uppercase"
          style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
        >
          Account
        </p>
        <div className="glass overflow-hidden" style={{ borderRadius: 16 }}>
          {accountSettings.map((item) => (
            <button key={item.label} className="spring-smooth flex w-full items-center gap-3 px-4 py-3.5 active:opacity-70">
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 32, height: 32, background: `${item.color}20` }}
              >
                <item.icon size={16} strokeWidth={1.5} style={{ color: item.color }} />
              </div>
              <span className="flex-1 text-left font-sans text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>
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
        <p
          className="mb-2 font-sans text-[12px] font-medium uppercase"
          style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
        >
          App Settings
        </p>
        <div className="glass overflow-hidden" style={{ borderRadius: 16 }}>
          {appSettings.map((item) => (
            <button key={item.label} className="spring-smooth flex w-full items-center gap-3 px-4 py-3.5 active:opacity-70">
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 32, height: 32, background: `${item.color}20` }}
              >
                <item.icon size={16} strokeWidth={1.5} style={{ color: item.color }} />
              </div>
              <span
                className="flex-1 text-left font-sans text-[14px] font-medium"
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

      <p className="mt-6 text-center font-sans text-[11px]" style={{ color: "var(--text-muted)" }}>
        Member since September 2025
      </p>
    </div>
  )
}
