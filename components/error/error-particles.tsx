"use client"

import { useEffect, useState } from "react"

/**
 * ErrorParticles — reusable floating ambient signal particles.
 *
 * Part of the "404 Error Page Animations" system (see globals.css). Renders
 * a full-bleed, non-interactive layer of softly drifting particles tinted
 * with the brand purple. Designed to sit behind any editorial error /
 * empty-state hero.
 *
 * Implementation notes:
 *  - Particle anchor positions are deterministic (12 fixed coordinates)
 *    so the visual distribution is consistent across visits.
 *  - Per-particle duration / delay / drift / size are randomised CLIENT
 *    SIDE ONLY — we render an empty container during SSR and mount the
 *    particles in a useEffect to avoid React hydration mismatches that
 *    would otherwise drop the inline styles silently.
 *  - Color is injected via inline `background` so this component is
 *    independent of however the host project exposes `--primary` (the
 *    raw Tailwind v4 token may be `oklch()`, `hsl()` channels, etc.).
 *  - Animation lives in CSS (.error-particle) so this stays cheap.
 */

const ANCHORS: ReadonlyArray<readonly [number, number]> = [
  [12, 78],
  [22, 58],
  [38, 72],
  [50, 88],
  [62, 60],
  [74, 78],
  [86, 64],
  [10, 38],
  [28, 28],
  [46, 46],
  [70, 32],
  [88, 18],
]

type Particle = {
  key: number
  style: React.CSSProperties
}

export function ErrorParticles() {
  // Empty during SSR / first paint, populated on mount. This guarantees
  // there's no React hydration mismatch from Math.random() running in
  // both environments.
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const next: Particle[] = ANCHORS.map(([x, y], i) => {
      const tx = (Math.random() - 0.5) * 120 // horizontal drift, ±60px
      const ty = -(80 + Math.random() * 100) // upward drift, 80–180px
      const duration = 7 + Math.random() * 6 // 7–13s
      const delay = i * 0.5 + Math.random() * 0.8 // staggered + jitter
      const size = 2.5 + Math.random() * 2.5 // 2.5–5px (visible on dark bg)

      return {
        key: i,
        style: {
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}px`,
          height: `${size}px`,
          // Hardcoded brand purple so we don't depend on theme-token
          // resolution. Matches the --primary used elsewhere in the app.
          background: "#a78bfa",
          // Soft glow makes the particle feel like a faint signal blip
          // rather than a stray pixel.
          boxShadow: "0 0 8px rgba(167, 139, 250, 0.6)",
          // CSS custom props consumed by the .error-particle keyframes.
          ["--dur" as string]: `${duration}s`,
          ["--delay" as string]: `${delay}s`,
          ["--tx" as string]: `${tx}px`,
          ["--ty" as string]: `${ty}px`,
        } as React.CSSProperties,
      }
    })
    setParticles(next)
  }, [])

  return (
    <div className="error-particles" aria-hidden="true">
      {particles.map((p) => (
        <span key={p.key} className="error-particle" style={p.style} />
      ))}
    </div>
  )
}
