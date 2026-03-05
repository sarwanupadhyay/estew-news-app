"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CATEGORIES, mockCompanies } from "@/lib/mock-data"
import { ArrowRight, Check, Sparkles } from "lucide-react"

interface OnboardingScreenProps {
  onComplete: () => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const toggleCompany = (id: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  return (
    <div className="mesh-bg relative flex min-h-screen flex-col px-6 py-8">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 300, height: 300, top: -80, left: -80,
            background: "rgba(0, 102, 255, 0.12)", filter: "blur(80px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 250, height: 250, top: 160, right: -64,
            background: "rgba(79, 70, 229, 0.1)", filter: "blur(60px)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Step indicator */}
        <div className="mb-8 flex gap-2">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className="flex-1 rounded-full spring-smooth"
              style={{
                height: 4,
                background: s <= step ? "#0066FF" : "rgba(255, 255, 255, 0.15)",
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Topics */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col"
            >
              <h1
                className="mb-2 font-serif text-2xl font-bold"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
              >
                What topics interest you?
              </h1>
              <p className="mb-6 font-sans text-[14px]" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Select at least 2 topics to personalize your feed.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.filter((c) => c.value !== "All").map((cat) => {
                  const isSelected = selectedTopics.includes(cat.value)
                  const colorMap: Record<string, string> = {
                    AI: "#8B5CF6", Market: "#10B981", Launches: "#F59E0B",
                    Apps: "#3B82F6", Startups: "#EF4444", Products: "#EC4899",
                  }
                  const color = colorMap[cat.value] || "#6B7280"
                  return (
                    <button
                      key={cat.value}
                      onClick={() => toggleTopic(cat.value)}
                      className="spring-bounce relative flex flex-col items-center justify-center gap-2 py-6"
                      style={{
                        borderRadius: 20,
                        background: isSelected ? `${color}20` : "rgba(255, 255, 255, 0.12)",
                        border: isSelected ? `2px solid ${color}` : "1px solid rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(24px) saturate(180%)",
                        WebkitBackdropFilter: "blur(24px) saturate(180%)",
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      {isSelected && (
                        <div className="absolute right-2 top-2">
                          <Check size={16} strokeWidth={2} style={{ color }} />
                        </div>
                      )}
                      <div
                        className="flex items-center justify-center rounded-full font-sans font-bold"
                        style={{ width: 40, height: 40, background: color, color: "#FFFFFF" }}
                      >
                        {cat.label.charAt(0)}
                      </div>
                      <span
                        className="font-sans text-[13px] font-semibold"
                        style={{ color: isSelected ? color : "var(--text-primary)" }}
                      >
                        {cat.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Companies */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col"
            >
              <h1
                className="mb-2 font-serif text-2xl font-bold"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
              >
                Follow companies to track
              </h1>
              <p className="mb-6 font-sans text-[14px]" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Get updates when they make news.
              </p>

              <div className="flex flex-col gap-3">
                {mockCompanies.map((company) => {
                  const isSelected = selectedCompanies.includes(company.id)
                  return (
                    <button
                      key={company.id}
                      onClick={() => toggleCompany(company.id)}
                      className="spring-bounce flex items-center gap-3 p-3"
                      style={{
                        borderRadius: 20,
                        background: isSelected ? "rgba(0, 102, 255, 0.1)" : "rgba(255, 255, 255, 0.12)",
                        border: isSelected ? "2px solid rgba(0, 102, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(24px) saturate(180%)",
                        WebkitBackdropFilter: "blur(24px) saturate(180%)",
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <div
                        className="flex items-center justify-center overflow-hidden rounded-full"
                        style={{ width: 48, height: 48, background: "rgba(255,255,255,0.9)" }}
                      >
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="h-7 w-7 object-contain"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-sans text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                          {company.name}
                        </h3>
                        <p className="font-sans text-[12px]" style={{ color: "var(--text-muted)" }}>
                          {company.category}
                        </p>
                      </div>
                      {isSelected && <Check size={20} strokeWidth={2} style={{ color: "#0066FF" }} />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Step 3: Plan selection */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col"
            >
              <h1
                className="mb-2 font-serif text-2xl font-bold"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
              >
                Choose your plan
              </h1>
              <p className="mb-6 font-sans text-[14px]" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Start free, upgrade anytime.
              </p>

              <div className="flex flex-col gap-4">
                {/* Free plan - glass card */}
                <div
                  className="glass flex flex-col gap-3 p-5"
                  style={{ borderRadius: 20 }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold" style={{ color: "var(--text-primary)", lineHeight: 1.15 }}>
                      Free
                    </h3>
                    <span className="font-sans text-[13px] font-semibold" style={{ color: "var(--text-muted)" }}>$0/mo</span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {["20 articles/day", "1 newsletter topic", "Basic search", "Standard feed"].map((f) => (
                      <li key={f} className="flex items-center gap-2 font-sans text-[13px]" style={{ color: "var(--text-secondary)" }}>
                        <Check size={14} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onComplete}
                    className="spring-bounce glass mt-2 rounded-full font-sans text-[14px] font-semibold active:scale-[0.97]"
                    style={{ height: 44, color: "var(--text-primary)" }}
                  >
                    Start Free
                  </button>
                </div>

                {/* Pro plan - tinted glass */}
                <div
                  className="relative flex flex-col gap-3 overflow-hidden p-5"
                  style={{
                    borderRadius: 20,
                    background: "linear-gradient(135deg, rgba(0, 102, 255, 0.1), rgba(79, 70, 229, 0.08))",
                    border: "2px solid rgba(0, 102, 255, 0.3)",
                    backdropFilter: "blur(24px)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <div
                    className="absolute flex items-center justify-center rounded-full"
                    style={{
                      width: 64, height: 64, top: -16, right: -16,
                      background: "rgba(0, 102, 255, 0.15)",
                    }}
                  >
                    <Sparkles size={18} style={{ color: "#0066FF", marginLeft: -8, marginTop: 8 }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold" style={{ color: "var(--text-primary)", lineHeight: 1.15 }}>
                        Pro
                      </h3>
                      <span
                        className="rounded-full px-2 py-0.5 font-sans text-[9px] font-bold uppercase"
                        style={{
                          background: "linear-gradient(135deg, #0066FF, #4F46E5)",
                          color: "#FFFFFF",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Popular
                      </span>
                    </div>
                    <span className="font-sans text-[13px] font-semibold" style={{ color: "#0066FF" }}>$5.99/mo</span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {["Unlimited articles", "Refresh every 10 min", "Full profiles & search", "Extended newsletter", "Priority alerts"].map((f) => (
                      <li key={f} className="flex items-center gap-2 font-sans text-[13px]" style={{ color: "var(--text-secondary)" }}>
                        <Check size={14} strokeWidth={2} style={{ color: "#0066FF" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onComplete}
                    className="spring-bounce mt-2 rounded-full font-sans text-[14px] font-semibold active:scale-[0.97]"
                    style={{
                      height: 44,
                      background: "#0066FF",
                      color: "#FFFFFF",
                      boxShadow: "0 4px 20px rgba(0, 102, 255, 0.35)",
                    }}
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom action */}
        {step < 2 && (
          <div className="mt-auto pt-6">
            <button
              onClick={() => setStep(step + 1)}
              className="spring-bounce flex w-full items-center justify-center gap-2 rounded-full font-sans text-[15px] font-semibold active:scale-[0.97]"
              style={{
                height: 52,
                background: "#0066FF",
                color: "#FFFFFF",
                boxShadow: "0 4px 20px rgba(0, 102, 255, 0.35)",
              }}
            >
              Continue
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setStep(step + 1)}
              className="mt-3 w-full text-center font-sans text-[13px] font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
