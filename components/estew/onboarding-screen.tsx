"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { mockCompanies } from "@/lib/mock-data"
import { ArrowRight, Check, Sparkles, Bot, TrendingUp, Rocket, Smartphone, Zap, Package } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

const TOPIC_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  AI: Bot,
  Market: TrendingUp,
  Launches: Rocket,
  Apps: Smartphone,
  Startups: Zap,
  Products: Package,
}

const TOPICS = [
  { value: "AI", label: "AI" },
  { value: "Market", label: "Markets" },
  { value: "Launches", label: "Launches" },
  { value: "Apps", label: "Apps" },
  { value: "Startups", label: "Startups" },
  { value: "Products", label: "Products" },
]

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  handler: (response: { razorpay_payment_id: string }) => void
  prefill: { email: string }
  theme: { color: string }
}

interface RazorpayInstance {
  open: () => void
}

export function OnboardingScreen() {
  const { user, profile, completeOnboarding } = useAuth()
  const [step, setStep] = useState(0)
  const [selectedTopics, setSelectedTopics] = useState<string[]>(profile?.topics || [])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(profile?.companies || [])
  const [processingPayment, setProcessingPayment] = useState(false)
  const [processingFree, setProcessingFree] = useState(false)
  
  // Quick skip for returning users who might have ended up here due to errors
  const handleQuickSkip = async () => {
    setProcessingFree(true)
    try {
      // Pass existing values - completeOnboarding will preserve the user's existing plan
      await completeOnboarding(
        profile?.topics || selectedTopics, 
        profile?.companies || selectedCompanies, 
        profile?.plan || "free"
      )
    } catch (err) {
      console.error("Error skipping onboarding:", err)
    } finally {
      setProcessingFree(false)
    }
  }

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

  const handleFreePlan = async () => {
    setProcessingFree(true)
    try {
      await completeOnboarding(selectedTopics, selectedCompanies, "free")
    } catch (err) {
      console.error("Error selecting free plan:", err)
    } finally {
      setProcessingFree(false)
    }
  }

  const handleProPlan = async () => {
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!razorpayKey) {
      alert("Payment not configured. Please add Razorpay API keys.")
      return
    }

    setProcessingPayment(true)

    if (!window.Razorpay) {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      document.body.appendChild(script)
      await new Promise((resolve) => {
        script.onload = resolve
      })
    }

    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: 59900,
      currency: "INR",
      name: "Estew Pro",
      description: "Unlimited articles, AI summaries, priority alerts",
      handler: async function (response) {
        if (response.razorpay_payment_id) {
          await completeOnboarding(selectedTopics, selectedCompanies, "pro")
        }
        setProcessingPayment(false)
      },
      prefill: {
        email: user?.email || "",
      },
      theme: {
        color: "#7C3AED",
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
    setProcessingPayment(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="relative h-6 w-6">
          <Image src="/images/logo.svg" alt="Estew" fill className="object-contain dark:invert" />
        </div>
        <div className="flex flex-1 gap-1.5">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Topics */}
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="flex flex-1 flex-col"
          >
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              What interests you?
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Select topics to personalize your feed.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {TOPICS.map((cat) => {
                const isSelected = selectedTopics.includes(cat.value)
                const IconComponent = TOPIC_ICONS[cat.value]
                return (
                  <button
                    key={cat.value}
                    onClick={() => toggleTopic(cat.value)}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 transition-all press-effect ${
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute right-2 top-2">
                        <Check size={14} className="text-primary" />
                      </div>
                    )}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isSelected ? "bg-primary" : "bg-muted"
                    }`}>
                      {IconComponent && (
                        <IconComponent 
                          size={20} 
                          className={isSelected ? "text-primary-foreground" : "text-muted-foreground"} 
                        />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}>
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
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="flex flex-1 flex-col"
          >
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              Follow companies
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Get updates when they make news.
            </p>

            <div className="flex flex-col gap-2">
              {mockCompanies.map((company) => {
                const isSelected = selectedCompanies.includes(company.id)
                return (
                  <button
                    key={company.id}
                    onClick={() => toggleCompany(company.id)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all press-effect ${
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="h-6 w-6 object-contain"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-medium text-foreground">
                        {company.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {company.category}
                      </p>
                    </div>
                    {isSelected && <Check size={18} className="text-primary" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Step 3: Plan */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="flex flex-1 flex-col"
          >
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              Choose your plan
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Start free, upgrade anytime.
            </p>

            <div className="flex flex-col gap-4">
              {/* Free */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">Free</h3>
                  <span className="text-sm text-muted-foreground">Rs 0/mo</span>
                </div>
                <ul className="mb-4 flex flex-col gap-1.5">
                  {["20 articles/day", "1 newsletter topic", "Basic search", "Standard feed"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-muted-foreground" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleFreePlan}
                  disabled={processingPayment || processingFree}
                  className="w-full rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {processingFree ? "Setting up..." : "Start Free"}
                </button>
              </div>

              {/* Pro */}
              <div className="relative rounded-2xl border-2 border-primary bg-card p-5">
                <div className="absolute right-4 top-4">
                  <Sparkles size={16} className="text-primary" />
                </div>
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">Pro</h3>
                  <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
                    Popular
                  </span>
                </div>
                <p className="mb-3 text-sm text-primary">Rs 599/mo</p>
                <ul className="mb-4 flex flex-col gap-1.5">
                  {["Unlimited articles", "Refresh every 10 min", "Full profiles & search", "Extended newsletter", "Priority alerts"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleProPlan}
                  disabled={processingPayment}
                  className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {processingPayment ? "Processing..." : "Upgrade to Pro"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom */}
      {step < 2 && (
        <div className="mt-auto pt-6">
          <button
            onClick={() => setStep(step + 1)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Continue
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => setStep(step + 1)}
            className="mt-3 w-full text-center text-sm text-muted-foreground"
          >
            Skip for now
          </button>
          {/* Show "I already have an account" for users who might be returning */}
          <button
            onClick={handleQuickSkip}
            disabled={processingFree}
            className="mt-2 w-full text-center text-xs text-muted-foreground/70 hover:text-primary"
          >
            {processingFree ? "Loading..." : "I already have an account"}
          </button>
        </div>
      )}
    </div>
  )
}
