"use client"

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
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="font-serif text-base font-bold">E</span>
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-base font-semibold leading-none text-foreground">Estew</span>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Admin Controls</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/admin-controls/dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
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
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-serif text-sm font-bold">E</span>
          </div>
          <span className="font-serif text-sm font-semibold text-foreground">Admin Controls</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-foreground hover:bg-secondary"
        >
          <Menu className="h-5 w-5" />
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
              <X className="h-5 w-5" />
            </button>
            {navContent}
          </div>
        </div>
      )}
    </>
  )
}
