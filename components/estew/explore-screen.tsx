"use client"

import { Search, Mic } from "lucide-react"
import { trendingTopics, CATEGORIES, mockCompanies, mockAgencies } from "@/lib/mock-data"
import { formatViewCount } from "@/lib/time"
import { motion } from "framer-motion"
import { useState } from "react"

type Segment = "People" | "Company" | "Days"

export function ExploreScreen() {
  const [segment, setSegment] = useState<Segment>("People")

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 pb-2 pt-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 8px) + 16px)" }}>
        <h1
          className="font-serif text-2xl font-bold"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
        >
          Explore
        </h1>
      </div>

      {/* Search bar - glass pill */}
      <div className="px-5 py-2">
        <div
          className="flex items-center gap-3 rounded-full px-4"
          style={{
            height: 48,
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3)",
          }}
        >
          <Search size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
          <span className="flex-1 font-sans text-[15px]" style={{ color: "var(--text-muted)" }}>
            Topic, media or journalist
          </span>
          <Mic size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
        </div>
      </div>

      {/* Segmented control */}
      <div
        className="mx-5 my-2 flex gap-1 rounded-full p-1"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        {(["People", "Company", "Days"] as Segment[]).map((s) => {
          const isActive = segment === s
          return (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className="spring-bounce relative flex-1 rounded-full py-2 font-sans text-[13px] font-medium"
              style={{
                background: isActive ? "rgba(0, 102, 255, 0.15)" : "transparent",
                border: isActive ? "1px solid rgba(0, 102, 255, 0.3)" : "1px solid transparent",
                color: isActive ? "#0066FF" : "var(--text-muted)",
              }}
            >
              {s}
            </button>
          )
        })}
      </div>

      {/* People/Topics - Trending bubbles */}
      {segment === "People" && (
        <div className="px-5 py-4">
          <h2
            className="mb-4 font-serif text-lg font-bold"
            style={{ color: "var(--text-primary)", lineHeight: 1.15 }}
          >
            Trending Topics
          </h2>
          {/* Organic bubble layout */}
          <div className="flex flex-wrap justify-center gap-3">
            {trendingTopics.map((topic, i) => {
              const sizes = [120, 100, 100, 88, 80, 80]
              const size = sizes[i] || 80
              return (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 25 }}
                  className="relative flex-shrink-0 overflow-hidden rounded-full"
                  style={{
                    width: size,
                    height: size,
                    border: "2px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <img
                    src={topic.imageUrl}
                    alt={topic.name}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  >
                    <span className="px-1 text-center font-sans text-[11px] font-semibold leading-tight" style={{ color: "#FFFFFF" }}>
                      {topic.name}
                    </span>
                    <span className="font-sans text-[9px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {formatViewCount(topic.viewCount)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Explore by category - 2-col glass cards with flat illustration style */}
          <h2
            className="mb-3 mt-8 font-serif text-lg font-bold"
            style={{ color: "var(--text-primary)", lineHeight: 1.15 }}
          >
            Explore by Category
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.filter((c) => c.value !== "All").map((cat, i) => {
              const colors: Record<string, string> = {
                AI: "rgba(139, 92, 246, 0.15)",
                Market: "rgba(16, 185, 129, 0.15)",
                Launches: "rgba(245, 158, 11, 0.15)",
                Apps: "rgba(59, 130, 246, 0.15)",
                Startups: "rgba(239, 68, 68, 0.15)",
                Products: "rgba(236, 72, 153, 0.15)",
              }
              const textColors: Record<string, string> = {
                AI: "#8B5CF6",
                Market: "#10B981",
                Launches: "#F59E0B",
                Apps: "#3B82F6",
                Startups: "#EF4444",
                Products: "#EC4899",
              }
              return (
                <motion.div
                  key={cat.value}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex flex-col items-center justify-center gap-2 py-6"
                  style={{
                    borderRadius: 20,
                    background: colors[cat.value] || "var(--glass-bg)",
                    backdropFilter: "blur(24px) saturate(180%)",
                    WebkitBackdropFilter: "blur(24px) saturate(180%)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-full font-sans text-lg font-bold"
                    style={{
                      width: 40,
                      height: 40,
                      background: textColors[cat.value] || "#6B7280",
                      color: "#FFFFFF",
                    }}
                  >
                    {cat.label.charAt(0)}
                  </div>
                  <span
                    className="font-sans text-[13px] font-semibold"
                    style={{ color: textColors[cat.value] || "var(--text-primary)" }}
                  >
                    {cat.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Company */}
      {segment === "Company" && (
        <div className="flex flex-col gap-3 px-5 py-4">
          {mockCompanies.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass flex items-center gap-3 p-3"
              style={{ borderRadius: 20 }}
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
              <div className="flex-1">
                <h3 className="font-sans text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  {company.name}
                </h3>
                <p className="line-clamp-1 font-sans text-[12px]" style={{ color: "var(--text-muted)" }}>
                  {company.description}
                </p>
              </div>
              <button
                className="spring-bounce rounded-full px-3 py-1.5 font-sans text-[12px] font-semibold active:scale-[0.97]"
                style={{
                  background: "#0066FF",
                  color: "#FFFFFF",
                  boxShadow: "0 2px 12px rgba(0, 102, 255, 0.25)",
                }}
              >
                Follow
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Days/Sources */}
      {segment === "Days" && (
        <div className="flex flex-col gap-3 px-5 py-4">
          {mockAgencies.map((agency, i) => (
            <motion.div
              key={agency.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass flex items-center gap-3 p-3"
              style={{ borderRadius: 20 }}
            >
              <div
                className="flex items-center justify-center overflow-hidden rounded-full"
                style={{ width: 48, height: 48, background: "rgba(255,255,255,0.9)" }}
              >
                <img
                  src={agency.logoUrl}
                  alt={agency.name}
                  className="h-7 w-7 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  {agency.name}
                </h3>
                <p className="font-sans text-[12px]" style={{ color: "var(--text-muted)" }}>
                  {formatViewCount(agency.followerCount)} followers
                </p>
              </div>
              <button
                className="spring-bounce rounded-full px-3 py-1.5 font-sans text-[12px] font-semibold active:scale-[0.97]"
                style={{
                  background: "#0066FF",
                  color: "#FFFFFF",
                  boxShadow: "0 2px 12px rgba(0, 102, 255, 0.25)",
                }}
              >
                Follow
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
