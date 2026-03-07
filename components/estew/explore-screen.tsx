"use client"

import { Search } from "lucide-react"
import { trendingTopics, CATEGORIES, mockCompanies, mockAgencies } from "@/lib/mock-data"
import { formatViewCount } from "@/lib/time"
import { motion } from "framer-motion"
import { useState } from "react"
import Image from "next/image"

type Segment = "Topics" | "Companies" | "Sources"

export function ExploreScreen() {
  const [segment, setSegment] = useState<Segment>("Topics")

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 pb-3 pt-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <div className="relative h-6 w-6">
          <Image src="/images/logo.png" alt="Estew" fill className="object-contain dark:invert" />
        </div>
        <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">
          Explore
        </h1>
      </div>

      {/* Search */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <Search size={16} strokeWidth={1.5} className="text-muted-foreground" />
          <span className="font-sans text-[14px] text-muted-foreground">
            Search topics, companies...
          </span>
        </div>
      </div>

      {/* Segmented control */}
      <div className="mx-5 mb-4 flex gap-1 rounded-xl bg-muted p-1">
        {(["Topics", "Companies", "Sources"] as Segment[]).map((s) => {
          const isActive = segment === s
          return (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={`flex-1 rounded-lg py-2 font-sans text-[13px] font-medium transition-all ${
                isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {s}
            </button>
          )
        })}
      </div>

      {/* Topics */}
      {segment === "Topics" && (
        <div className="px-5">
          <h2 className="mb-3 font-serif text-lg font-bold text-foreground">Trending Now</h2>
          <div className="flex flex-col gap-0">
            {trendingTopics.map((topic, i) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 border-b border-border py-3"
              >
                <span className="w-6 font-serif text-lg font-bold text-muted-foreground/50">
                  {i + 1}
                </span>
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <img src={topic.imageUrl} alt={topic.name} className="h-full w-full object-cover" crossOrigin="anonymous" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[14px] font-semibold text-foreground">{topic.name}</p>
                  <p className="font-sans text-[11px] text-muted-foreground">{formatViewCount(topic.viewCount)} mentions</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Category grid */}
          <h2 className="mb-3 mt-8 font-serif text-lg font-bold text-foreground">Browse Categories</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.filter((c) => c.value !== "All").map((cat, i) => {
              const isAmber = cat.value === "Launches" || cat.value === "Products"
              const isTeal = cat.value === "Market" || cat.value === "Apps"
              const bg = isAmber ? "rgba(217,119,6,0.08)" : isTeal ? "rgba(13,148,136,0.08)" : "var(--muted)"
              const borderColor = isAmber ? "rgba(217,119,6,0.2)" : isTeal ? "rgba(13,148,136,0.2)" : "var(--border)"
              const textColor = isAmber ? "#D97706" : isTeal ? "#0D9488" : "var(--foreground)"

              return (
                <motion.div
                  key={cat.value}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-6"
                  style={{ background: bg, border: `1px solid ${borderColor}` }}
                >
                  <span className="font-serif text-lg font-bold" style={{ color: textColor }}>
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
        <div className="flex flex-col px-5">
          {mockCompanies.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 border-b border-border py-3.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                <img src={company.logoUrl} alt={company.name} className="h-6 w-6 object-contain" crossOrigin="anonymous" />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-[14px] font-semibold text-foreground">{company.name}</h3>
                <p className="line-clamp-1 font-sans text-[12px] text-muted-foreground">{company.description}</p>
              </div>
              <button className="rounded-full bg-primary px-3.5 py-1.5 font-sans text-[12px] font-semibold text-primary-foreground transition-transform active:scale-[0.97]">
                Follow
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sources */}
      {segment === "Sources" && (
        <div className="flex flex-col px-5">
          {mockAgencies.map((agency, i) => (
            <motion.div
              key={agency.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 border-b border-border py-3.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                <img src={agency.logoUrl} alt={agency.name} className="h-6 w-6 object-contain" crossOrigin="anonymous" />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-[14px] font-semibold text-foreground">{agency.name}</h3>
                <p className="font-sans text-[12px] text-muted-foreground">{formatViewCount(agency.followerCount)} followers</p>
              </div>
              <button className="rounded-full bg-primary px-3.5 py-1.5 font-sans text-[12px] font-semibold text-primary-foreground transition-transform active:scale-[0.97]">
                Follow
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
