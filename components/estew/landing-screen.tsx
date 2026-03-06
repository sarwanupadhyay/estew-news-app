"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

export function LandingScreen() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
        await signUpWithEmail(email, password)
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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-8">
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        {/* Logo image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="mb-5"
        >
          <Image
            src="/images/logo.png"
            alt="Estew logo"
            width={72}
            height={72}
            className="dark:invert"
            style={{ width: 72, height: 'auto' }}
            priority
          />
        </motion.div>

        {/* App name */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-1 font-serif text-3xl font-bold tracking-tight text-foreground"
        >
          Estew
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          className="mb-10 text-center font-sans text-sm text-muted-foreground"
          style={{ lineHeight: 1.6 }}
        >
          Tech news that never sleeps.
        </motion.p>

        {/* Error display */}
        {error && (
          <div className="mb-4 w-full rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-center font-sans text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Auth buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex w-full flex-col gap-3"
        >
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex h-[52px] items-center justify-center gap-3 rounded-xl border border-border bg-card font-sans text-sm font-semibold text-foreground transition-colors hover:bg-muted active:scale-[0.98] disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Email toggle */}
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="flex h-[52px] items-center justify-center gap-3 rounded-xl bg-primary font-sans text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              <Mail size={18} strokeWidth={1.5} />
              Continue with Email
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleEmail}
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-[48px] rounded-xl border border-border bg-input px-4 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-[48px] w-full rounded-xl border border-border bg-input px-4 pr-12 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex h-[52px] items-center justify-center rounded-xl bg-primary font-sans text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </motion.form>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-8 text-center font-sans text-[11px] text-muted-foreground"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </div>
    </div>
  )
}
