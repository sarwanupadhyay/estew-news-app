"use client"

import { Search, Mic } from "lucide-react"
import { trendingTopics, CATEGORIES, mockCompanies, mockAgencies } from "@/lib/mock-data"
import { formatViewCount } from "@/lib/time"
import { motion } from "framer-motion"
import { useState } from "react"

type Segment = "Topics" | "Companies" | "Sources"

export function ExploreScreen() {
  const [segment, setSegment] = useState<Segment>("Topics")

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 pb-2 pt-4">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Explore
        </h1>
      </div>

      {/* Search bar */}
      <div className="px-5 py-2">
        <div
          className="glass flex items-center gap-3 rounded-full px-4 py-3"
        >
          <Search size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
          <span className="flex-1 text-[15px]" style={{ color: "var(--text-muted)" }}>
            Topic, media or journalist
          </span>
          <Mic size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
        </div>
      </div>

      {/* Segmented control */}
      <div className="flex gap-1 px-5 py-2">
        {(["Topics", "Companies", "Sources"] as Segment[]).map((s) => (
          <button
            key={s}
            onClick={() => setSegment(s)}
            className="spring-bounce relative flex-1 rounded-full py-2 text-[13px] font-medium"
            style={{
              background: segment === s ? "rgba(0, 102, 255, 0.15)" : "transparent",
              color: segment === s ? "#0066FF" : "var(--text-muted)",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Topics - Trending bubbles */}
      {segment === "Topics" && (
        <div className="px-5 py-4">
          <h2 className="mb-4 font-serif text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Trending Topics
          </h2>
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
                  style={{ width: size, height: size, border: "2px solid rgba(255,255,255,0.3)" }}
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
                    <span className="px-1 text-center text-[11px] font-semibold leading-tight text-white">
                      {topic.name}
                    </span>
                    <span className="text-[9px] text-white/60">
                      {formatViewCount(topic.viewCount)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Explore by category */}
          <h2 className="mb-3 mt-8 font-serif text-lg font-bold" style={{ color: "var(--text-primary)" }}>
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
                  className="glass flex flex-col items-center justify-center gap-2 py-6"
                  style={{ background: colors[cat.value] || "var(--glass-bg)" }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
                    style={{ background: textColors[cat.value] || "#6B7280", color: "#fff" }}
                  >
                    {cat.label.charAt(0)}
                  </div>
                  <span className="text-[13px] font-semibold" style={{ color: textColors[cat.value] || "var(--text-primary)" }}>
                    {cat.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Companies */}
      {segment === "Companies" && (
        <div className="flex flex-col gap-3 px-5 py-4">
          {mockCompanies.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass flex items-center gap-3 p-3"
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white">
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-8 w-8 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  {company.name}
                </h3>
                <p className="line-clamp-1 text-[12px]" style={{ color: "var(--text-muted)" }}>
                  {company.description}
                </p>
              </div>
              <button
                className="spring-bounce rounded-full px-3 py-1.5 text-[12px] font-semibold text-white"
                style={{ background: "#0066FF" }}
              >
                Follow
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sources */}
      {segment === "Sources" && (
        <div className="flex flex-col gap-3 px-5 py-4">
          {mockAgencies.map((agency, i) => (
            <motion.div
              key={agency.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass flex items-center gap-3 p-3"
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white">
                <img
                  src={agency.logoUrl}
                  alt={agency.name}
                  className="h-8 w-8 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  {agency.name}
                </h3>
                <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                  {formatViewCount(agency.followerCount)} followers
                </p>
              </div>
              <button
                className="spring-bounce rounded-full px-3 py-1.5 text-[12px] font-semibold text-white"
                style={{ background: "#0066FF" }}
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
