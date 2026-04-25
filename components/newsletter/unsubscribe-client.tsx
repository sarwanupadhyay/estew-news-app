"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

type Status = "idle" | "loading" | "success" | "error"

export function UnsubscribeClient({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [email, setEmail] = useState("")

  if (!token) {
    return (
      <Card>
        <Header />
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <AlertCircle size={36} strokeWidth={1.5} className="text-destructive" />
          <h2 className="font-serif text-xl font-bold tracking-tight text-foreground">
            Invalid unsubscribe link
          </h2>
          <p className="font-sans text-sm leading-relaxed text-muted-foreground">
            This unsubscribe link is missing or malformed. Please use the
            Unsubscribe link in the most recent newsletter we sent you.
          </p>
        </div>
      </Card>
    )
  }

  const handleConfirm = async () => {
    setStatus("loading")
    setErrorMsg("")
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setErrorMsg(data?.error || "Failed to unsubscribe. Please try again.")
        return
      }
      setEmail(data?.email || "")
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setErrorMsg((err as Error).message)
    }
  }

  if (status === "success") {
    return (
      <Card>
        <Header />
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <CheckCircle2 size={40} strokeWidth={1.5} className="text-primary" />
          <h2 className="font-serif text-xl font-bold tracking-tight text-foreground">
            You&apos;ve been unsubscribed
          </h2>
          <p className="font-sans text-sm leading-relaxed text-muted-foreground">
            {email ? (
              <>
                We&apos;ve removed{" "}
                <span className="font-medium text-foreground">{email}</span> from
                the Estew newsletter list. You won&apos;t receive any more
                briefings.
              </>
            ) : (
              "We've removed your email from the Estew newsletter list."
            )}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 font-sans text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Back to Estew
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <Header />
      <div className="mt-6 flex flex-col gap-3 text-center">
        <Mail size={36} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
        <h2 className="font-serif text-xl font-bold tracking-tight text-foreground">
          Unsubscribe from Estew?
        </h2>
        <p className="font-sans text-sm leading-relaxed text-muted-foreground">
          You&apos;ll stop receiving the daily Estew newsletter. You can resubscribe
          anytime from your profile settings.
        </p>
      </div>

      {status === "error" && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center font-sans text-xs text-destructive">
          {errorMsg}
        </div>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={status === "loading"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-5 py-3 font-sans text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Unsubscribing…
          </>
        ) : (
          "Confirm unsubscribe"
        )}
      </button>

      <Link
        href="/"
        className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-border px-5 py-3 font-sans text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        Keep my subscription
      </Link>
    </Card>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      {children}
    </div>
  )
}

function Header() {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <div className="relative h-7 w-7">
        <Image
          src="/images/logo.svg"
          alt="Estew"
          fill
          className="object-contain dark:invert"
        />
      </div>
      <span className="font-serif text-2xl font-extrabold tracking-tight text-foreground">
        Estew<span className="text-destructive">.</span>
      </span>
    </div>
  )
}
