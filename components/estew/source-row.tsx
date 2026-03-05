"use client"

import { mockAgencies } from "@/lib/mock-data"
import { Compass } from "lucide-react"

export function SourceRow() {
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 py-3">
      {/* Discover circle */}
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            background: "linear-gradient(135deg, #0066FF, #4F46E5)",
          }}
        >
          <Compass size={24} strokeWidth={1.5} style={{ color: "#FFFFFF" }} />
        </div>
        <span
          className="w-14 truncate text-center font-sans text-[11px] font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Discover
        </span>
      </div>
      {/* Agency circles */}
      {mockAgencies.map((agency) => (
        <div key={agency.id} className="flex flex-col items-center gap-1.5">
          <div
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-full p-[2px]"
            style={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #0066FF, #4F46E5)",
            }}
          >
            <div
              className="flex h-full w-full items-center justify-center overflow-hidden rounded-full"
              style={{ background: "var(--bg-primary)" }}
            >
              <img
                src={agency.logoUrl}
                alt={agency.name}
                className="h-7 w-7 object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>
          <span
            className="w-14 truncate text-center font-sans text-[11px] font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {agency.name}
          </span>
        </div>
      ))}
    </div>
  )
}
