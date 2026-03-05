"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CATEGORIES, mockCompanies } from "@/lib/mock-data"
import { ArrowRight, Check, Sparkles } from "lucide-react"
import Image from "next/image"

interface OnboardingScreenProps {
  onComplete: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  AI: "#8B5CF6",
  Market: "#10B981",
  Launches: "#F59E0B",
  Apps: "#3B82F6",
  Startups: "#EF4444",
  Products: "#EC4899",
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
    <div className="relative flex min-h-screen flex-col bg-background px-6 py-8">
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Logo + step indicator */}
        <div className="mb-6 flex items-center gap-3">
          <Image src="/images/logo.png" alt="Estew" width={24} height={24} className="dark:invert" />
          <div className="flex flex-1 gap-2">
            {[0, 1, 2].map((s) => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{
                  background: s <= step ? "var(--primary)" : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Topics */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col"
            >
              <h1 className="mb-1 font-serif text-2xl font-bold tracking-tight text-foreground">
                What interests you?
              </h1>
              <p className="mb-6 font-sans text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                Select at least 2 topics to personalize your feed.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.filter((c) => c.value !== "All").map((cat) => {
                  const isSelected = selectedTopics.includes(cat.value)
                  const color = CATEGORY_COLORS[cat.value] || "#6B7280"
                  return (
                    <button
                      key={cat.value}
                      onClick={() => toggleTopic(cat.value)}
                      className="relative flex flex-col items-center justify-center gap-2 rounded-xl border py-6 transition-colors active:scale-[0.97]"
                      style={{
                        background: isSelected ? `${color}15` : "var(--card)",
                        borderColor: isSelected ? color : "var(--border)",
                        borderWidth: isSelected ? 2 : 1,
                      }}
                    >
                      {isSelected && (
                        <div className="absolute right-2 top-2">
                          <Check size={16} strokeWidth={2} style={{ color }} />
                        </div>
                      )}
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full font-sans font-bold text-white"
                        style={{ background: color }}
                      >
                        {cat.label.charAt(0)}
                      </div>
                      <span
                        className="font-sans text-[13px] font-semibold"
                        style={{ color: isSelected ? color : "var(--foreground)" }}
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
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col"
            >
              <h1 className="mb-1 font-serif text-2xl font-bold tracking-tight text-foreground">
                Follow companies
              </h1>
              <p className="mb-6 font-sans text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                Get updates when they make news.
              </p>

              <div className="flex flex-col gap-3">
                {mockCompanies.map((company) => {
                  const isSelected = selectedCompanies.includes(company.id)
                  return (
                    <button
                      key={company.id}
                      onClick={() => toggleCompany(company.id)}
                      className="flex items-center gap-3 rounded-xl border p-3 transition-colors active:scale-[0.98]"
                      style={{
                        background: isSelected ? "var(--primary)" + "10" : "var(--card)",
                        borderColor: isSelected ? "var(--primary)" : "var(--border)",
                        borderWidth: isSelected ? 2 : 1,
                      }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted">
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="h-7 w-7 object-contain"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-sans text-[15px] font-semibold text-foreground">
                          {company.name}
                        </h3>
                        <p className="font-sans text-[12px] text-muted-foreground">
                          {company.category}
                        </p>
                      </div>
                      {isSelected && <Check size={20} strokeWidth={2} className="text-primary" />}
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
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col"
            >
              <h1 className="mb-1 font-serif text-2xl font-bold tracking-tight text-foreground">
                Choose your plan
              </h1>
              <p className="mb-6 font-sans text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                Start free, upgrade anytime.
              </p>

              <div className="flex flex-col gap-4">
                {/* Free plan */}
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-foreground">Free</h3>
                    <span className="font-sans text-[13px] font-semibold text-muted-foreground">$0/mo</span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {["20 articles/day", "1 newsletter topic", "Basic search", "Standard feed"].map((f) => (
                      <li key={f} className="flex items-center gap-2 font-sans text-[13px] text-muted-foreground">
                        <Check size={14} strokeWidth={2} className="text-muted-foreground" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onComplete}
                    className="mt-2 rounded-full border border-border bg-card py-3 font-sans text-[14px] font-semibold text-foreground transition-transform active:scale-[0.97]"
                  >
                    Start Free
                  </button>
                </div>

                {/* Pro plan - amber accent */}
                <div
                  className="relative flex flex-col gap-3 overflow-hidden rounded-xl p-5"
                  style={{
                    border: "2px solid var(--primary)",
                    background: "var(--card)",
                  }}
                >
                  <div className="absolute right-3 top-3">
                    <Sparkles size={16} className="text-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-foreground">Pro</h3>
                      <span className="rounded-full bg-primary px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                        Popular
                      </span>
                    </div>
                    <span className="font-sans text-[13px] font-semibold text-primary">$5.99/mo</span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {["Unlimited articles", "Refresh every 10 min", "Full profiles & search", "Extended newsletter", "Priority alerts"].map((f) => (
                      <li key={f} className="flex items-center gap-2 font-sans text-[13px] text-muted-foreground">
                        <Check size={14} strokeWidth={2} className="text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onComplete}
                    className="mt-2 rounded-full bg-primary py-3 font-sans text-[14px] font-semibold text-primary-foreground transition-transform active:scale-[0.97]"
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
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-sans text-[15px] font-semibold text-primary-foreground transition-transform active:scale-[0.97]"
            >
              Continue
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setStep(step + 1)}
              className="mt-3 w-full text-center font-sans text-[13px] font-medium text-muted-foreground"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
