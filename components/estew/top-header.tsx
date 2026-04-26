"use client"

import { Moon, Sun, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

export function TopHeader() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
  }

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)", paddingBottom: 12 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="relative h-7 w-7">
          <Image
            src="/images/logo.svg"
            alt="Estew"
            fill
            className="object-contain dark:invert"
          />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          estew
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={1.5} className="text-muted-foreground" />
        </button>
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-muted"
          aria-label="Toggle theme"
        >
          {dark ? (
            <Sun size={18} strokeWidth={1.5} className="text-muted-foreground" />
          ) : (
            <Moon size={18} strokeWidth={1.5} className="text-muted-foreground" />
          )}
        </button>
      </div>
    </header>
  )
}
