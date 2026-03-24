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
    <div className="flex flex-col bg-background pb-20">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border bg-card px-4 pb-3 pt-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <div className="relative h-6 w-6">
          <Image src="/images/logo.svg" alt="Estew" fill className="object-contain dark:invert" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Explore</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
          <Search size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Search topics, companies...
          </span>
        </div>
      </div>

      {/* Segmented control */}
      <div className="mx-4 mb-4 flex gap-1 rounded-xl bg-muted p-1">
        {(["Topics", "Companies", "Sources"] as Segment[]).map((s) => {
          const isActive = segment === s
          return (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                isActive ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {s}
            </button>
          )
        })}
      </div>

      {/* Topics */}
      {segment === "Topics" && (
        <div className="px-4">
          <h2 className="mb-3 text-base font-semibold text-foreground">Trending Now</h2>
          <div className="flex flex-col">
            {trendingTopics.map((topic, i) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 border-b border-border/50 py-3"
              >
                <span className="w-5 text-sm font-semibold text-muted-foreground/50">
                  {i + 1}
                </span>
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                  <img src={topic.imageUrl} alt={topic.name} className="h-full w-full object-cover" crossOrigin="anonymous" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{topic.name}</p>
                  <p className="text-xs text-muted-foreground">{formatViewCount(topic.viewCount)} mentions</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Category grid */}
          <h2 className="mb-3 mt-6 text-base font-semibold text-foreground">Browse Categories</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.filter((c) => c.value !== "All").map((cat, i) => (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card py-5 transition-colors hover:bg-muted/50"
              >
                <span className="text-base font-semibold text-foreground">
                  {cat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Companies */}
      {segment === "Companies" && (
        <div className="flex flex-col px-4">
          {mockCompanies.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 border-b border-border/50 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                <img src={company.logoUrl} alt={company.name} className="h-6 w-6 object-contain" crossOrigin="anonymous" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">{company.name}</h3>
                <p className="line-clamp-1 text-xs text-muted-foreground">{company.description}</p>
              </div>
              <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Follow
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sources */}
      {segment === "Sources" && (
        <div className="flex flex-col px-4">
          {mockAgencies.map((agency, i) => (
            <motion.div
              key={agency.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 border-b border-border/50 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                <img src={agency.logoUrl} alt={agency.name} className="h-6 w-6 object-contain" crossOrigin="anonymous" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">{agency.name}</h3>
                <p className="text-xs text-muted-foreground">{formatViewCount(agency.followerCount)} followers</p>
              </div>
              <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Follow
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
