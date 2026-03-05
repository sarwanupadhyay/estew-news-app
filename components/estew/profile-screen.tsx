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
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const accountSettings = [
  { icon: User, label: "Your Profile" },
  { icon: Heart, label: "Followed Topics" },
]

const appSettings = [
  { icon: Bell, label: "Notifications" },
  { icon: CreditCard, label: "Plan & Billing" },
  { icon: Mail, label: "Newsletter" },
  { icon: Clock, label: "Activity History" },
  { icon: LogOut, label: "Logout", destructive: true },
]

export function ProfileScreen() {
  return (
    <div className="flex flex-col pb-20">
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
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
          <span className="font-serif text-2xl font-bold text-primary-foreground">
            {mockUser.displayName.charAt(0)}
          </span>
        </div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {mockUser.displayName}
        </h2>
        <p className="mt-0.5 font-sans text-[13px] text-muted-foreground">
          {mockUser.email}
        </p>
        <div className="mt-2">
          <span
            className={`rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${
              mockUser.plan === "pro"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {mockUser.plan}
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
          { icon: BookOpen, value: mockUser.articlesRead, label: "Read" },
          { icon: Bookmark, value: mockUser.articlesSaved, label: "Saved" },
          { icon: Hash, value: mockUser.topicsFollowed, label: "Topics" },
        ].map((stat, i) => (
          <div key={stat.label} className="flex flex-col items-center gap-0.5">
            {i > 0 && <div className="sr-only" />}
            <stat.icon size={16} strokeWidth={1.5} className="text-primary" />
            <span className="font-sans text-lg font-bold text-foreground">{stat.value}</span>
            <span className="font-sans text-[10px] text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Upgrade CTA (amber warmth) */}
      {mockUser.plan === "free" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-5 mb-6 rounded-xl p-5"
          style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}
        >
          <h3 className="font-serif text-lg font-bold text-foreground">Unlock Pro</h3>
          <p className="mt-1 font-sans text-[13px] leading-relaxed text-muted-foreground">
            Unlimited articles, extended newsletters, advanced search. $5.99/month.
          </p>
          <button className="mt-4 rounded-full bg-primary px-6 py-2.5 font-sans text-[14px] font-semibold text-primary-foreground transition-transform active:scale-[0.97]">
            Upgrade to Pro
          </button>
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
              <item.icon size={16} strokeWidth={1.5} className={item.destructive ? "text-destructive" : "text-muted-foreground"} />
              <span className={`flex-1 text-left font-sans text-[14px] ${item.destructive ? "text-destructive" : "text-foreground"}`}>
                {item.label}
              </span>
              {!item.destructive && <ChevronRight size={14} strokeWidth={1.5} className="text-muted-foreground/50" />}
            </button>
          ))}
        </div>
      </motion.div>

      <p className="mt-6 text-center font-sans text-[11px] text-muted-foreground/60">
        Member since September 2025
      </p>
    </div>
  )
}
