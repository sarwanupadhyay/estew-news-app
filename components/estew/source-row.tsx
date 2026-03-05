"use client"

import { mockAgencies } from "@/lib/mock-data"
import { Compass } from "lucide-react"

export function SourceRow() {
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 py-3">
      {/* Discover circle */}
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg, #0066FF, #4F46E5)" }}
        >
          <Compass size={24} strokeWidth={1.5} className="text-white" />
        </div>
        <span className="w-14 truncate text-center text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
          Discover
        </span>
      </div>
      {/* Agency circles */}
      {mockAgencies.map((agency) => (
        <div key={agency.id} className="flex flex-col items-center gap-1.5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full p-0.5"
            style={{
              background: "linear-gradient(135deg, #0066FF, #4F46E5)",
            }}
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
              <img
                src={agency.logoUrl}
                alt={agency.name}
                className="h-8 w-8 object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>
          <span className="w-14 truncate text-center text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
            {agency.name}
          </span>
        </div>
      ))}
    </div>
  )
}
