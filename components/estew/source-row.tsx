"use client"

import { mockAgencies } from "@/lib/mock-data"

export function SourceRow() {
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 py-4">
      {mockAgencies.map((agency) => (
        <button key={agency.id} className="flex shrink-0 flex-col items-center gap-1.5">
          <div className="rounded-full p-[2px]"
            style={{ background: "linear-gradient(135deg, var(--primary), #D97706)" }}
          >
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-card">
              <img
                src={agency.logoUrl}
                alt={agency.name}
                className="h-8 w-8 object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>
          <span className="max-w-[64px] truncate text-center font-sans text-[11px] text-muted-foreground">
            {agency.name}
          </span>
        </button>
      ))}
    </div>
  )
}
