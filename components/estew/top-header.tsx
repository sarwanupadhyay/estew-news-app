"use client"

import { Bell, Search } from "lucide-react"
import { useAppStore } from "@/lib/store"

export function TopHeader() {
  const { setActiveTab } = useAppStore()

  return (
    <header className="glass sticky top-0 z-40 mx-0 flex items-center justify-between rounded-none border-x-0 border-t-0 px-5 py-3" style={{ borderRadius: 0 }}>
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg, #0066FF, #4F46E5)" }}
        >
          <span className="font-serif text-sm font-bold text-white">E</span>
        </div>
        <h1 className="font-serif text-xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Estew
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("explore")}
          className="glass flex h-9 w-9 items-center justify-center rounded-full"
        >
          <Search size={18} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
        </button>
        <button className="glass flex h-9 w-9 items-center justify-center rounded-full">
          <Bell size={18} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
    </header>
  )
}
