"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, X } from "lucide-react"

interface StatusResponse {
  firebaseAdminReady: boolean
  firebaseAdminError: string | null
  env: Record<string, boolean>
}

export function SystemStatusBanner() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch("/api/admin-controls/status")
      .then((r) => r.json())
      .then((data) => setStatus(data))
      .catch(() => {})
  }, [])

  if (!status || dismissed) return null
  if (status.firebaseAdminReady) return null

  return (
    <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-3 lg:px-8">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
        <div className="flex-1">
          <p className="font-sans text-sm font-semibold text-destructive">
            Firebase Admin SDK is not configured — admin pages cannot fetch data
          </p>
          <p className="mt-1 font-sans text-xs leading-relaxed text-foreground/80">
            {status.firebaseAdminError || "FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid."}
          </p>
          <p className="mt-2 font-sans text-xs text-muted-foreground">
            Fix: Firebase Console → Project Settings → Service accounts → Generate new private key →
            paste the entire JSON file contents (starting with {"{"}) into the{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">FIREBASE_SERVICE_ACCOUNT_KEY</code>{" "}
            environment variable.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 rounded-md p-1 text-destructive/70 transition-colors hover:bg-destructive/20 hover:text-destructive"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
