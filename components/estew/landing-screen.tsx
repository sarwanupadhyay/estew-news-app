"use client"

import { motion } from "framer-motion"
import { Chrome, Mail, ArrowRight } from "lucide-react"

interface LandingScreenProps {
  onLogin: () => void
}

export function LandingScreen({ onLogin }: LandingScreenProps) {
  return (
    <div
      className="mesh-bg relative flex min-h-screen flex-col items-center justify-center px-8"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 350, height: 350, top: -80, left: -80,
            background: "rgba(0, 102, 255, 0.18)", filter: "blur(100px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 280, height: 280, top: 128, right: -64,
            background: "rgba(79, 70, 229, 0.14)", filter: "blur(80px)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 220, height: 220, bottom: 40,
            background: "rgba(96, 165, 250, 0.12)", filter: "blur(70px)",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="mb-6 flex items-center justify-center"
          style={{
            width: 80, height: 80, borderRadius: 24,
            background: "linear-gradient(135deg, #0066FF, #4F46E5)",
            boxShadow: "0 8px 40px rgba(0, 102, 255, 0.4)",
          }}
        >
          <span className="font-serif text-3xl font-bold" style={{ color: "#FFFFFF" }}>E</span>
        </motion.div>

        {/* Headline - Fraunces */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-2 text-center font-serif font-extrabold"
          style={{
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            fontSize: "clamp(28px, 5vw, 40px)",
            lineHeight: 1.15,
          }}
        >
          Estew
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10 text-center font-sans text-[15px]"
          style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
        >
          Tech news that never sleeps. Curated AI-powered updates every 10 minutes.
        </motion.p>

        {/* Auth buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex w-full flex-col gap-3"
        >
          {/* Google - glass secondary button */}
          <button
            onClick={onLogin}
            className="spring-bounce flex items-center justify-center gap-3 rounded-full font-sans text-[15px] font-semibold active:scale-[0.97]"
            style={{
              height: 52,
              color: "var(--text-primary)",
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3)",
            }}
          >
            <Chrome size={20} strokeWidth={1.5} />
            Continue with Google
          </button>
          {/* Email - primary CTA */}
          <button
            onClick={onLogin}
            className="spring-bounce flex items-center justify-center gap-3 rounded-full font-sans text-[15px] font-semibold active:scale-[0.97]"
            style={{
              height: 52,
              background: "#0066FF",
              color: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(0, 102, 255, 0.35)",
            }}
          >
            <Mail size={20} strokeWidth={1.5} />
            Continue with Email
          </button>
        </motion.div>

        {/* Skip */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onLogin}
          className="spring-bounce mt-6 flex items-center gap-1 font-sans text-[13px] font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          Skip for now
          <ArrowRight size={14} strokeWidth={1.5} />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center font-sans text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </div>
    </div>
  )
}
