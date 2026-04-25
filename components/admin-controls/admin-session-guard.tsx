"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Clock } from "lucide-react"

const EXPIRES_COOKIE_NAME = "estew_admin_expires_at"

function readExpiresAt(): number | null {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(EXPIRES_COOKIE_NAME + "="))
  if (!match) return null
  const value = match.slice(EXPIRES_COOKIE_NAME.length + 1)
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00"
  const totalSeconds = Math.floor(ms / 1000)
  const mm = Math.floor(totalSeconds / 60)
  const ss = totalSeconds % 60
  return `${mm}:${ss.toString().padStart(2, "0")}`
}

/**
 * Client-side enforcement of the 10-minute admin session.
 * - Reads the non-httpOnly expiry cookie set at login.
 * - Renders a small countdown chip in the bottom-right.
 * - At expiry, calls /logout to clear cookies and redirects to /admin-controls.
 *
 * The cookie itself has matching maxAge, so server requests will also be
 * rejected once expired — this component just guarantees a clean redirect
 * even if the admin has been idle on a single page for 10 minutes.
 */
export function AdminSessionGuard() {
  const router = useRouter()
  const [remaining, setRemaining] = useState<number | null>(null)
  const [expiringSoon, setExpiringSoon] = useState(false)

  const forceLogout = useCallback(async () => {
    try {
      await fetch("/api/admin-controls/logout", { method: "POST" })
    } catch {
      // ignore — cookies will already be expired server-side
    }
    router.replace("/admin-controls?reason=session-expired")
    router.refresh()
  }, [router])

  useEffect(() => {
    const expiresAt = readExpiresAt()
    if (!expiresAt) {
      // No expiry cookie present — either fresh deploy or already expired.
      // Trigger a refresh so the server-side guard can redirect cleanly.
      router.refresh()
      return
    }

    const tick = () => {
      const left = expiresAt - Date.now()
      setRemaining(left)
      setExpiringSoon(left > 0 && left <= 60_000)
      if (left <= 0) {
        forceLogout()
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [forceLogout, router])

  if (remaining === null || remaining <= 0) return null

  return (
    <div
      className={`pointer-events-none fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-[11px] font-medium tabular-nums shadow-sm backdrop-blur-md transition-colors ${
        expiringSoon
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border bg-card/80 text-muted-foreground"
      }`}
      role="status"
      aria-live="polite"
    >
      <Clock className="h-3 w-3" strokeWidth={2} />
      <span>Session {formatRemaining(remaining)}</span>
    </div>
  )
}
