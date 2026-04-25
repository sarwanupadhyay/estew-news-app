"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Mail,
  Star,
  Send,
  LogOut,
  Menu,
  X,
  Activity,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/admin-controls/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin-controls/articles", label: "Articles", icon: Newspaper },
  { href: "/admin-controls/users", label: "Users", icon: Users },
  { href: "/admin-controls/newsletter", label: "Newsletter", icon: Send },
  { href: "/admin-controls/newsletter-subscribers", label: "Newsletter Subscribers", icon: Mail },
  { href: "/admin-controls/pro-subscribers", label: "Pro Subscribers", icon: Star },
  { href: "/admin-controls/diagnostics", label: "Diagnostics", icon: Activity },
]

function EstewBrand({ size = "md" }: { size?: "sm" | "md" }) {
  const dimensions = size === "sm" ? "h-7 w-7" : "h-8 w-8"
  const wordmarkSize = size === "sm" ? "text-[15px]" : "text-[17px]"
  const taglineSize = size === "sm" ? "text-[10px]" : "text-[11px]"

  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative shrink-0 ${dimensions}`}>
        <Image
          src="/images/logo.svg"
          alt="Estew"
          fill
          className="object-contain dark:invert"
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-sans font-semibold tracking-tight text-foreground ${wordmarkSize}`}>
          estew
        </span>
        <span className={`mt-1 font-sans font-medium uppercase tracking-[0.14em] text-muted-foreground ${taglineSize}`}>
          Admin Controls
        </span>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/admin-controls/logout", { method: "POST" })
    router.push("/admin-controls")
    router.refresh()
  }

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <EstewBrand />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/admin-controls/dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 font-sans text-[13px] transition-colors ${
                    isActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "font-normal text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 font-sans text-[13px] font-normal text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <EstewBrand size="sm" />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-foreground hover:bg-secondary"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-card shadow-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
            {navContent}
          </div>
        </div>
      )}
    </>
  )
}
