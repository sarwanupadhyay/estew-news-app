"use client"

import { Moon, Sun } from "lucide-react"
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
      className="sticky top-0 z-40 flex items-center justify-between bg-background/95 px-4 backdrop-blur-sm"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)", paddingBottom: 12 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="relative h-6 w-6">
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

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
        aria-label="Toggle theme"
      >
        {dark ? (
          <Sun size={18} className="text-muted-foreground" />
        ) : (
          <Moon size={18} className="text-muted-foreground" />
        )}
      </button>
    </header>
  )
}
