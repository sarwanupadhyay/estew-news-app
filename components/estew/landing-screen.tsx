"use client"

import { useState } from "react"
import { Mail, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Homepage } from "./homepage"

export function LandingScreen() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [showAuthScreen, setShowAuthScreen] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true)

  const handleGoogle = async () => {
    setLoading(true)
    setError("")
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed"
      if (msg.includes("popup-closed-by-user")) {
        setError("")
      } else if (msg.includes("auth/configuration-not-found") || msg.includes("auth/invalid-api-key")) {
        setError("Firebase not configured. Add API keys in Settings > Vars.")
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError("")
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, subscribeNewsletter)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed"
      if (msg.includes("auth/configuration-not-found") || msg.includes("auth/invalid-api-key")) {
        setError("Firebase not configured. Add API keys in Settings > Vars.")
      } else if (msg.includes("auth/user-not-found") || msg.includes("auth/invalid-credential")) {
        setError("Invalid email or password")
      } else if (msg.includes("auth/email-already-in-use")) {
        setError("Account already exists. Sign in instead.")
      } else if (msg.includes("auth/weak-password")) {
        setError("Password must be at least 6 characters")
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!showAuthScreen) {
    return <Homepage onGetStarted={() => setShowAuthScreen(true)} />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      {/* Back */}
      <button
        onClick={() => setShowAuthScreen(false)}
        className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4 h-16 w-16 animate-slide-up">
            <Image
              src="/images/logo.svg"
              alt="Estew"
              fill
              className="object-contain dark:invert"
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Auth */}
        <div className="flex flex-col gap-3">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex h-12 items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Email */}
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Mail size={18} />
              Continue with Email
            </button>
          ) : (
            <form onSubmit={handleEmail} className="flex flex-col gap-3 animate-fade-in">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border border-border bg-muted/30 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 w-full rounded-xl border border-border bg-muted/30 px-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {isSignUp && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subscribeNewsletter}
                    onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    Subscribe to our daily newsletter with AI-curated tech news
                  </span>
                </label>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Loading...
                  </>
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms-of-service" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
