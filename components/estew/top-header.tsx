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
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur-md"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)", paddingBottom: 12 }}
    >
      <div className="flex items-center gap-2.5">
        <Image
          src="/images/logo.png"
          alt="Estew logo"
          width={28}
          height={28}
          className="dark:invert"
        />
        <span className="font-serif text-xl font-bold tracking-tight text-foreground">
          estew
        </span>
      </div>

      <button
        onClick={toggleTheme}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
        aria-label="Toggle theme"
      >
        {dark ? (
          <Sun size={18} strokeWidth={1.5} className="text-muted-foreground" />
        ) : (
          <Moon size={18} strokeWidth={1.5} className="text-muted-foreground" />
        )}
      </button>
    </header>
  )
}
