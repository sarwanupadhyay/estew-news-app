"use client"

import { Bell, Plus, Menu, Moon, Sun } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useState } from "react"

export function TopHeader() {
  const { setActiveTab } = useAppStore()
  const [dark, setDark] = useState(false)

  const toggleDark = () => {
    setDark(!dark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header
      className="glass sticky top-0 z-40 flex items-center justify-between px-5 py-3"
      style={{
        borderRadius: 0,
        borderLeft: "none",
        borderRight: "none",
        borderTop: "none",
        paddingTop: "calc(env(safe-area-inset-top, 8px) + 12px)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #0066FF, #4F46E5)",
            boxShadow: "0 2px 12px rgba(0, 102, 255, 0.3)",
          }}
        >
          <span className="font-serif text-sm font-bold" style={{ color: "#FFFFFF" }}>E</span>
        </div>
        <h1
          className="font-serif text-xl font-bold"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Estew
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="glass flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}
        >
          <Plus size={18} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
        </button>
        <button
          onClick={toggleDark}
          className="glass flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}
        >
          {dark ? (
            <Sun size={18} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
          ) : (
            <Moon size={18} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
          )}
        </button>
        <button
          onClick={() => setActiveTab("explore")}
          className="glass flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}
        >
          <Menu size={18} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
    </header>
  )
}
