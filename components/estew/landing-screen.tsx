"use client"

import { motion } from "framer-motion"
import { Chrome, Mail, ArrowRight } from "lucide-react"

interface LandingScreenProps {
  onLogin: () => void
}

export function LandingScreen({ onLogin }: LandingScreenProps) {
  return (
    <div className="mesh-bg relative flex min-h-screen flex-col items-center justify-center px-8">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 -top-20 h-[350px] w-[350px] rounded-full"
          style={{ background: "rgba(0, 102, 255, 0.18)", filter: "blur(100px)" }}
        />
        <div
          className="absolute -right-16 top-32 h-[280px] w-[280px] rounded-full"
          style={{ background: "rgba(79, 70, 229, 0.14)", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-10 left-1/2 h-[220px] w-[220px] -translate-x-1/2 rounded-full"
          style={{ background: "rgba(96, 165, 250, 0.12)", filter: "blur(70px)" }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{
            background: "linear-gradient(135deg, #0066FF, #4F46E5)",
            boxShadow: "0 8px 40px rgba(0, 102, 255, 0.4)",
          }}
        >
          <span className="font-serif text-3xl font-bold text-white">E</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-2 text-center font-serif text-3xl font-extrabold"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Estew
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10 text-center text-[15px] leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
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
          <button
            onClick={onLogin}
            className="spring-bounce glass flex items-center justify-center gap-3 rounded-full py-3.5 font-sans text-[15px] font-semibold active:scale-[0.97]"
            style={{ color: "var(--text-primary)" }}
          >
            <Chrome size={20} strokeWidth={1.5} />
            Continue with Google
          </button>
          <button
            onClick={onLogin}
            className="spring-bounce flex items-center justify-center gap-3 rounded-full py-3.5 font-sans text-[15px] font-semibold text-white active:scale-[0.97]"
            style={{ background: "#0066FF", boxShadow: "0 4px 20px rgba(0, 102, 255, 0.35)" }}
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
          className="spring-bounce mt-6 flex items-center gap-1 text-[13px] font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          Skip for now
          <ArrowRight size={14} strokeWidth={1.5} />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </div>
    </div>
  )
}
